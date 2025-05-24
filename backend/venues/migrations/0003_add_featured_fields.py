# Generated migration for adding featured venue fields to Venue model

from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('venues', '0002_booking_payment_amount_booking_payment_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='venue',
            name='is_featured',
            field=models.BooleanField(default=False, help_text='Mark as True to highlight as featured venue.'),
        ),
        migrations.AddField(
            model_name='venue',
            name='featured_priority',
            field=models.PositiveIntegerField(default=0, help_text='Lower number = higher display priority.'),
        ),
        migrations.AddField(
            model_name='venue',
            name='featured_tagline',
            field=models.CharField(blank=True, help_text='Custom tagline for featured display.', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='venue',
            name='featured_from',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='venue',
            name='featured_until',
            field=models.DateField(blank=True, null=True),
        ),
    ]
