import { useState, useEffect, useCallback } from "react";

import venueService from "../services/venueService";
import type { VenueSearchFilters, Venue } from "../types";


export function useVenues(initialFilters: VenueSearchFilters = {}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VenueSearchFilters>(initialFilters);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchVenues = useCallback(async (filters: VenueSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await venueService.getVenues(filters);
      if (response.success && response.data) {
        setVenues(response.data.venues);
        setMeta({
          total: response.data.total,
          page: filters.page || 1,
          limit: filters.limit || 10,
          totalPages: Math.ceil(response.data.total / (filters.limit || 10)),
        });
      } else {
        setError(response.error || "Failed to fetch venues");
        setVenues([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setVenues([]);
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
