/**
 * Venue Service
 *
 * Handles all venue-related API calls.
 */

import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

// Venue service methods
const venueService = {
  // Get all venues with pagination and filters
  getVenues: async (
    filters: Record<string, any> = {}
  ): Promise<ApiResponse<any[]>> => {
    try {
      // Build query params string from filters
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.query) params.append("query", filters.query);
      if (filters.location) params.append("location", filters.location);
      if (filters.minPrice !== undefined) params.append("min_price", filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append("max_price", filters.maxPrice.toString());
      if (filters.minCapacity !== undefined) params.append("min_capacity", filters.minCapacity.toString());
      if (filters.maxCapacity !== undefined) params.append("max_capacity", filters.maxCapacity.toString());
      if (filters.amenities && filters.amenities.length > 0) {
        params.append("amenities", filters.amenities.join(","));
      }
      if (filters.categories && filters.categories.length > 0) {
        params.append("categories", filters.categories.join(","));
      }
      if (filters.sort) params.append("sort", filters.sort);

      const endpoint = `/venues/?${params.toString()}`;

      const response = await api.get(endpoint);

      // Ensure response.data is always an array
      if (response.data && !Array.isArray(response.data)) {
        response.data = [];
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venues",
        data: [],
      };
    }
  },
};

export default venueService;
