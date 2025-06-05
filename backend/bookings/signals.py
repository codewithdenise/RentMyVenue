from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Booking, BookingStateLog
from notifications.service import send_email, send_push_notifications_to_user

@receiver(pre_save, sender=Booking)
def log_booking_state_change(sender, instance, **kwargs):
    """Log booking state changes and send notifications."""
    if not instance.pk:  # New booking
        return

    try:
        old_instance = Booking.objects.get(pk=instance.pk)
        if old_instance.status != instance.status:
            BookingStateLog.objects.create(
                booking=instance,
                old_status=old_instance.status,
                new_status=instance.status,
                # changed_by will be set in the view
            )

            # Set hold expiration for HELD bookings
            if instance.status == Booking.Status.HELD:
                instance.hold_expiration_at = timezone.now() + timezone.timedelta(minutes=15)

                # Send notification to customer
                send_email(
                    to_email=instance.user.email,
                    subject="Booking Held - Action Required",
                    body=f"Your booking for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has been held pending payment. Please complete payment within 15 minutes to confirm."
                )
                send_push_notifications_to_user(
                    instance.user,
                    "Booking Held - Action Required",
                    f"Your booking for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has been held pending payment. Please complete payment within 15 minutes to confirm."
                )

            elif instance.status == Booking.Status.CONFIRMED:
                # Send confirmation email to customer
                send_email(
                    to_email=instance.user.email,
                    subject="Booking Confirmed",
                    body=f"Your booking for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} is confirmed. Booking ID: {instance.booking_id}. Amount paid: ₹{instance.total_amount}."
                )
                send_push_notifications_to_user(
                    instance.user,
                    "Booking Confirmed",
                    f"Your booking for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} is confirmed. Booking ID: {instance.booking_id}."
                )

                # Send notification to vendor
                vendor_email = instance.venue.owner.email
                send_email(
                    to_email=vendor_email,
                    subject="Venue Booked",
                    body=f"Your venue {instance.venue.name} is booked on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')}. Customer: {instance.user.get_full_name()}. Payout: ₹{instance.vendor_payout}."
                )
                send_push_notifications_to_user(
                    instance.venue.owner,
                    "Venue Booked",
                    f"Your venue {instance.venue.name} is booked on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')}. Customer: {instance.user.get_full_name()}."
                )

            elif instance.status == Booking.Status.EXPIRED:
                # Send expiration email to customer
                send_email(
                    to_email=instance.user.email,
                    subject="Booking Hold Expired",
                    body=f"Your booking hold for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has expired as payment was not received in time. You can make a new booking if you still wish to reserve the venue."
                )
                send_push_notifications_to_user(
                    instance.user,
                    "Booking Hold Expired",
                    f"Your booking hold for {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has expired."
                )

                # Notify vendor about expiration
                vendor_email = instance.venue.owner.email
                send_email(
                    to_email=vendor_email,
                    subject="Booking Hold Expired",
                    body=f"The pending booking hold for your venue {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has expired and the date is now available."
                )
                send_push_notifications_to_user(
                    instance.venue.owner,
                    "Booking Hold Expired",
                    f"The pending booking hold for your venue {instance.venue.name} on {instance.start_datetime.strftime('%Y-%m-%d %H:%M')} has expired and the date is now available."
                )

            elif instance.status == Booking.Status.CANCELLED:
                # Send cancellation and refund email to customer
                send_email(
                    to_email=instance.user.email,
                    subject="Booking Cancelled and Refunded",
                    body=f"Your booking {instance.booking_id} has been cancelled and a refund of ₹{instance.total_amount} has been processed. It may take a few days to reflect in your account."
                )
                send_push_notifications_to_user(
                    instance.user,
                    "Booking Cancelled and Refunded",
                    f"Your booking {instance.booking_id} has been cancelled and a refund has been processed."
                )

                # Notify vendor about cancellation
                vendor_email = instance.venue.owner.email
                send_email(
                    to_email=vendor_email,
                    subject="Booking Cancelled",
                    body=f"Booking {instance.booking_id} was cancelled by the user. The slot is now open. No payout will be given for this booking."
                )
                send_push_notifications_to_user(
                    instance.venue.owner,
                    "Booking Cancelled",
                    f"Booking {instance.booking_id} was cancelled by the user. The slot is now open."
                )

            elif instance.status != Booking.Status.HELD:
                instance.hold_expiration_at = None

    except Booking.DoesNotExist:
        pass
