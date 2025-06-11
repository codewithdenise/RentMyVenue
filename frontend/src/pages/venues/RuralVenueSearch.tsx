import { useState, useEffect, FC } from "react";

import { Loader2, Search, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RuralVenueCard from "@/components/venues/RuralVenueCard";
import VenueCapacityFilter from "@/components/venues/VenueCapacityFilter";
import { useVenues } from "@/hooks/useVenues";
import type { Venue } from "@/types";

const RuralVenueSearch: FC = function RuralVenueSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCapacity = parseInt(searchParams.get("capacity") || "0");
  const initialLocation = searchParams.get("location") || "";

  const [capacity, setCapacity] = useState(initialCapacity);
  const [location, setLocation] = useState(initialLocation);
  const [isSearching, setIsSearching] = useState(false);

  // Get venues with initial parameters
  const {
    venues,
    loading,
    error,
    meta,
    filters,
    setFilters,
    fetchVenues,
  } = useVenues({
    limit: 9,
    minCapacity: initialCapacity > 0 ? initialCapacity : undefined,
    location: initialLocation || undefined,
  });

  // Handle capacity change
  const handleCapacityChange = (capacity: string) => {
    setCapacity(parseInt(capacity));
  };

  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    setSearchParams({
      ...(capacity > 0 ? { capacity: capacity.toString() } : {}),
      ...(location ? { location } : {}),
    });

    setFilters({
      minCapacity: capacity > 0 ? capacity : undefined,
      location: location || undefined,
      page: 1,
    });
  };

  // Re-fetch when search parameters change
  useEffect(() => {
    if (isSearching) {
      fetchVenues(filters).then(() => {
        setIsSearching(false);
      });
    }
  }, [isSearching, fetchVenues, filters]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <img
          src="https://source.unsplash.com/random/1400x400/?rural,wedding,venue"
          alt="Rural Wedding Venues"
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-black/50 flex flex-col justify-center px-6 md:px-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Find Your Perfect Rural Wedding Venue
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-6">
            Discover beautiful venues for your special day in the countryside
          </p>

          {/* Search Box */}
          <div className="bg-card p-4 rounded-lg shadow-md max-w-3xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter location..."
                  className="pl-10 w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button
                className="gap-2"
                onClick={handleSearch}
                disabled={loading || isSearching}
              >
                {loading || isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Find Venues
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-1">
          <div className="sticky top-20 space-y-6">
            <VenueCapacityFilter
              onChange={handleCapacityChange}
              selectedCapacity={capacity.toString()}
            />

            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={loading || isSearching}
            >
              {loading || isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-1 md:col-span-3">
          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Rural Wedding Venues
            </h2>
            <p className="text-muted-foreground">
              {loading
                ? "Finding available venues..."
                : `Showing ${venues.length} of ${meta.total} venues`}
              {capacity > 0 ? ` for ${capacity}+ guests` : ""}
              {location ? ` in ${location}` : ""}
            </p>
          </div>

          {/* Results */}
          {error ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-destructive text-lg">
                Error loading venues. Please try again.
              </p>
            </div>
          ) : loading && venues.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-lg mb-2">
                No venues found matching your criteria
              </p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your guest count or location
              </p>
              <Button
                onClick={() => {
                  setCapacity(0);
                  setLocation("");
                  setSearchParams({});
                  setFilters({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue: Venue) => (
                  <RuralVenueCard key={venue.id} venue={venue} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ ...filters, page: Math.max(meta.page - 1, 1) })}
                    disabled={meta.page <= 1 || loading}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 bg-muted rounded-md">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ ...filters, page: Math.min(meta.page + 1, meta.totalPages) })}
                    disabled={meta.page >= meta.totalPages || loading}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuralVenueSearch;
