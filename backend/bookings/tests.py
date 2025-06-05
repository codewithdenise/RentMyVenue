from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from decimal import Decimal

from accounts.models import User
from venues.models import Venue, Category, State, District, Tehsil
from .models import Booking, BookingStateLog

class BookingModelTests(TestCase):
    def setUp(self):
        # Create test users
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='testpass123',
            role=User.Role.USER
        )
        self.vendor = User.objects.create_user(
            email='vendor@example.com',
            password='testpass123',
            role=User.Role.VENDOR
        )

        # Create test venue
        self.state = State.objects.create(name='Test State')
        self.district = District.objects.create(name='Test District', state=self.state)
        self.tehsil = Tehsil.objects.create(name='Test Tehsil', district=self.district)
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        
        self.venue = Venue.objects.create(
            name='Test Venue',
            owner=self.vendor,
            category=self.category,
            address_line='Test Address',
            tehsil=self.tehsil,
            district=self.district,
            state=self.state,
            pincode='123456',
            capacity=100,
            indoor_outdoor='indoor'
        )

    def test_booking_creation(self):
        """Test creating a new booking"""
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=4)
        
        booking = Booking(
            venue=self.venue,
            user=self.customer,
            start_datetime=start_time,
            end_datetime=end_time,
            is_full_day=False,
            base_rate_snapshot=Decimal('1000.00'),
            pricing_unit=Booking.PricingUnit.HOUR
        )
        booking.save()  # This will trigger the save method to calculate pricing

        self.assertEqual(booking.status, Booking.Status.NEW)
        self.assertEqual(booking.quantity, 4)
        self.assertEqual(booking.subtotal, Decimal('4000.00'))  # 1000 * 4 hours
        self.assertEqual(booking.tax_amount, Decimal('720.00'))  # 18% GST
        self.assertEqual(booking.platform_fee, Decimal('200.00'))  # 5% platform fee

    def test_booking_slot_availability(self):
        """Test that overlapping bookings are prevented"""
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=4)
        
        # Create first booking
        booking1 = Booking(
            venue=self.venue,
            user=self.customer,
            start_datetime=start_time,
            end_datetime=end_time,
            is_full_day=False,
            base_rate_snapshot=Decimal('1000.00'),
            pricing_unit=Booking.PricingUnit.HOUR,
            status=Booking.Status.CONFIRMED
        )
        booking1.save()  # This will trigger the save method to calculate pricing

        # Try to create overlapping booking
        booking2 = Booking(
            venue=self.venue,
            user=self.customer,
            start_datetime=start_time + timedelta(hours=2),
            end_datetime=end_time + timedelta(hours=2),
            is_full_day=False,
            base_rate_snapshot=Decimal('1000.00'),
            pricing_unit=Booking.PricingUnit.HOUR,
            quantity=4
        )

        self.assertFalse(booking2.is_slot_available())

class BookingAPITests(APITestCase):
    def setUp(self):
        # Create test users
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='testpass123',
            role=User.Role.USER
        )
        self.vendor = User.objects.create_user(
            email='vendor@example.com',
            password='testpass123',
            role=User.Role.VENDOR
        )
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            role=User.Role.ADMIN
        )

        # Create test venue
        self.state = State.objects.create(name='Test State')
        self.district = District.objects.create(name='Test District', state=self.state)
        self.tehsil = Tehsil.objects.create(name='Test Tehsil', district=self.district)
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        
        self.venue = Venue.objects.create(
            name='Test Venue',
            owner=self.vendor,
            category=self.category,
            address_line='Test Address',
            tehsil=self.tehsil,
            district=self.district,
            state=self.state,
            pincode='123456',
            capacity=100,
            indoor_outdoor='indoor'
        )

    def test_create_booking(self):
        """Test creating a booking through the API"""
        self.client.force_authenticate(user=self.customer)
        
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=4)
        
        data = {
            'venue': self.venue.id,
            'start_datetime': start_time.isoformat(),
            'end_datetime': end_time.isoformat(),
            'is_full_day': False
        }

        response = self.client.post(reverse('booking-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(Booking.objects.first().status, Booking.Status.HELD)

    def test_list_bookings_permissions(self):
        """Test that users can only see appropriate bookings"""
        # Create some bookings
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=4)
        
        booking1 = Booking(
            venue=self.venue,
            user=self.customer,
            start_datetime=start_time,
            end_datetime=end_time,
            is_full_day=False,
            base_rate_snapshot=Decimal('1000.00'),
            pricing_unit=Booking.PricingUnit.HOUR
        )
        booking1.save()  # This will trigger the save method to calculate pricing

        # Test customer can only see their bookings
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(reverse('booking-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Test vendor can see bookings for their venue
        self.client.force_authenticate(user=self.vendor)
        response = self.client.get(reverse('booking-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Test admin can see all bookings
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('booking-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_booking_state_transitions(self):
        """Test booking state transitions"""
        self.client.force_authenticate(user=self.customer)
        
        # Create a booking
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=4)
        
        booking = Booking(
            venue=self.venue,
            user=self.customer,
            start_datetime=start_time,
            end_datetime=end_time,
            is_full_day=False,
            base_rate_snapshot=Decimal('1000.00'),
            pricing_unit=Booking.PricingUnit.HOUR,
            status=Booking.Status.HELD
        )
        booking.save()  # This will trigger the save method to calculate pricing

        # Test confirming booking
        response = self.client.post(
            reverse('booking-confirm', kwargs={'booking_id': booking.booking_id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CONFIRMED)

        # Test cancelling booking
        response = self.client.post(
            reverse('booking-cancel', kwargs={'booking_id': booking.booking_id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CANCELLED)
