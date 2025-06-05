import uuid
import decimal
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from venues.models import Venue

class Booking(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        HELD = 'HELD', 'Held'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        EXPIRED = 'EXPIRED', 'Expired'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class PricingUnit(models.TextChoices):
        HOUR = 'hour', 'Per Hour'
        DAY = 'day', 'Per Day'

    # Identification
    booking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    venue = models.ForeignKey(Venue, related_name='bookings', on_delete=models.PROTECT)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='bookings', on_delete=models.PROTECT)

    # Schedule
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    is_full_day = models.BooleanField(default=False)

    # Pricing Details (Immutable after confirmation)
    base_rate_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    pricing_unit = models.CharField(max_length=4, choices=PricingUnit.choices)
    quantity = models.PositiveIntegerField()  # Number of hours/days
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2)
    vendor_payout = models.DecimalField(max_digits=10, decimal_places=2)

    # Status and Timestamps
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    hold_expiration_at = models.DateTimeField(null=True, blank=True)

    # Payment Information
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
            ('REFUNDED', 'Refunded'),
        ],
        default='PENDING'
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    refund_status = models.CharField(
        max_length=20,
        choices=[
            ('NONE', 'None'),
            ('PENDING', 'Pending'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
        ],
        default='NONE'
    )
    refund_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['venue', 'start_datetime', 'end_datetime']),
            models.Index(fields=['user', 'status']),
        ]
        constraints = [
            # Prevent overlapping bookings for the same venue
            models.CheckConstraint(
                check=models.Q(end_datetime__gt=models.F('start_datetime')),
                name='valid_booking_period'
            )
        ]

    def clean(self):
        if self.start_datetime and self.end_datetime:
            if self.start_datetime >= self.end_datetime:
                raise ValidationError('End datetime must be after start datetime')
            
            if self.is_full_day:
                # For full day bookings, ensure times are midnight to midnight
                if self.start_datetime.time() != timezone.datetime.min.time() or \
                   self.end_datetime.time() != timezone.datetime.min.time():
                    raise ValidationError('Full day bookings must start and end at midnight')

    def save(self, *args, **kwargs):
        self.clean()
        # Calculate duration based on pricing unit
        if self.pricing_unit == self.PricingUnit.HOUR:
            duration = (self.end_datetime - self.start_datetime).total_seconds() / 3600
            self.quantity = int(duration)
        else:  # daily
            duration = (self.end_datetime - self.start_datetime).days
            self.quantity = duration

        # Calculate pricing if not already set
        if not self.pk or not self.subtotal:  # New booking or pricing not calculated
            self.subtotal = self.base_rate_snapshot * decimal.Decimal(str(self.quantity))
            # Add 18% GST
            self.tax_amount = self.subtotal * decimal.Decimal('0.18')
            # Platform fee is 5% of subtotal
            self.platform_fee = self.subtotal * decimal.Decimal('0.05')
            self.total_amount = self.subtotal + self.tax_amount + self.platform_fee
            # Platform commission is 10% of subtotal
            self.platform_commission = self.subtotal * decimal.Decimal('0.10')
            self.vendor_payout = self.subtotal - self.platform_commission

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.booking_id} - {self.venue.name} ({self.status})"

    def update_payment_status(self, payment_id, status='COMPLETED'):
        """Update payment status and related fields"""
        self.payment_id = payment_id
        self.payment_status = status
        self.payment_amount = self.total_amount if status == 'COMPLETED' else None
        self.save()

    def initiate_refund(self):
        """Initiate refund for the booking"""
        if self.payment_status != 'COMPLETED':
            raise ValueError("Cannot refund booking without completed payment")
        
        if self.refund_status != 'NONE':
            raise ValueError("Refund already initiated")

        from .razorpay_utils import RazorpayClient
        client = RazorpayClient()
        
        try:
            refund = client.initiate_refund(self.payment_id)
            self.refund_id = refund['id']
            self.refund_status = 'PENDING'
            self.save()
            return refund
        except Exception as e:
            self.refund_status = 'FAILED'
            self.save()
            raise ValueError(f"Refund initiation failed: {str(e)}")

    def update_refund_status(self, status):
        """Update refund status"""
        valid_statuses = ['PENDING', 'COMPLETED', 'FAILED']
        if status not in valid_statuses:
            raise ValueError(f"Invalid refund status. Must be one of {valid_statuses}")
        
        self.refund_status = status
        self.save()

    def is_slot_available(self):
        """Check if the venue is available for the requested time slot."""
        overlapping = Booking.objects.filter(
            venue=self.venue,
            status__in=[self.Status.HELD, self.Status.CONFIRMED],
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime
        ).exclude(pk=self.booking_id)
        return not overlapping.exists()

    def can_be_cancelled(self):
        """Check if booking can be cancelled based on status and time."""
        if self.status != self.Status.CONFIRMED:
            return False
        # Add any additional cancellation policy checks here
        return True

class BookingStateLog(models.Model):
    booking = models.ForeignKey(Booking, related_name='state_logs', on_delete=models.CASCADE)
    old_status = models.CharField(max_length=10, choices=Booking.Status.choices)
    new_status = models.CharField(max_length=10, choices=Booking.Status.choices)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='booking_state_changes',
        on_delete=models.SET_NULL
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.booking.booking_id}: {self.old_status} → {self.new_status}"
