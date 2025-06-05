from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, BookingStateLogViewSet, PaymentTestView

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

# Nested router for booking state logs
booking_state_logs_router = DefaultRouter()
booking_state_logs_router.register(r'logs', BookingStateLogViewSet, basename='booking-state-log')

urlpatterns = [
    path('', include(router.urls)),
    path('bookings/<uuid:booking_id>/', include(booking_state_logs_router.urls)),
    # Payment-related endpoints
    path('bookings/<uuid:booking_id>/verify-payment/', 
         BookingViewSet.as_view({'post': 'verify_payment'}), 
         name='booking-verify-payment'),
    path('razorpay/webhook/', 
         BookingViewSet.as_view({'post': 'webhook'}), 
         name='razorpay-webhook'),
    # Payment test page
    path('test-payment/', PaymentTestView.as_view(), name='test-payment'),
]
