from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.conf import settings
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
import random

def send_otp_email(email, code):
    subject = "Your One-Time Password (OTP)"
    message = f"Your OTP code is: {code}. It will expire in 5 minutes."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)
    send_mail(subject, message, from_email, [email], fail_silently=False)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'role', 'first_name', 'last_name']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.get('role', User.Role.USER)
        if role == User.Role.ADMIN:
            role = User.Role.USER  # Prevent creating admin via API
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=role,
            email_verified=False,
            first_name=first_name,
            last_name=last_name,
        )
        # Generate OTP and send automatically for signup verification
        code = f"{random.randint(0, 999999):06d}"
        cache.set(f"otp_signup:{user.email}", code, timeout=300)
        cache.set(f"otp_signup_attempts:{user.email}", 0, timeout=300)
        send_otp_email(user.email, code)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=User.Role.choices)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        if hasattr(user, 'email_verified') and not user.email_verified:
            raise serializers.ValidationError("Email not verified. Please verify your email before login.")
        if user.role != role:
            raise serializers.ValidationError(f"User role mismatch. Expected role: {role}.")
        data['user'] = user
        return data

    def send_otp(self):
        user = self.validated_data['user']
        code = f"{random.randint(0, 999999):06d}"
        cache.set(f"otp_login:{user.email}", code, timeout=300)
        cache.set(f"otp_login_attempts:{user.email}", 0, timeout=300)
        send_otp_email(user.email, code)

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')
        # Determine if this is signup or login OTP verification
        # Context should provide 'otp_type' as 'signup' or 'login'
        otp_type = self.context.get('otp_type', 'login')
        cache_key = f"otp_{otp_type}:{email}"
        attempts_key = f"otp_{otp_type}_attempts:{email}"

        cached_otp = cache.get(cache_key)
        if cached_otp is None:
            raise serializers.ValidationError("OTP expired or invalid. Please request a new code.")

        attempts = cache.get(attempts_key) or 0
        if attempts >= 5:
            raise serializers.ValidationError("Too many incorrect attempts. Please request a new OTP.")

        if otp != cached_otp:
            cache.set(attempts_key, attempts + 1, timeout=300)
            raise serializers.ValidationError("Incorrect OTP. Please try again.")

        # OTP is correct, invalidate it
        cache.delete(cache_key)
        cache.delete(attempts_key)
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'email_verified']
