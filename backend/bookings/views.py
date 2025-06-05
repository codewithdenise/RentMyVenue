from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.generic import TemplateView
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Booking, BookingStateLog
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingStateLogSerializer
)
from accounts.permissions import IsVendorUser

class BookingViewSet(mixins.CreateModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    """
    ViewSet for managing bookings.
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'booking_id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Admin', 'Vendor']:
            # Admins can see all bookings
            # Vendors can see bookings for their venues
            queryset = Booking.objects.all()
            if user.role == 'Vendor':
                queryset = queryset.filter(venue__owner=user)
        else:
            # Regular users can only see their own bookings
            queryset = Booking.objects.filter(user=user)
        
        return queryset.select_related('venue', 'user')

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingDetailSerializer

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Return bookings for the authenticated user.
        """
        user = request.user
        bookings = Booking.objects.filter(user=user).select_related('venue', 'user')
        serializer = BookingDetailSerializer(bookings, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new booking and initialize Razorpay order."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        # Create Razorpay order
        try:
            from .razorpay_utils import RazorpayClient
            client = RazorpayClient()
            order = client.create_order(booking)
            booking.razorpay_order_id = order['id']
            booking.save()
        except Exception as e:
            # If order creation fails, delete the booking and raise error
            booking.delete()
            return Response(
                {'detail': f'Failed to create payment order: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                **BookingDetailSerializer(booking).data,
                'razorpay_key_id': settings.RAZORPAY_KEY_ID,
                'razorpay_order_id': booking.razorpay_order_id,
                'amount': int(booking.total_amount * 100),  # Amount in paise
                'currency': settings.RAZORPAY_CURRENCY,
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def verify_payment(self, request, booking_id=None):
        """
        Verify payment and confirm booking.
        This endpoint should be called by the frontend after successful payment.
        """
        booking = self.get_object()
        
        if booking.status != Booking.Status.HELD:
            return Response(
                {"detail": "Only HELD bookings can be confirmed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify payment signature
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')

        if not all([payment_id, order_id, signature]):
            return Response(
                {"detail": "Missing payment verification details"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .razorpay_utils import RazorpayClient
            client = RazorpayClient()
            
            # Verify payment signature
            if not client.verify_payment_signature(payment_id, order_id, signature):
                raise ValueError("Invalid payment signature")

            # Update booking status
            booking.status = Booking.Status.CONFIRMED
            booking.update_payment_status(payment_id, 'COMPLETED')
            booking.save()

            return Response(BookingDetailSerializer(booking).data)
        except Exception as e:
            booking.update_payment_status(payment_id, 'FAILED')
            return Response(
                {"detail": f"Payment verification failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, booking_id=None):
        """Cancel a confirmed booking and initiate refund if applicable."""
        booking = self.get_object()

        if not booking.can_be_cancelled():
            return Response(
                {"detail": "This booking cannot be cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if booking.payment_status == 'COMPLETED':
                # Initiate refund
                refund = booking.initiate_refund()
                booking.status = Booking.Status.CANCELLED
                booking.save()
                return Response({
                    **BookingDetailSerializer(booking).data,
                    'refund_id': refund['id']
                })
            else:
                booking.status = Booking.Status.CANCELLED
                booking.save()
                return Response(BookingDetailSerializer(booking).data)
        except Exception as e:
            return Response(
                {"detail": f"Cancellation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def expire(self, request, booking_id=None):
        """
        Expire a held booking.
        This endpoint should be called by the scheduled task.
        """
        booking = self.get_object()

        if booking.status != Booking.Status.HELD:
            return Response(
                {"detail": "Only HELD bookings can expire"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.hold_expiration_at > timezone.now():
            return Response(
                {"detail": "Booking hold has not expired yet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = Booking.Status.EXPIRED
        booking.save()

        return Response(BookingDetailSerializer(booking).data)

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def webhook(self, request):
        """
        Handle Razorpay webhook events
        """
        # Verify webhook signature
        webhook_signature = request.headers.get('X-Razorpay-Signature')
        if not webhook_signature:
            return Response(
                {"detail": "Missing webhook signature"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify webhook signature using webhook secret
            from .razorpay_utils import RazorpayClient
            client = RazorpayClient()
            event_data = request.data

            # Handle different webhook events
            event_type = event_data.get('event')
            if event_type == 'payment.captured':
                payment_id = event_data['payload']['payment']['entity']['id']
                order_id = event_data['payload']['payment']['entity']['order_id']
                
                # Update booking payment status
                booking = Booking.objects.get(razorpay_order_id=order_id)
                booking.update_payment_status(payment_id, 'COMPLETED')
                
            elif event_type == 'refund.processed':
                refund_id = event_data['payload']['refund']['entity']['id']
                payment_id = event_data['payload']['refund']['entity']['payment_id']
                
                # Update booking refund status
                booking = Booking.objects.get(payment_id=payment_id)
                booking.update_refund_status('COMPLETED')

            return Response({'status': 'success'})
        except Exception as e:
            return Response(
                {"detail": f"Webhook processing failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentTestView(TemplateView):
    template_name = 'payment.html'

class BookingStateLogViewSet(mixins.ListModelMixin,
                           viewsets.GenericViewSet):
    """
    ViewSet for viewing booking state logs.
    """
    serializer_class = BookingStateLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        booking_id = self.kwargs.get('booking_id')
        booking = get_object_or_404(Booking, booking_id=booking_id)
        
        # Check if user has permission to view logs
        user = self.request.user
        if user.role == 'Admin':
            return booking.state_logs.all()
        elif user.role == 'Vendor' and booking.venue.owner == user:
            return booking.state_logs.all()
        elif booking.user == user:
            return booking.state_logs.all()
        return BookingStateLog.objects.none()
