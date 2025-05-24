/**
 * Booking Service
 *
 * Handles all booking-related API calls.
 */

import api from "./api";
import type { ApiResponse } from "../types";

// Mock data for development
const mockBooking = {
  id: "bk-123456",
  userId: "user123",
  venueId: "venue123",
  venue: {
    name: "Royal Palace Banquet Hall",
    address: {
      city: "Mumbai",
      state: "Maharashtra",
    },
    image: "https://source.unsplash.com/random/800x600/?venue,wedding",
  },
  startDate: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
  endDate: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
  guestCount: 150,
  specialRequests: "We need a separate area for children's activities.",
  status: "pending",
  totalPrice: 45000,
  paymentStatus: "pending",
  paymentMethod: "online",
  transactionId: null,
  createdAt: new Date().toISOString(),
};

// Booking service methods
const bookingService = {
  // Get all bookings for the current user
  getUserBookings: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get<any[]>("/api/bookings/");
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch user bookings");
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId: string): Promise<any> => {
    try {
      // For development, return mock data
      // In production, use the actual API call
      return Promise.resolve({
        ...mockBooking,
        id: bookingId,
      });

      // Real API call would be:
      // const response = await api.get<any>(`/api/bookings/${bookingId}/`);
      // return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch booking details");
    }
  },

  // Create a new booking
  createBooking: async (bookingData: any): Promise<any> => {
    try {
      // For development, return mock response
      // In production, use the actual API call
      return Promise.resolve({
        success: true,
        bookingId: "bk-" + Math.floor(Math.random() * 1000000).toString(),
        message: "Booking created successfully",
      });

      // Real API call would be:
      // const response = await api.post<any>('/api/bookings/', bookingData);
      // return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create booking");
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<any>(
        `/api/bookings/${bookingId}/cancel/`,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to cancel booking");
    }
  },

  // Verify payment for a booking
  verifyPayment: async (
    bookingId: string,
    paymentData: any,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<any>(
        `/api/bookings/${bookingId}/verify-payment/`,
        paymentData,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify payment");
    }
  },

  // Check venue availability for given dates
  checkAvailability: async (
    venueId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<any>> => {
    try {
      const params = new URLSearchParams();
      params.append("venue_id", venueId);
      params.append("start_date", startDate);
      params.append("end_date", endDate);

      const response = await api.get<any>(
        `/api/availability/?${params.toString()}`,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to check availability");
    }
  },
};

export default bookingService;
