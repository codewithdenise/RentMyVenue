from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Removes superuser privileges from all superuser accounts'

    def handle(self, *args, **options):
        # Get all superusers
        superusers = User.objects.filter(is_superuser=True)
        count = superusers.count()

        if count == 0:
            self.stdout.write(self.style.WARNING('No superusers found.'))
            return

        # Remove superuser and staff privileges
        superusers.update(is_superuser=False, is_staff=False)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully removed superuser privileges from {count} account(s)'
            )
        )
