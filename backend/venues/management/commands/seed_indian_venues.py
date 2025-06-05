import random
from django.core.management.base import BaseCommand
from venues.models import State, District, Tehsil, Category, Amenity, Venue, Image
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with Indian wedding venues'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Indian wedding venues...')

        # Create or get a vendor user
        vendor, created = User.objects.get_or_create(
            email='vendor@example.com',
            defaults={'role': User.Role.VENDOR, 'email_verified': True, 'is_active': True}
        )
        if created:
            vendor.set_password('password123')
            vendor.save()

        # Indian wedding venue categories
        category_names = [
            'Destination Palace', 'Heritage Haveli', 'Royal Wedding Resort',
            'Modern Banquet Complex', 'Luxury Wedding Hotel', 'Garden Palace',
            'Traditional Mandap Venue'
        ]
        categories = []
        for cname in category_names:
            category, _ = Category.objects.get_or_create(
                name=cname,
                slug=slugify(cname),
                defaults={'description': f'Beautiful {cname.lower()} venues for your dream wedding'}
            )
            categories.append(category)

        # Create Amenities specific to Indian weddings
        amenity_names = [
            'Mandap Setup', 'Haldi Ceremony Space', 'Mehndi Area',
            'Baraat Path', 'Traditional Catering', 'Modern Catering',
            'Valet Parking', 'Bride Room', 'Groom Room',
            'Guest Accommodation', 'Sound System', 'Alcohol Permitted',
            'Fire & Safety Compliant'
        ]
        amenities = []
        for aname in amenity_names:
            amenity, _ = Amenity.objects.get_or_create(name=aname)
            amenities.append(amenity)

        # Indian Wedding Venue Data
        venues_data = [
            {
                'name': 'Rajmahal Palace Gardens',
                'description': '''A stunning heritage palace with sprawling gardens perfect for grand Indian weddings. Features traditional Rajasthani architecture with modern amenities. Ideal for both intimate ceremonies and grand celebrations. Our venue offers dedicated spaces for all wedding ceremonies including Haldi, Mehndi, Sangeet, and the main wedding ceremony.''',
                'image_url': 'https://images.unsplash.com/photo-1604604994333-f1b0e9471186',
                'capacity': 800
            },
            {
                'name': 'The Royal Haveli',
                'description': '''An authentic Rajasthani haveli transformed into a luxurious wedding venue. Perfect for intimate ceremonies and grand receptions. Features beautiful courtyards, traditional architecture, and modern amenities. Our venue specializes in traditional Indian weddings with complete support for all customs and rituals.''',
                'image_url': 'https://images.unsplash.com/photo-1590164649020-ef1838192549',
                'capacity': 400
            },
            {
                'name': 'Golden Temple Resort',
                'description': '''A modern resort with traditional Indian elements. Featuring multiple venues for different ceremonies and celebrations. Our sprawling lawns and elegant indoor spaces can accommodate all your wedding functions. We offer complete wedding planning services including decoration, catering, and accommodation.''',
                'image_url': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
                'capacity': 1000
            },
            {
                'name': 'Lotus Mandap Gardens',
                'description': '''Beautiful outdoor venue with dedicated spaces for all wedding ceremonies. Spectacular lighting and water features create a magical atmosphere for your special day. Our venue includes separate areas for different ceremonies, ensuring each function has its own unique setting and ambiance.''',
                'image_url': 'https://images.unsplash.com/photo-1632633173522-47456de71b76',
                'capacity': 600
            },
            {
                'name': 'The Grand Mughal',
                'description': '''Inspired by Mughal architecture, this venue offers a royal wedding experience with modern luxury amenities. Features include grand ballrooms, beautiful gardens, and spectacular water features. Perfect for couples seeking a blend of traditional elegance and contemporary luxury.''',
                'image_url': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
                'capacity': 1200
            },
            {
                'name': 'Lakeside Celebration Manor',
                'description': '''A serene lakeside venue perfect for destination weddings. Features a stunning waterfront mandap setup and spacious outdoor areas. The venue offers breathtaking sunset views and can accommodate both intimate gatherings and grand celebrations.''',
                'image_url': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
                'capacity': 500
            },
            {
                'name': 'Heritage Fort Palace',
                'description': '''An authentic royal fort converted into a luxury wedding destination. Experience the grandeur of royal Indian weddings with traditional architecture, magnificent courtyards, and modern amenities. Perfect for couples seeking a truly royal wedding experience.''',
                'image_url': 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38',
                'capacity': 1500
            },
            {
                'name': 'Green Valley Resort',
                'description': '''Nestled in the hills, this eco-friendly resort offers a perfect blend of nature and luxury. Features multiple outdoor and indoor venues, organic gardens, and sustainable practices. Ideal for nature-loving couples wanting a green wedding.''',
                'image_url': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
                'capacity': 300
            },
            {
                'name': 'Urban Luxury Banquets',
                'description': '''A contemporary venue in the heart of the city featuring modern architecture and state-of-the-art facilities. Multiple halls with different themes, dedicated spaces for various ceremonies, and excellent accessibility make it perfect for urban celebrations.''',
                'image_url': 'https://images.unsplash.com/photo-1519167758481-83f29c8a4e0a',
                'capacity': 700
            },
            {
                'name': 'Beachside Wedding Resort',
                'description': '''Experience the magic of a beach wedding at this exclusive coastal resort. Features private beach access, seaside mandap setups, and beautiful sunset views. Perfect for couples dreaming of a romantic beach wedding with traditional elements.''',
                'image_url': 'https://images.unsplash.com/photo-1544124499-58912cbddaad',
                'capacity': 400
            }
        ]

        # Get existing locations
        states = State.objects.all()
        districts = District.objects.all()
        tehsils = Tehsil.objects.all()

        # Create venues
        for venue_data in venues_data:
            state = random.choice(states)
            district = random.choice([d for d in districts if d.state == state])
            tehsil = random.choice([t for t in tehsils if t.district == district])
            category = random.choice(categories)

            venue = Venue.objects.create(
                name=venue_data['name'],
                description=venue_data['description'],
                category=category,
                owner=vendor,
                address_line=f"{random.randint(1, 100)} Palace Road",
                tehsil=tehsil,
                district=district,
                state=state,
                pincode=f"{random.randint(100000, 999999)}",
                capacity=venue_data['capacity'],
                is_ac=True,
                indoor_outdoor='both',
                status=Venue.Status.PUBLISHED,
                is_featured=True,
                featured_priority=random.randint(1, 5),
                featured_tagline="Experience the grandeur of Indian weddings",
                featured_from=timezone.now().date(),
                featured_until=timezone.now().date().replace(year=timezone.now().year + 1)
            )

            # Assign amenities (8-12 random amenities)
            venue.amenities.set(random.sample(amenities, k=random.randint(8, 12)))

            # Create venue images
            cover_image = Image.objects.create(
                venue=venue,
                file_url=venue_data['image_url'],
                title=f"Cover Image for {venue.name}",
                is_cover=True,
                ordering=1,
                width=1920,
                height=1080,
                file_size=204800,
                file_format='jpg',
            )

            # Set as venue's cover image
            venue.cover_image = cover_image
            venue.save()

            # Add additional venue images
            additional_images = [
                'https://images.unsplash.com/photo-1632633173522-47456de71b76',
                'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
                'https://images.unsplash.com/photo-1590164649020-ef1838192549',
                'https://images.unsplash.com/photo-1604604994333-f1b0e9471186'
            ]

            for idx, img_url in enumerate(additional_images, start=2):
                Image.objects.create(
                    venue=venue,
                    file_url=img_url,
                    title=f"Additional Image {idx} for {venue.name}",
                    is_cover=False,
                    ordering=idx,
                    width=1920,
                    height=1080,
                    file_size=204800,
                    file_format='jpg',
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Indian wedding venues with related data.'))
