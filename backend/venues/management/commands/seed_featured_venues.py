from django.core.management.base import BaseCommand
from django.utils import timezone
from venues.models import Venue
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed featured venues for testing'

    def handle(self, *args, **options):
        venues = Venue.objects.all()[:20]  # Get first 20 venues
        if not venues:
            self.stdout.write(self.style.ERROR('No venues found to seed featured venues.'))
            return

        today = timezone.now().date()
        count = 0

        for venue in venues:
            if count >= 8:
                break
            venue.is_featured = True
            venue.featured_from = today - timedelta(days=random.randint(0, 10))
            venue.featured_until = today + timedelta(days=random.randint(10, 30))
            venue.featured_priority = random.randint(1, 5)
            venue.save()
            count += 1
            self.stdout.write(self.style.SUCCESS(f'Seeded featured venue: {venue.name}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} featured venues.'))
