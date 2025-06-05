from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Clear all data from the database while preserving schema'

    def add_arguments(self, parser):
        parser.add_argument(
            '--preserve-superuser',
            action='store_true',
            help='Preserve superuser accounts',
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting to clear all data from the database...')
        
        # Get models in correct order to handle dependencies
        models_to_clear = [
            # First clear dependent models
            ('bookings', 'bookingstatelog'),
            ('bookings', 'booking'),
            ('notifications', 'devicetoken'),
            ('venues', 'auditlog'),
            ('venues', 'image'),
            ('venues', 'venue'),
            ('venues', 'amenity'),
            ('venues', 'category'),
            ('venues', 'tehsil'),
            ('venues', 'district'),
            ('venues', 'state'),
            # Clear users last since they might be referenced by other models
            ('accounts', 'user'),
        ]

        try:
            with transaction.atomic():
                for app_label, model_name in models_to_clear:
                    model = apps.get_model(app_label, model_name)
                    self.stdout.write(f'Deleting all data from {app_label}.{model_name}...')
                    
                    # Special handling for User model if preserve-superuser is set
                    if model_name == 'user' and options['preserve_superuser']:
                        model.objects.filter(is_superuser=False).delete()
                        self.stdout.write(self.style.SUCCESS(f'Deleted all non-superuser accounts'))
                    else:
                        model.objects.all().delete()
                        self.stdout.write(self.style.SUCCESS(f'Deleted all data from {app_label}.{model_name}'))

            self.stdout.write(self.style.SUCCESS('Successfully cleared all data from the database.'))
            
            if options['preserve_superuser']:
                User = get_user_model()
                superusers = User.objects.filter(is_superuser=True)
                if superusers.exists():
                    self.stdout.write(self.style.SUCCESS(
                        f'Preserved {superusers.count()} superuser account(s)'
                    ))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error occurred: {str(e)}'))
            raise
