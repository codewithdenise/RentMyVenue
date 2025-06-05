from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView, TokenBlacklistView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='api_register'),
    path('register', views.RegisterView.as_view(), name='api_register_no_slash'),

    path('login/', views.LoginView.as_view(), name='api_login'),
    path('login', views.LoginView.as_view(), name='api_login_no_slash'),

    path('login/otp/verify/', views.OTPVerifyView.as_view(), name='api_login_otp_verify'),
    path('login/otp/verify', views.OTPVerifyView.as_view(), name='api_login_otp_verify_no_slash'),

    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/refresh', views.CustomTokenRefreshView.as_view(), name='token_refresh_no_slash'),

    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/verify', TokenVerifyView.as_view(), name='token_verify_no_slash'),

    path('logout/', views.CustomTokenBlacklistView.as_view(), name='token_logout'),
    path('logout', views.CustomTokenBlacklistView.as_view(), name='token_logout_no_slash'),

    path('me/', views.UserProfileView.as_view(), name='api_user_profile'),
    path('me', views.UserProfileView.as_view(), name='api_user_profile_no_slash'),
]
