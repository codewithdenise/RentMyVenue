/**
 * Venue Service
 *
 * Handles all venue-related API calls.
 */

import api from "./api";
import type { VenueSearchFilters, ApiResponse } from "../types";

// Venue service methods
const venueService = {
  // Get all venues with pagination and filters
  getVenues: async (
    filters: VenueSearchFilters = {},
  ): Promise<ApiResponse<any[]>> => {
    try {
      // Build query params string from filters
      const params = new URLSearchParams();

      if (filters.page !== undefined && filters.page !== null)
        params.append("page", filters.page.toString());
      if (filters.limit !== undefined && filters.limit !== null)
        params.append("limit", filters.limit.toString());
      if (filters.query) params.append("query", filters.query);
      if (filters.location) params.append("location", filters.location);
      if (filters.minPrice !== undefined && filters.minPrice !== null)
        params.append("min_price", filters.minPrice.toString());
      if (filters.maxPrice !== undefined && filters.maxPrice !== null)
        params.append("max_price", filters.maxPrice.toString());
      if (filters.minCapacity !== undefined && filters.minCapacity !== null)
        params.append("min_capacity", filters.minCapacity.toString());
      if (filters.maxCapacity !== undefined && filters.maxCapacity !== null)
        params.append("max_capacity", filters.maxCapacity.toString());
      if (filters.amenities && filters.amenities.length > 0) {
        params.append("amenities", filters.amenities.join(","));
      }
      if (filters.categories && filters.categories.length > 0) {
        params.append("categories", filters.categories.join(","));
      }
      if (filters.sort) params.append("sort", filters.sort);

      const endpoint = `/venues/?${params.toString()}`;

      const response = await api.get<any[]>(endpoint);

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch venues");
    }
  },

  // Get featured venues
  getFeaturedVenues: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get<any[]>("/api/featured-venues/");
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch featured venues");
    }
  },

  // Get venue by ID
  getVenueById: async (venueId: string): Promise<any> => {
    try {
      // For development, return mock data
      // In production, use the actual API call
      return Promise.resolve({
        id: venueId,
        name: "Royal Palace Banquet Hall",
        description:
          "A luxurious banquet hall with modern amenities and beautiful surroundings.",
        shortDescription: "Luxurious banquet hall for weddings and events",
        address: {
          street: "123 Wedding Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India",
        },
        capacity: {
          min: 50,
          max: 500,
        },
        pricePerDay: 35000,
        images: [
          {
            url: "https://source.unsplash.com/random/800x600/?venue,wedding",
            alt: "Venue main hall",
          },
          {
            url: "https://source.unsplash.com/random/800x600/?banquet",
            alt: "Banquet setup",
          },
          {
            url: "https://source.unsplash.com/random/800x600/?decoration",
            alt: "Wedding decoration",
          },
        ],
        amenities: [
          "Wifi",
          "Parking",
          "Air Conditioning",
          "Catering",
          "Sound System",
        ],
        rating: 4.8,
        vendor: {
          id: "vendor123",
          name: "Luxury Venues Inc.",
          responseRate: 98,
          responseTime: "within 2 hours",
        },
      });

      // Real API call would be:
      // const response = await api.get<any>(`/api/venues/${venueId}/`);
      // return response.data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch venue details");
    }
  },
};

export default venueService;
