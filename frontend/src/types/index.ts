// User Types
export type UserRole = "user" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

// Venue Types
export interface Venue {
  id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  amenities: string[];
  categories: string[];
  pricePerHour?: number;
  pricePerDay: number;
  images: {
    url: string;
    alt: string;
    isPrimary?: boolean;
    isFeatured?: boolean;
  }[];
  availabilityExceptions?: {
    date: string;
    isAvailable: boolean;
    reason?: string;
  }[];
  reviews?: Review[];
  rating: number;
  totalReviews?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  vendor: {
    id: string;
    name: string;
    contactName?: string;
    email?: string;
    avatarUrl?: string;
    responseRate?: number;
    responseTime?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Search Types
export interface VenueSearchFilters {
  query?: string;
  location?: string;
  radius?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string[];
  categories?: string[];
  tehsil?: string;
  page?: number;
  limit?: number;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "newest";
}


// Tehsil Type for Dropdown
export interface Tehsil {
  id: number;
  name: string;
  district?: {
    id: number;
    name: string;
    state?: {
      id: number;
      name: string;
    };
  };
}


// Booking Types
export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  venue: {
    name: string;
    address: {
      city: string;
      state: string;
    };
    image: string;
  };
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  venueId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
  }[];
  lastMessage?: {
    content: string;
    sentAt: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: "credit_card" | "paypal" | "bank_transfer";
  last4?: string;
  expMonth?: number;
  expYear?: number;
  brand?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "booking_request"
    | "booking_confirmed"
    | "booking_cancelled"
    | "message"
    | "review"
    | "payment";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
