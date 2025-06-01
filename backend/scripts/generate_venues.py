import random
from datetime import datetime, timedelta
import json
import sys
import os
import django
from faker import Faker

fake = Faker()


# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from venues.models import Venue, Category, Tehsil, District, State, Amenity
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

# Load Indian cities and states data (reduced list)
INDIAN_CITIES = [
    {"city": "Mumbai", "state": "Maharashtra", "tehsil": "Mumbai City", "district": "Mumbai"},
    {"city": "Delhi", "state": "Delhi", "tehsil": "New Delhi", "district": "New Delhi"},
    {"city": "Bangalore", "state": "Karnataka", "tehsil": "Bangalore North", "district": "Bangalore Urban"},
    {"city": "Hyderabad", "state": "Telangana", "tehsil": "Hyderabad", "district": "Hyderabad"},
    {"city": "Chennai", "state": "Tamil Nadu", "tehsil": "Chennai", "district": "Chennai"},
    {"city": "Kolkata", "state": "West Bengal", "tehsil": "Kolkata", "district": "Kolkata"},
    {"city": "Pune", "state": "Maharashtra", "tehsil": "Pune City", "district": "Pune"},
    {"city": "Ahmedabad", "state": "Gujarat", "tehsil": "Ahmedabad", "district": "Ahmedabad"},
    {"city": "Jaipur", "state": "Rajasthan", "tehsil": "Jaipur", "district": "Jaipur"},
    {"city": "Lucknow", "state": "Uttar Pradesh", "tehsil": "Lucknow", "district": "Lucknow"},
    {"city": "Mysore", "state": "Karnataka", "tehsil": "Mysore", "district": "Mysore"},
]

VENUE_TYPES = [
    "Banquet Hall",
    "Hotel",
    "Resort",
    "Garden",
    "Palace",
    "Beach Resort",
    "Heritage Property",
    "Convention Center",
    "Farm House",
    "Club House"
]

VENUE_NAMES = [
    "Royal", "Grand", "Imperial", "Golden", "Crystal", "Diamond", "Emerald",
    "Pearl", "Sapphire", "Ruby", "Paradise", "Seasons", "Celebration",
    "Heritage", "Landmark", "Majestic", "Elite", "Premium", "Luxury",
    "Classic"
]

VENUE_SUFFIXES = [
    "Palace", "Gardens", "Banquets", "Resort", "Hotel", "Manor",
    "Plaza", "Hall", "Retreat", "Villa", "Mansion", "Court",
    "Estate", "Place", "Mahal", "Heights", "Towers", "Residency",
    "Club", "Convention"
]

AMENITIES = [
    "Wifi",
    "Parking",
    "Air Conditioning",
    "Swimming Pool",
    "Kitchen",
    "Catering",
    "Sound System",
    "Decoration Services",
    "Indoor Space",
    "Outdoor Space",
    "Seating Arrangement",
    "Bridal Room",
    "Stage",
    "Dance Floor",
    "DJ Equipment",
    "Valet Parking",
    "Power Backup",
    "Security",
    "First Aid",
    "Changing Rooms"
]

def generate_random_date_range():
    """Generate a random date range within the next year"""
    start_date = datetime.now() + timedelta(days=random.randint(1, 365))
    end_date = start_date + timedelta(days=random.randint(1, 30))
    return start_date, end_date

def generate_description(venue_name, location, venue_type):
    """Generate a detailed description for the venue"""
    descriptions = [
        f"Welcome to {venue_name}, a prestigious {venue_type.lower()} located in the heart of {location['city']}, {location['state']}. ",
        f"Experience luxury and elegance at {venue_name}, one of {location['city']}'s finest {venue_type.lower()}s. ",
        f"Discover the perfect blend of tradition and modern amenities at {venue_name}, situated in {location['tehsil']}, {location['city']}. "
    ]
    features = [
        "Perfect for weddings, receptions, and grand celebrations. ",
        "Offering spectacular views and world-class services. ",
        "Known for its exceptional hospitality and elegant ambiance. ",
        "Featuring state-of-the-art facilities and professional staff. ",
        "Ideal for both intimate gatherings and large-scale events. "
    ]
    return random.choice(descriptions) + random.choice(features)

def generate_venues(num_venues=50):
    """Generate specified number of venues with varied characteristics"""
    print(f"Generating {num_venues} venues...")
    
    # Clear existing venues
    Venue.objects.all().delete()
    print("Cleared existing venues")

    # Get or create a vendor user
    vendor, created = User.objects.get_or_create(
        email="vendor@example.com",
        defaults={
            "is_vendor": True,
            "name": "Test Vendor"
        }
    )

    # Create or get categories
    categories = {}
    for cat_name in VENUE_TYPES:
        base_slug = slugify(cat_name)
        slug = base_slug
        counter = 1
        while True:
            try:
                cat, created = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={'slug': slug}
                )
                break
            except django.db.utils.IntegrityError:
                slug = f"{base_slug}-{counter}"
                counter += 1
        categories[cat_name] = cat

    # Create or get amenities
    amenities = {}
    for amenity_name in AMENITIES:
        amenity, created = Amenity.objects.get_or_create(name=amenity_name)
        amenities[amenity_name] = amenity

    # Create or get states, districts, and tehsils
    states = {}
    districts = {}
    tehsils = {}
    for location in INDIAN_CITIES:
        state_name = location['state']
        state, created = State.objects.get_or_create(name=state_name)
        states[state_name] = state
        
        district_name = location['district']
        district, created = District.objects.get_or_create(
            name=district_name,
            state=state
        )
        districts[district_name] = district
        
        tehsil_name = location['tehsil']
        tehsil, created = Tehsil.objects.get_or_create(
            name=tehsil_name,
            district=district
        )
        tehsils[tehsil_name] = tehsil

    venues_created = 0
    for _ in range(num_venues):
        location = random.choice(INDIAN_CITIES)
        venue_type = random.choice(VENUE_TYPES)
        venue_name = f"{random.choice(VENUE_NAMES)} {random.choice(VENUE_SUFFIXES)}"
        
        capacity = random.randint(50, 2000)
        
        # Select random amenities
        selected_amenity_names = random.sample(AMENITIES, random.randint(5, len(AMENITIES)))
        selected_amenities = [amenities[name] for name in selected_amenity_names]
        
        state = states[location['state']]
        district = districts[location['district']]
        tehsil = tehsils[location['tehsil']]
        category = categories[venue_type]
        owner = vendor
        
        venue = Venue.objects.create(
            name=venue_name,
            description=generate_description(venue_name, location, venue_type),
            category=category,
            state=state,
            district=district,
            tehsil=tehsil,
            pincode=fake.postcode(),
            capacity=capacity,
            is_ac=random.choice([True, False]),
            indoor_outdoor=random.choice(['indoor', 'outdoor', 'both']),
            owner=owner,
            address_line=fake.street_address(),
            status='Published'  # Set status to Published
        )
        
        # Set many-to-many field after creation
        venue.amenities.set(selected_amenities)

        
        venues_created += 1
        if venues_created % 10 == 0:
            print(f"Created {venues_created} venues...")

    print(f"Successfully created {venues_created} venues")

if __name__ == "__main__":
    generate_venues(50)
