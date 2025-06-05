from django.utils import timezone
from django.db import transaction
from .models import Booking

def expire_held_bookings():
    """
    Task to expire held bookings that have passed their hold expiration time.
    This should be run periodically (e.g., every minute) via a task scheduler.
    """
    with transaction.atomic():
        # Find all HELD bookings that have expired
        expired_bookings = Booking.objects.filter(
            status=Booking.Status.HELD,
            hold_expiration_at__lt=timezone.now()
        ).select_for_update()

        # Update their status to EXPIRED
        for booking in expired_bookings:
            booking.status = Booking.Status.EXPIRED
            booking.save()

from notifications.service import send_email, send_push_notifications_to_user
from django.db.models import Sum, Count
import logging

logger = logging.getLogger(__name__)

def cleanup_expired_bookings():
    """
    Task to clean up old expired bookings.
    This can be run less frequently (e.g., daily) to archive or delete very old expired bookings.
    """
    # Find expired bookings older than 30 days
    cutoff_date = timezone.now() - timezone.timedelta(days=30)
    old_expired_bookings = Booking.objects.filter(
        status=Booking.Status.EXPIRED,
        updated_at__lt=cutoff_date
    )

    # Delete old expired bookings
    count, _ = old_expired_bookings.delete()
    logger.info(f"Deleted {count} expired bookings older than 30 days.")

def send_booking_reminders():
    """
    Task to send reminders for upcoming confirmed bookings.
    This can be run daily to notify users and vendors about their upcoming bookings.
    """
    # Find confirmed bookings happening tomorrow
    tomorrow = timezone.now().date() + timezone.timedelta(days=1)
    upcoming_bookings = Booking.objects.filter(
        status=Booking.Status.CONFIRMED,
        start_datetime__date=tomorrow
    ).select_related('user', 'venue', 'venue__owner')

    for booking in upcoming_bookings:
        # Send reminder email to user
        send_email(
            to_email=booking.user.email,
            subject="Booking Reminder",
            body=f"Reminder: Your booking at {booking.venue.name} is tomorrow on {booking.start_datetime.strftime('%Y-%m-%d %H:%M')}."
        )
        send_push_notifications_to_user(
            booking.user,
            "Booking Reminder",
            f"Reminder: Your booking at {booking.venue.name} is tomorrow on {booking.start_datetime.strftime('%Y-%m-%d %H:%M')}."
        )

        # Send reminder email to vendor
        send_email(
            to_email=booking.venue.owner.email,
            subject="Venue Booking Reminder",
            body=f"Reminder: {booking.venue.name} is booked for tomorrow on {booking.start_datetime.strftime('%Y-%m-%d %H:%M')}."
        )
        send_push_notifications_to_user(
            booking.venue.owner,
            "Venue Booking Reminder",
            f"Reminder: {booking.venue.name} is booked for tomorrow on {booking.start_datetime.strftime('%Y-%m-%d %H:%M')}."
        )

def generate_booking_reports():
    """
    Task to generate daily/weekly/monthly booking reports.
    This can be run at scheduled intervals to generate business analytics.
    """
    today = timezone.now().date()
    # Daily revenue report
    daily_revenue = Booking.objects.filter(
        status=Booking.Status.CONFIRMED,
        start_datetime__date=today
    ).aggregate(total_revenue=Sum('total_amount'))['total_revenue'] or 0

    # Daily booking count by venue
    booking_counts = Booking.objects.filter(
        status=Booking.Status.CONFIRMED,
        start_datetime__date=today
    ).values('venue__name').annotate(count=Count('id')).order_by('-count')

    report = f"Daily Booking Report for {today}:\nTotal Revenue: ₹{daily_revenue}\nBookings by Venue:\n"
    for item in booking_counts:
        report += f"- {item['venue__name']}: {item['count']} bookings\n"

    logger.info(report)
