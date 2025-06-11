import * as React from "react";
import { useState, useCallback } from "react";

import debounce from "lodash.debounce";
import {
  X,
  Loader2,
  Search,
  Star,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/hooks/useVenues";
import { Venue } from "@/types";



// Placeholder venue cards for loading state
const VenueCardSkeleton = () => (
  <Card className="overflow-hidden h-full flex flex-col">
    <Skeleton className="h-52 w-full" />
    <CardContent className="py-4 flex-grow">
      <Skeleton className="h-6 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-8 w-1/3 rounded-lg mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-4/5" />
    </CardContent>
    <CardFooter className="pt-0 flex justify-between items-center border-t pt-3">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </CardFooter>
  </Card>
);

const VenueSearch: React.FC = () => {
  // Get search params from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  // State for search
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Fetch venues with initial search params
  const {
    venues,
    loading: isLoading,
    error,
    meta,
    setFilters,
    filters,
  } = useVenues({
    limit: 9,
    query: initialQuery || undefined,
    sort: "rating_desc",
  });

  const totalVenues = meta.total;
  const totalPages = meta.totalPages;
  const currentPage = meta.page;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      // Update URL search params
      const newParams = new URLSearchParams();
      if (searchQuery) newParams.set("query", searchQuery);
      setSearchParams(newParams);

      // Update venues filter
      setFilters({
        query: searchQuery || undefined,
        sort: "rating_desc",
        page: 1,
        limit: 9,
      });
    }, 500),
    [searchQuery, setSearchParams, setFilters]
  );

  // Handle immediate search on input change
  const handleSearch = () => {
    debouncedSearch();
  };

  // Handle Enter key press for immediate search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      debouncedSearch.cancel();
      handleSearch();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setFilters({
      limit: 9,
      page: 1,
      sort: "rating_desc",
    });
  };

  return (
    <div className="container mx-auto py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Find Your Perfect Wedding Venue
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse through our collection of beautiful venues for your special day
        </p>

        {/* Search Bar */}
        <div className="bg-card shadow rounded-lg p-4 mb-8">
          <div className="flex gap-2">
            {/* Search Input with Clear Button */}
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search by venue, city, state, or tehsil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={() => {
                debouncedSearch.cancel();
                handleSearch();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading venues..."
              : `Showing ${venues.length} of ${totalVenues} venues`}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </p>
        </div>

        {/* Results Grid */}
        {error ? (
          <div className="text-center py-12 bg-muted rounded-lg" role="alert">
            <p className="text-destructive text-lg">
              Error loading venues. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4" aria-label="Refresh page">
              Refresh Page
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading venues">
            {[...Array(6)].map((_, index) => (
              <VenueCardSkeleton key={index} />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg" role="alert">
            <p className="text-lg mb-2">
              No results found{searchQuery ? ` for "${searchQuery}"` : ""}.
            </p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms
            </p>
            <Button onClick={handleClearSearch} aria-label="Clear search">Clear Search</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue: Venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: Math.max(1, currentPage - 1) })}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: Math.min(totalPages, currentPage + 1) })}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Venue Card Component
const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={
            venue.images[0]?.url ||
            "https://source.unsplash.com/random/600x400/?venue,wedding"
          }
          alt={venue.name}
          className="h-52 w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://source.unsplash.com/random/600x400/?venue,wedding";
          }}
        />
        {venue.categories && venue.categories.length > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
              {venue.categories[0]}
            </span>
          </div>
        )}
      </div>
      <CardContent className="py-4 flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold">{venue.name}</h3>
          {venue.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium">
                {venue.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {venue.address?.city || "City"}, {venue.address?.state || "State"}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Up to {typeof venue.capacity === 'object' ? venue.capacity?.max : venue.capacity || 100} guests
            </span>
          </div>

          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Available</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {venue.shortDescription ||
            venue.description?.substring(0, 120) + "..." ||
            "A beautiful venue perfect for your special occasion. Contact for more details."}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center border-t pt-3">
        <div className="text-lg font-semibold">
          ₹{(venue.pricePerDay || 25000).toLocaleString("en-IN")}
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <Link to={`/venues/${venue.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default VenueSearch;
