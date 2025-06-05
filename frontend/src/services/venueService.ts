/**
 * Venue Service
 *
 * Handles all venue-related API calls connected to Django backend.
 */

import api from "./api";
import type { VenueSearchFilters, ApiResponse, Venue, Tehsil } from "../types";


// Backend response interfaces matching actual Django API
interface VenueListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendVenue[];
}

interface VenueImage {
  id: number;
  file_url: string;
  title?: string;
  is_cover: boolean;
  ordering: number;
  width?: number;
  height?: number;
  file_size?: number;
  file_format?: string;
}

interface VenueAmenity {
  id: number;
  name: string;
}

interface VenueCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

interface VenueState {
  id: number;
  name: string;
}

interface VenueDistrict {
  id: number;
  name: string;
  state: VenueState;
}

interface VenueTehsil {
  id: number;
  name: string;
  district: VenueDistrict;
}

interface BackendVenue {
  id: number;
  name: string;
  description?: string;
  category: VenueCategory;
  state: VenueState;
  district: VenueDistrict;
  tehsil: VenueTehsil;
  pincode: string;
  capacity: number;
  is_ac: boolean;
  indoor_outdoor: string;
  amenities: VenueAmenity[];
  cover_image?: VenueImage;
  images?: VenueImage[];
  status: string;
  is_featured: boolean;
  featured_priority: number;
  featured_tagline?: string;
  featured_from?: string;
  featured_until?: string;
  owner?: number;
  address_line?: string;
  last_rejection_reason?: string;
}

// Helper function to extract image URL from description
const extractImageFromDescription = (description: string | null): string | null => {
  if (!description) return null;
  
  const imageMatch = description.match(/Image:\s*(https?:\/\/[^\s]+)/);
  return imageMatch ? imageMatch[1] : null;
};

// Helper function to clean description by removing image URL
const cleanDescription = (description: string | null): string => {
  if (!description) return 'Beautiful venue perfect for your special occasion.';
  
  // Remove the image URL part from description
  const cleanedDesc = description.replace(/\s*Image:\s*https?:\/\/[^\s]+/g, '').trim();
  return cleanedDesc || 'Beautiful venue perfect for your special occasion.';
};

// Helper function to transform backend venue to frontend format
const transformVenue = (backendVenue: BackendVenue): Venue => {
  // Extract image URL from description
  const imageUrl = extractImageFromDescription(backendVenue.description);
  const cleanedDescription = cleanDescription(backendVenue.description);
  
  // Create images array
  let images = [];
  
  // First, try to use backend images if available
  if (backendVenue.images && backendVenue.images.length > 0) {
    images = backendVenue.images.map(img => ({
      url: img.file_url,
      alt: img.title || backendVenue.name,
      isPrimary: img.is_cover,
    }));
  } else if (backendVenue.cover_image) {
    images = [{
      url: backendVenue.cover_image.file_url,
      alt: backendVenue.cover_image.title || backendVenue.name,
      isPrimary: true,
    }];
  } else if (imageUrl) {
    // Use extracted image URL from description
    images = [{
      url: imageUrl,
      alt: backendVenue.name,
      isPrimary: true,
    }];
  } else {
    // Fallback to a default image
    images = [{
      url: 'https://images.unsplash.com/photo-1519167758481-83f29c8a4e0a?w=800&h=600&fit=crop',
      alt: backendVenue.name,
      isPrimary: true,
    }];
  }

  return {
    id: backendVenue.id.toString(),
    name: backendVenue.name,
    description: cleanedDescription,
    shortDescription: cleanedDescription.length > 100 ? 
      cleanedDescription.substring(0, 100) + '...' : 
      cleanedDescription,
    address: {
      street: backendVenue.address_line || '',
      city: backendVenue.district?.name || '',
      state: backendVenue.state?.name || '',
      zipCode: backendVenue.pincode || '',
      country: 'India',
    },
    location: {
      lat: 0,
      lng: 0,
    },
    capacity: {
      min: Math.floor(backendVenue.capacity * 0.8), // Estimate min as 80% of max
      max: backendVenue.capacity,
    },
    pricePerDay: 25000, // Default price since not in model
    pricePerHour: undefined,
    images: images,
    amenities: backendVenue.amenities.map(amenity => amenity.name),
    categories: [backendVenue.category.name],
    rating: 4.2 + Math.random() * 0.8, // Generate random rating for demo
    totalReviews: Math.floor(Math.random() * 50) + 10, // Generate random review count
    isFeatured: backendVenue.is_featured,
    isActive: backendVenue.status === 'Published',
    vendor: {
      id: backendVenue.owner?.toString() || '1',
      name: 'Venue Owner',
      contactName: 'Contact Person',
      email: 'contact@venue.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Venue service methods
const venueService = {
  // Get all venues with pagination and filters
  getVenues: async (
    filters: VenueSearchFilters = {},
  ): Promise<ApiResponse<{ venues: Venue[]; total: number; hasMore: boolean }>> => {
    try {
      // Build query params string from filters
      const params = new URLSearchParams();

      if (filters.page !== undefined && filters.page !== null)
        params.append("page", filters.page.toString());
      if (filters.limit !== undefined && filters.limit !== null)
        params.append("page_size", filters.limit.toString());
      if (filters.query) params.append("search", filters.query);
      if (filters.location) params.append("city", filters.location);
      if (filters.tehsil) params.append("tehsil", filters.tehsil);
      if (filters.startDate) params.append("start_date", filters.startDate);
      if (filters.endDate) params.append("end_date", filters.endDate);
      if (filters.minPrice !== undefined && filters.minPrice !== null)
        params.append("min_price", filters.minPrice.toString());
      if (filters.maxPrice !== undefined && filters.maxPrice !== null)
        params.append("max_price", filters.maxPrice.toString());
      if (filters.minCapacity !== undefined && filters.minCapacity !== null)
        params.append("min_capacity", filters.minCapacity.toString());
      if (filters.maxCapacity !== undefined && filters.maxCapacity !== null)
        params.append("max_capacity", filters.maxCapacity.toString());
      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach(amenity => params.append("amenities", amenity));
      }
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(category => params.append("categories", category));
      }

      if (filters.sort) {
        // Map frontend sort options to backend
        const sortMapping: Record<string, string> = {
          'price_asc': 'price_per_day',
          'price_desc': '-price_per_day',
          'rating_desc': '-rating',
          'name_asc': 'name',
          'name_desc': '-name',
          'created_desc': '-created_at',
        };
        params.append("ordering", sortMapping[filters.sort] || filters.sort);
      }


      const endpoint = `/api/venues/?${params.toString()}`;
      const response = await api.get<VenueListResponse | BackendVenue[]>(endpoint);

      if (response.success && response.data) {
        // Handle both paginated response and direct array response
        let venues: Venue[];
        let total: number;
        let hasMore: boolean;

        if (Array.isArray(response.data)) {
          // Direct array response
          venues = response.data.map(transformVenue);
          total = response.data.length;
          hasMore = false;
        } else {
          // Paginated response
          venues = response.data.results.map(transformVenue);
          total = response.data.count;
          hasMore = !!response.data.next;
        }

        return {
          success: true,
          data: {
            venues,
            total,
            hasMore,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch venues",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venues",
      };
    }
  },

  // Get featured venues
  getFeaturedVenues: async (): Promise<ApiResponse<Venue[]>> => {
    try {
      const response = await api.get<BackendVenue[]>("/api/featured-venues/");
      
      if (response.success && response.data) {
        const venues = response.data.map(transformVenue);

        return {
          success: true,
          data: venues,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch featured venues",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch featured venues",
      };
    }
  },

  // Get venue by ID
  getVenueById: async (venueId: string): Promise<ApiResponse<Venue>> => {
    try {
      const response = await api.get<BackendVenue>(`/api/venues/${venueId}/`);
      
      if (response.success && response.data) {
        const venue = transformVenue(response.data);
        return {
          success: true,
          data: venue,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch venue details",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venue details",
      };
    }
  },

  // Get venue availability
  getVenueAvailability: async (
    venueId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<{ available: boolean; conflictingDates?: string[] }>> => {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const response = await api.get<{ available: boolean; conflicting_dates?: string[] }>(
        `/api/venues/${venueId}/availability/?${params.toString()}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            available: response.data.available,
            conflictingDates: response.data.conflicting_dates,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to check venue availability",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to check venue availability",
      };
    }
  },

  // Get venue reviews
  getVenueReviews: async (
    venueId: string,
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<{ reviews: any[]; total: number; hasMore: boolean }>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const response = await api.get<{
        count: number;
        next: string | null;
        previous: string | null;
        results: any[];
      }>(`/api/venues/${venueId}/reviews/?${params.toString()}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            reviews: response.data.results,
            total: response.data.count,
            hasMore: !!response.data.next,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch venue reviews",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venue reviews",
      };
    }
  },

  // Get venue categories
  getVenueCategories: async (): Promise<ApiResponse<VenueCategory[]>> => {
    try {
      const response = await api.get<VenueCategory[]>("/api/venue-categories/");
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch venue categories",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venue categories",
      };
    }
  },

  // Get venue amenities
  getVenueAmenities: async (): Promise<ApiResponse<VenueAmenity[]>> => {
    try {
      const response = await api.get<VenueAmenity[]>("/api/venue-amenities/");
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch venue amenities",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch venue amenities",
      };
    }
  },

  // Get available tehsils for filtering
  getTehsils: async (): Promise<ApiResponse<Tehsil[]>> => {
    try {
      const response = await api.get<Tehsil[]>("/api/tehsils/");
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to fetch tehsils",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch tehsils",
      };
    }
  },

};

export default venueService;
