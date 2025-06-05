#!/usr/bin/env python
"""
Script to update venues with featured status and add sample images
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from venues.models import Venue
from datetime import datetime, timedelta

def update_featured_venues():
    """Update some venues to be featured and add sample images"""
    
    # Sample venue images (using placeholder images)
    sample_images = [
        "https://images.unsplash.com/photo-1519167758481-83f29c8a4e0a?w=800&h=600&fit=crop",  # Wedding venue
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",  # Banquet hall
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",  # Garden venue
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",  # Hotel venue
        "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop",  # Resort venue
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop",  # Party hall
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop",  # Outdoor venue
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",  # Elegant venue
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",  # Modern venue
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",  # Classic venue
    ]
    
    # Get first 10 venues to make featured
    venues = Venue.objects.all()[:10]
    
    print(f"Updating {len(venues)} venues to be featured...")
    
    for i, venue in enumerate(venues):
        # Make venue featured
        venue.is_featured = True
        venue.featured_priority = i + 1
        venue.featured_tagline = f"Premium {venue.category.name} - Book Now!"
        venue.featured_from = datetime.now().date()
        venue.featured_until = (datetime.now() + timedelta(days=90)).date()
        
        # Add sample image URL (we'll store it as a simple field for now)
        # Since we don't have an image upload system, we'll use the description field
        # to store image URLs temporarily
        image_url = sample_images[i % len(sample_images)]
        if not venue.description:
            venue.description = f"Beautiful venue perfect for your special occasion. Image: {image_url}"
        else:
            venue.description = f"{venue.description} Image: {image_url}"
        
        venue.save()
        print(f"Updated venue {venue.id}: {venue.name} - Featured: {venue.is_featured}")
    
    print("Featured venues update completed!")
    
    # Also update some random venues with images
    print("\nAdding images to more venues...")
    other_venues = Venue.objects.filter(is_featured=False)[:20]
    
    for i, venue in enumerate(other_venues):
        image_url = sample_images[i % len(sample_images)]
        if not venue.description:
            venue.description = f"Beautiful venue perfect for your special occasion. Image: {image_url}"
        else:
            if "Image:" not in venue.description:
                venue.description = f"{venue.description} Image: {image_url}"
        
        venue.save()
        print(f"Added image to venue {venue.id}: {venue.name}")
    
    print("Image update completed!")

if __name__ == "__main__":
    update_featured_venues()
