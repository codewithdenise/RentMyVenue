from django.core.management.base import BaseCommand
from venues.models import Venue
from django.utils import timezone

class Command(BaseCommand):
    help = 'Update all venues to published status'

    def handle(self, *args, **options):
        self.stdout.write('Updating all venues to published status...')
        
        # Update all venues to published status
        updated_count = Venue.objects.exclude(status=Venue.Status.PUBLISHED).update(
            status=Venue.Status.PUBLISHED,
            last_status_changed_at=timezone.now()
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} venues to published status.'
            )
        )
