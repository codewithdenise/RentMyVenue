from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, throttling
from django.core.cache import cache
from django.conf import settings
from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer,
    OTPVerifySerializer, UserSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'register'

    def post(self, request):
        email = request.data.get('email')
        if email:
            try:
                user = User.objects.get(email__iexact=email)
                if not user.email_verified:
                    # Resend OTP
                    import random
                    from django.core.cache import cache
                    from .serializers import send_otp_email

                    code = f"{random.randint(0, 999999):06d}"
                    cache.set(f"otp_signup:{user.email}", code, timeout=300)
                    cache.set(f"otp_signup_attempts:{user.email}", 0, timeout=300)
                    send_otp_email(user.email, code)
                    data = UserSerializer(user).data
                    return Response({"detail": "User already registered but not verified. OTP resent to your email.", "user": data},
                                    status=status.HTTP_200_OK)
                else:
                    return Response({"detail": "User with this email already exists and is verified."},
                                    status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                pass

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # User created but email_verified=False until OTP verified
            data = UserSerializer(user).data
            return Response({"detail": "User registered. Please verify OTP sent to your email to activate account.", "user": data},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'login'
    authentication_classes = []
    
    def get_serializer(self):
        return LoginSerializer()

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            serializer.send_otp()  # Send OTP automatically for 2FA
            return Response({"detail": "Password verified. OTP sent to your email. Please verify OTP to complete login."},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'otp_verify'
    
    def get_serializer(self):
        return OTPVerifySerializer()

    def post(self, request):
        otp_type = request.query_params.get('type', 'login')  # 'signup' or 'login'
        serializer = OTPVerifySerializer(data=request.data, context={'otp_type': otp_type})
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_type == 'signup':
                # Mark email_verified True on signup OTP verification
                user.email_verified = True
                user.is_active = True
                user.save()
                return Response({"detail": "Email verified successfully. You can now login."}, status=status.HTTP_200_OK)

            elif otp_type == 'login':
                if not user.email_verified:
                    return Response({"detail": "Email not verified. Please verify your email first."}, status=status.HTTP_400_BAD_REQUEST)
                if not user.is_active:
                    return Response({"detail": "User account is disabled."}, status=status.HTTP_400_BAD_REQUEST)
                # Issue JWT tokens on successful OTP login verification
                refresh = RefreshToken.for_user(user)
                data = {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data
                }
                return Response(data, status=status.HTTP_200_OK)

            else:
                return Response({"detail": "Invalid OTP verification type."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Token refresh and logout views use SimpleJWT built-in views
class CustomTokenRefreshView(TokenRefreshView):
    throttle_scope = 'token_refresh'

class CustomTokenBlacklistView(TokenBlacklistView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

