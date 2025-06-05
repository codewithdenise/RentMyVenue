import { useState, useCallback, useEffect } from "react";
import { Booking, ApiResponse } from "@/types";
import bookingService from "@/services/bookingService";
import { useAuth } from "./useAuth";

// Hook for user's bookings
interface UseUserBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchUserBookings: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
}

export function useUserBookings(): UseUserBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserBookings = useCallback(async (): Promise<void> => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: ApiResponse<Booking[]> =
        await bookingService.getUserBookings(user.id);

      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.error || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching bookings");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<Booking> =
          await bookingService.cancelBooking(bookingId);

        if (response.success && response.data) {
          // Update the local bookings state
          setBookings((prevBookings) =>
            prevBookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, status: "cancelled", paymentStatus: "refunded" }
                : booking,
            ),
          );
          return true;
        } else {
          setError(response.error || "Failed to cancel booking");
          return false;
        }
      } catch (err) {
        setError("An error occurred while cancelling the booking");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch bookings when component mounts
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, fetchUserBookings]);

  return {
    bookings,
    isLoading,
    error,
    fetchUserBookings,
    cancelBooking,
  };
}

// Hook for venue bookings (for vendors)
interface UseVenueBookingsProps {
  venueId?: string;
  autoFetch?: boolean;
}

interface UseVenueBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchVenueBookings: () => Promise<void>;
  updateBookingStatus: (
    bookingId: string,
    status: Booking["status"],
  ) => Promise<boolean>;
}

export function useVenueBookings({
  venueId,
  autoFetch = true,
}: UseVenueBookingsProps): UseVenueBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVenueBookings = useCallback(async (): Promise<void> => {
    if (!venueId) {
      setError("Venue ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: ApiResponse<Booking[]> =
        await bookingService.getVenueBookings(venueId);

      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.error || "Failed to fetch venue bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching venue bookings");
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: Booking["status"]): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<Booking> =
          await bookingService.updateBookingStatus(bookingId, status);

        if (response.success && response.data) {
          // Update the local bookings state
          setBookings((prevBookings) =>
            prevBookings.map((booking) =>
              booking.id === bookingId
                ? {
                    ...booking,
                    status,
                    paymentStatus: getPaymentStatus(status),
                  }
                : booking,
            ),
          );
          return true;
        } else {
          setError(response.error || "Failed to update booking status");
          return false;
        }
      } catch (err) {
        setError("An error occurred while updating the booking");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Helper function to determine payment status based on booking status
  const getPaymentStatus = (
    status: Booking["status"],
  ): Booking["paymentStatus"] => {
    switch (status) {
      case "cancelled":
        return "refunded";
      case "confirmed":
      case "completed":
        return "paid";
      default:
        return "pending";
    }
  };

  // Fetch bookings when component mounts if autoFetch is true
  useEffect(() => {
    if (autoFetch && venueId) {
      fetchVenueBookings();
    }
  }, [autoFetch, venueId, fetchVenueBookings]);

  return {
    bookings,
    isLoading,
    error,
    fetchVenueBookings,
    updateBookingStatus,
  };
}

// Hook for a single booking
interface UseBookingProps {
  bookingId?: string;
  autoFetch?: boolean;
}

interface UseBookingReturn {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  fetchBooking: () => Promise<void>;
  cancelBooking: () => Promise<boolean>;
  updateStatus: (status: Booking["status"]) => Promise<boolean>;
}

export function useBooking({
  bookingId,
  autoFetch = true,
}: UseBookingProps): UseBookingReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async (): Promise<void> => {
    if (!bookingId) {
      setError("Booking ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: ApiResponse<Booking> =
        await bookingService.getBooking(bookingId);

      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setError(response.error || "Failed to fetch booking");
      }
    } catch (err) {
      setError("An error occurred while fetching the booking");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const cancelBooking = useCallback(async (): Promise<boolean> => {
    if (!bookingId) {
      setError("Booking ID is required");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: ApiResponse<Booking> =
        await bookingService.cancelBooking(bookingId);

      if (response.success && response.data) {
        setBooking(response.data);
        return true;
      } else {
        setError(response.error || "Failed to cancel booking");
        return false;
      }
    } catch (err) {
      setError("An error occurred while cancelling the booking");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const updateStatus = useCallback(
    async (status: Booking["status"]): Promise<boolean> => {
      if (!bookingId) {
        setError("Booking ID is required");
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<Booking> =
          await bookingService.updateBookingStatus(bookingId, status);

        if (response.success && response.data) {
          setBooking(response.data);
          return true;
        } else {
          setError(response.error || "Failed to update booking status");
          return false;
        }
      } catch (err) {
        setError("An error occurred while updating the booking");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [bookingId],
  );

  // Fetch booking when component mounts if autoFetch is true
  useEffect(() => {
    if (autoFetch && bookingId) {
      fetchBooking();
    }
  }, [autoFetch, bookingId, fetchBooking]);

  return {
    booking,
    isLoading,
    error,
    fetchBooking,
    cancelBooking,
    updateStatus,
  };
}
