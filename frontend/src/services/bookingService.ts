/**
 * Booking Service
 *
 * Handles all booking-related API calls.
 * For this implementation, we'll use simulated responses.
 */

import { Booking, ApiResponse } from "@/types";
import api, { simulateApiCall } from "./api";

// Generate mock bookings
const generateMockBookings = (count = 15): Booking[] => {
  const statuses: Booking["status"][] = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ];
  const paymentStatuses: Booking["paymentStatus"][] = [
    "pending",
    "paid",
    "refunded",
  ];

  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Miami",
    "San Francisco",
    "Seattle",
    "Boston",
    "Austin",
    "Denver",
    "Nashville",
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = `booking-${i + 1}`;
    const userId = `user-${1 + Math.floor(Math.random() * 10)}`;
    const venueId = `venue-${1 + Math.floor(Math.random() * 20)}`;

    // Create random dates
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 60));

    const startDate = new Date(futureDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus =
      status === "cancelled"
        ? "refunded"
        : status === "confirmed" || status === "completed"
          ? "paid"
          : "pending";

    const city = cities[Math.floor(Math.random() * cities.length)];
    const price = 1000 + Math.floor(Math.random() * 9000);

    return {
      id,
      userId,
      venueId,
      venue: {
        name: `${city} Wedding Venue`,
        address: {
          city,
          state: "CA",
        },
        image: `https://source.unsplash.com/800x600/?venue,wedding&sig=${venueId}`,
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      totalPrice: price,
      paymentStatus,
      createdAt: new Date(
        today.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      ).toISOString(),
    };
  });
};

// Mock bookings
const MOCK_BOOKINGS = generateMockBookings(30);

// Booking service methods
const bookingService = {
  // Get all bookings for a user
  getUserBookings: async (userId: string): Promise<ApiResponse<Booking[]>> => {
    try {
      const userBookings = MOCK_BOOKINGS.filter(
        (booking) => booking.userId === userId,
      );

      return await simulateApiCall({ success: true, data: userBookings }, 800);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch bookings",
      };
    }
  },

  // Get all bookings for a venue
  getVenueBookings: async (
    venueId: string,
  ): Promise<ApiResponse<Booking[]>> => {
    try {
      const venueBookings = MOCK_BOOKINGS.filter(
        (booking) => booking.venueId === venueId,
      );

      return await simulateApiCall({ success: true, data: venueBookings }, 800);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch venue bookings",
      };
    }
  },

  // Get a single booking by ID
  getBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    try {
      const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);

      if (!booking) {
        return await simulateApiCall(
          { success: false, error: "Booking not found" },
          500,
        );
      }

      return await simulateApiCall({ success: true, data: booking }, 600);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch booking",
      };
    }
  },

  // Create a new booking
  createBooking: async (
    bookingData: Partial<Booking>,
  ): Promise<ApiResponse<Booking>> => {
    try {
      if (
        !bookingData.venueId ||
        !bookingData.startDate ||
        !bookingData.endDate
      ) {
        return {
          success: false,
          error: "Missing required booking information",
        };
      }

      // Check for date conflicts (in a real app this would be more complex)
      const conflictingBookings = MOCK_BOOKINGS.filter(
        (b) =>
          b.venueId === bookingData.venueId &&
          b.status !== "cancelled" &&
          new Date(b.startDate) <= new Date(bookingData.endDate) &&
          new Date(b.endDate) >= new Date(bookingData.startDate),
      );

      if (conflictingBookings.length > 0) {
        return await simulateApiCall(
          {
            success: false,
            error: "The venue is not available for the selected dates",
          },
          700,
        );
      }

      // Create a new booking
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        userId: bookingData.userId || "current-user-id",
        venueId: bookingData.venueId,
        venue: bookingData.venue || {
          name: "Venue Name",
          address: {
            city: "City",
            state: "State",
          },
          image: `https://source.unsplash.com/800x600/?venue,wedding&sig=${bookingData.venueId}`,
        },
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        status: "pending",
        totalPrice: bookingData.totalPrice || 1000,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      // Add to mock data
      MOCK_BOOKINGS.push(newBooking);

      return await simulateApiCall({ success: true, data: newBooking }, 1200);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create booking",
      };
    }
  },

  // Update a booking status
  updateBookingStatus: async (
    bookingId: string,
    status: Booking["status"],
  ): Promise<ApiResponse<Booking>> => {
    try {
      const bookingIndex = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);

      if (bookingIndex === -1) {
        return await simulateApiCall(
          { success: false, error: "Booking not found" },
          500,
        );
      }

      // Update the booking
      MOCK_BOOKINGS[bookingIndex] = {
        ...MOCK_BOOKINGS[bookingIndex],
        status,
        // Update payment status based on booking status
        paymentStatus:
          status === "cancelled"
            ? "refunded"
            : status === "confirmed" || status === "completed"
              ? "paid"
              : MOCK_BOOKINGS[bookingIndex].paymentStatus,
      };

      return await simulateApiCall(
        { success: true, data: MOCK_BOOKINGS[bookingIndex] },
        800,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update booking",
      };
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    try {
      return await bookingService.updateBookingStatus(bookingId, "cancelled");
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to cancel booking",
      };
    }
  },

  // Get booking statistics for vendor
  getVendorBookingStats: async (
    vendorId: string,
  ): Promise<
    ApiResponse<{
      totalBookings: number;
      confirmedBookings: number;
      pendingBookings: number;
      cancelledBookings: number;
      completedBookings: number;
      totalRevenue: number;
      upcomingBookings: Booking[];
    }>
  > => {
    try {
      // In a real app, we would filter by venues owned by the vendor
      // For simplicity, we'll use some mock bookings
      const vendorBookings = MOCK_BOOKINGS.slice(0, 15);

      const stats = {
        totalBookings: vendorBookings.length,
        confirmedBookings: vendorBookings.filter(
          (b) => b.status === "confirmed",
        ).length,
        pendingBookings: vendorBookings.filter((b) => b.status === "pending")
          .length,
        cancelledBookings: vendorBookings.filter(
          (b) => b.status === "cancelled",
        ).length,
        completedBookings: vendorBookings.filter(
          (b) => b.status === "completed",
        ).length,
        totalRevenue: vendorBookings
          .filter((b) => b.status === "confirmed" || b.status === "completed")
          .reduce((sum, b) => sum + b.totalPrice, 0),
        upcomingBookings: vendorBookings
          .filter(
            (b) =>
              b.status === "confirmed" && new Date(b.startDate) > new Date(),
          )
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          )
          .slice(0, 5),
      };

      return await simulateApiCall({ success: true, data: stats }, 800);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch booking statistics",
      };
    }
  },
};

export default bookingService;
