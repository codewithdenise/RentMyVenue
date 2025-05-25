#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from venues.models import Venue

# Update all venues to Published status
updated_count = Venue.objects.all().update(status='Published')
print(f'Updated {updated_count} venues to Published status')

# Verify the update
published_count = Venue.objects.filter(status='Published').count()
print(f'Total published venues: {published_count}')
