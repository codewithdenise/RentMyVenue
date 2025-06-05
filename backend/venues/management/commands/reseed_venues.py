from django.core.management.base import BaseCommand
from venues.models import Venue
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset and reseed venues'

    def handle(self, *args, **options):
        self.stdout.write('Deleting all existing venues...')
        Venue.objects.all().delete()

        self.stdout.write('Running seed_indian_venues command...')
        from django.core.management import call_command
        call_command('seed_indian_venues')

        # Update all venues to be published
        venues_updated = Venue.objects.exclude(status=Venue.Status.PUBLISHED).update(
            status=Venue.Status.PUBLISHED,
            last_status_changed_at=timezone.now()
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully reseeded venues and set all to published status.'
            )
        )
