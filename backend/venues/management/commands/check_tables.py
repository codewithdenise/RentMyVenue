from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Check if the venues_state table exists in the database'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            if 'venues_state' in tables:
                self.stdout.write(self.style.SUCCESS("Table 'venues_state' exists in the database."))
            else:
                self.stdout.write(self.style.ERROR("Table 'venues_state' does NOT exist in the database."))
            self.stdout.write("All tables in the database:")
            for table in tables:
                self.stdout.write(f" - {table}")
