/**
 * Booking Service
 *
 * Handles all booking-related API calls connected to Django backend.
 */

import api from "./api";
import type { ApiResponse, Booking } from "../types";

// Backend response interfaces
interface BookingRequest {
  venue_id: string;
  start_date: string;
  end_date: string;
  guest_count: number;
  event_type?: string;
  special_requests?: string;
  contact_phone?: string;
}

interface BookingResponse {
  id: string;
  venue: {
    id: string;
    name: string;
    address: {
      city: string;
      state: string;
    };
    images: { image: string; is_primary: boolean }[];
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  guest_count: number;
  event_type: string;
  special_requests?: string;
  contact_phone?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price: number;
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
}

interface BookingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookingResponse[];
}

// Helper function to transform backend booking to frontend format
const transformBooking = (backendBooking: BookingResponse): Booking => {
  const primaryImage = backendBooking.venue.images.find(img => img.is_primary);
  
  return {
    id: backendBooking.id,
    userId: backendBooking.user.id,
    venueId: backendBooking.venue.id,
    venue: {
      name: backendBooking.venue.name,
      address: {
        city: backendBooking.venue.address.city,
        state: backendBooking.venue.address.state,
      },
      image: primaryImage?.image || backendBooking.venue.images[0]?.image || '',
    },
    startDate: backendBooking.start_date,
    endDate: backendBooking.end_date,
    status: backendBooking.status,
    totalPrice: backendBooking.total_price,
    paymentStatus: backendBooking.payment_status,
    createdAt: backendBooking.created_at,
  };
};

// Booking service methods
const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: {
    venueId: string;
    startDate: string;
    endDate: string;
    guestCount: number;
    eventType?: string;
    specialRequests?: string;
    contactPhone?: string;
  }): Promise<ApiResponse<Booking>> => {
    try {
      const requestData: BookingRequest = {
        venue_id: bookingData.venueId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        guest_count: bookingData.guestCount,
        event_type: bookingData.eventType,
        special_requests: bookingData.specialRequests,
        contact_phone: bookingData.contactPhone,
      };

      const response = await api.post<BookingResponse>("/api/bookings/", requestData);

      if (response.success && response.data) {
        const booking = transformBooking(response.data);
        return {
          success: true,
          data: booking,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to create booking",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create booking",
      };
    }
  },

  // Get user's bookings
  getUserBookings: async (
    page = 1,
    pageSize = 10,
    status?: string,
  ): Promise<ApiResponse<{ bookings: Booking[]; total: number; hasMore: boolean }>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get<BookingListResponse>(`/api/bookings/?${params.toString()}`);

      if (response.success && response.data) {
        const bookings = response.data.results.map(transformBooking);
        return {
          success: true,
          data: {
            bookings,
            total: response.data.count,
            hasMore: !!response.data.next,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch bookings",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch bookings",
      };
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.get<BookingResponse>(`/api/bookings/${bookingId}/`);

      if (response.success && response.data) {
        const booking = transformBooking(response.data);
        return {
          success: true,
          data: booking,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch booking details",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch booking details",
      };
    }
  },

  // Update booking status
  updateBookingStatus: async (
    bookingId: string,
    status: "confirmed" | "cancelled",
    reason?: string,
  ): Promise<ApiResponse<Booking>> => {
    try {
      const requestData: { status: string; cancellation_reason?: string } = { status };
      
      if (status === "cancelled" && reason) {
        requestData.cancellation_reason = reason;
      }

      const response = await api.patch<BookingResponse>(
        `/api/bookings/${bookingId}/`,
        requestData
      );

      if (response.success && response.data) {
        const booking = transformBooking(response.data);
        return {
          success: true,
          data: booking,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to update booking status",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to update booking status",
      };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<ApiResponse<Booking>> => {
    return bookingService.updateBookingStatus(bookingId, "cancelled", reason);
  },

  // Get booking availability for a venue
  checkAvailability: async (
    venueId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<{ available: boolean; conflictingBookings?: string[] }>> => {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const response = await api.get<{ available: boolean; conflicting_bookings?: string[] }>(
        `/api/venues/${venueId}/check-availability/?${params.toString()}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            available: response.data.available,
            conflictingBookings: response.data.conflicting_bookings,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to check availability",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to check availability",
      };
    }
  },

  // Get booking price estimate
  getPriceEstimate: async (
    venueId: string,
    startDate: string,
    endDate: string,
    guestCount: number,
  ): Promise<ApiResponse<{
    basePrice: number;
    serviceFee: number;
    taxes: number;
    totalPrice: number;
    breakdown: { item: string; amount: number }[];
  }>> => {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        guest_count: guestCount.toString(),
      });

      const response = await api.get<{
        base_price: number;
        service_fee: number;
        taxes: number;
        total_price: number;
        breakdown: { item: string; amount: number }[];
      }>(`/api/venues/${venueId}/price-estimate/?${params.toString()}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            basePrice: response.data.base_price,
            serviceFee: response.data.service_fee,
            taxes: response.data.taxes,
            totalPrice: response.data.total_price,
            breakdown: response.data.breakdown,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to get price estimate",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get price estimate",
      };
    }
  },
};

export default bookingService;
