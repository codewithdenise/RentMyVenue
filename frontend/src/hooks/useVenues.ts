import { useState, useEffect, useCallback } from "react";
import venueService from "../services/venueService";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export function useVenues(initialFilters = {}) {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>(initialFilters);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchVenues = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<any[]> = await venueService.getVenues(filters);
      if (response.success) {
        setVenues(response.data || []);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        setError(response.error || "Failed to fetch venues");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues(filters);
  }, [filters, fetchVenues]);

  return {
    venues,
    loading,
    error,
    filters,
    setFilters,
    meta,
    fetchVenues,
  };
}
