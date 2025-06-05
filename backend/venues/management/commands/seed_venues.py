import random
from django.core.management.base import BaseCommand
from venues.models import State, District, Tehsil, Category, Amenity, Venue, Image
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with 100 sample venues and related data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Create or get a vendor user to own the venues
        vendor, created = User.objects.get_or_create(
            email='vendor@example.com',
            defaults={'role': User.Role.VENDOR, 'email_verified': True, 'is_active': True}
        )
        if created:
            vendor.set_password('password123')
            vendor.save()

        # Create sample States, Districts, Tehsils
        state_names = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi']
        district_names = {
            'Uttar Pradesh': ['Agra', 'Lucknow', 'Varanasi'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
            'Karnataka': ['Bangalore Urban', 'Mysore', 'Mangalore'],
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
            'Delhi': ['New Delhi', 'South Delhi', 'North Delhi'],
        }
        tehsil_names = {
            'Agra': ['Kiraoli', 'Etmadpur', 'Fatehabad'],
            'Lucknow': ['Malihabad', 'Bakshi Ka Talab', 'Sarojini Nagar'],
            'Varanasi': ['Pindra', 'Ramnagar', 'Chiraigaon'],
            'Mumbai': ['Andheri', 'Bandra', 'Dadar'],
            'Pune': ['Haveli', 'Mulshi', 'Shirur'],
            'Nagpur': ['Katol', 'Narkhed', 'Umred'],
            'Bangalore Urban': ['Bangalore North', 'Bangalore East', 'Bangalore South'],
            'Mysore': ['Nanjangud', 'Hunsur', 'Periyapatna'],
            'Mangalore': ['Puttur', 'Belthangady', 'Sullia'],
            'Chennai': ['Ambattur', 'Sholinganallur', 'Tambaram'],
            'Coimbatore': ['Pollachi', 'Mettupalayam', 'Sulur'],
            'Madurai': ['Melur', 'Thirumangalam', 'Usilampatti'],
            'New Delhi': ['Chanakyapuri', 'Rohini', 'Dwarka'],
            'South Delhi': ['Saket', 'Hauz Khas', 'Mehrauli'],
            'North Delhi': ['Civil Lines', 'Model Town', 'Karol Bagh'],
        }

        states = []
        for sname in state_names:
            state, _ = State.objects.get_or_create(name=sname)
            states.append(state)

        districts = []
        for state in states:
            for dname in district_names.get(state.name, []):
                district, _ = District.objects.get_or_create(name=dname, state=state)
                districts.append(district)

        tehsils = []
        for district in districts:
            for tname in tehsil_names.get(district.name, []):
                tehsil, _ = Tehsil.objects.get_or_create(name=tname, district=district)
                tehsils.append(tehsil)

        # Create Categories
        category_names = [
            'Banquet Hall', 'Marriage Garden/Lawn', 'Wedding Resort',
            'Small Function/Party Hall', 'Destination Wedding Venue',
            'Kalyana Mandapam', '4-Star & Above Wedding Hotel'
        ]
        categories = []
        for cname in category_names:
            category, _ = Category.objects.get_or_create(name=cname, slug=slugify(cname))
            categories.append(category)

        # Create Amenities
        amenity_names = ['Parking', 'Catering', 'Decor', 'Rooms/Accommodation', 'Sound System/DJ', 'Alcohol Permit']
        amenities = []
        for aname in amenity_names:
            amenity, _ = Amenity.objects.get_or_create(name=aname)
            amenities.append(amenity)

        # Create 100 venues
        for i in range(1, 101):
            state = random.choice(states)
            district = random.choice([d for d in districts if d.state == state])
            tehsil = random.choice([t for t in tehsils if t.district == district])
            category = random.choice(categories)
            capacity = random.randint(50, 1000)
            is_ac = random.choice([True, False])
            indoor_outdoor = random.choice(['indoor', 'outdoor', 'both'])
            venue_name = f"{category.name} Venue {i}"
            address_line = f"{i} Sample Street, {tehsil.name}"
            pincode = f"{random.randint(100000, 999999)}"

            venue = Venue.objects.create(
                name=venue_name,
                description=f"This is a description for {venue_name}.",
                category=category,
                owner=vendor,
                address_line=address_line,
                tehsil=tehsil,
                district=district,
                state=state,
                pincode=pincode,
                capacity=capacity,
                is_ac=is_ac,
                indoor_outdoor=indoor_outdoor,
                status=Venue.Status.PUBLISHED,
            )
            # Assign random amenities
            venue.amenities.set(random.sample(amenities, k=random.randint(1, len(amenities))))

            # Create a cover image
            Image.objects.create(
                venue=venue,
                file_url=f"https://example.com/images/venue_{i}_cover.jpg",
                title=f"Cover Image for {venue_name}",
                is_cover=True,
                ordering=1,
                width=1920,
                height=1080,
                file_size=204800,
                file_format='jpg',
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded 100 venues with related data.'))
