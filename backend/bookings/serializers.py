from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingStateLog
from venues.models import Venue

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'venue', 'start_datetime', 'end_datetime', 'is_full_day',
            'base_rate_snapshot', 'pricing_unit', 'quantity', 'subtotal',
            'tax_amount', 'platform_fee', 'total_amount', 'platform_commission',
            'vendor_payout'
        ]
        read_only_fields = [
            'base_rate_snapshot', 'pricing_unit', 'quantity', 'subtotal',
            'tax_amount', 'platform_fee', 'total_amount', 'platform_commission',
            'vendor_payout'
        ]

    def validate(self, data):
        # Ensure start_datetime is in the future
        if data['start_datetime'] <= timezone.now():
            raise serializers.ValidationError("Booking must be for a future date/time")

        # Set pricing unit based on is_full_day
        data['pricing_unit'] = Booking.PricingUnit.DAY if data['is_full_day'] else Booking.PricingUnit.HOUR

        # Calculate quantity based on duration
        if data['pricing_unit'] == Booking.PricingUnit.HOUR:
            duration = (data['end_datetime'] - data['start_datetime']).total_seconds() / 3600
            data['quantity'] = int(duration)
        else:  # daily
            duration = (data['end_datetime'] - data['start_datetime']).days
            data['quantity'] = duration

        # Fetch and set base rate from venue
        venue = data['venue']
        # TODO: Add base_rate field to Venue model and use it here
        data['base_rate_snapshot'] = 1000  # Placeholder: Replace with actual venue rate

        # Calculate pricing fields
        subtotal = data['base_rate_snapshot'] * data['quantity']
        data['subtotal'] = subtotal
        data['tax_amount'] = subtotal * 0.18  # 18% GST
        data['platform_fee'] = subtotal * 0.05  # 5% platform fee
        data['total_amount'] = subtotal + data['tax_amount'] + data['platform_fee']
        data['platform_commission'] = subtotal * 0.10  # 10% platform commission
        data['vendor_payout'] = subtotal - data['platform_commission']

        # Validate slot availability
        booking = Booking(
            venue=data['venue'],
            start_datetime=data['start_datetime'],
            end_datetime=data['end_datetime']
        )
        if not booking.is_slot_available():
            raise serializers.ValidationError("This time slot is not available")

        return data

    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        # Set initial status as HELD
        validated_data['status'] = Booking.Status.HELD
        return super().create(validated_data)

class BookingDetailSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    refund_status_display = serializers.CharField(source='get_refund_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'booking_id', 'venue', 'venue_name', 'start_datetime', 'end_datetime',
            'is_full_day', 'status', 'status_display', 'base_rate_snapshot',
            'pricing_unit', 'quantity', 'subtotal', 'tax_amount', 'platform_fee',
            'total_amount', 'created_at', 'updated_at', 'hold_expiration_at',
            'razorpay_order_id', 'payment_id', 'payment_status', 'payment_status_display',
            'payment_amount', 'refund_status', 'refund_status_display', 'refund_id'
        ]
        read_only_fields = [
            'booking_id', 'venue', 'base_rate_snapshot', 'pricing_unit',
            'quantity', 'subtotal', 'tax_amount', 'platform_fee', 'total_amount',
            'created_at', 'updated_at', 'hold_expiration_at', 'razorpay_order_id',
            'payment_id', 'payment_status', 'payment_amount', 'refund_status', 'refund_id'
        ]

class BookingStateLogSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.EmailField(source='changed_by.email', read_only=True)

    class Meta:
        model = BookingStateLog
        fields = [
            'booking', 'old_status', 'new_status', 'changed_at',
            'changed_by_email', 'notes'
        ]
        read_only_fields = ['changed_at', 'changed_by_email']
