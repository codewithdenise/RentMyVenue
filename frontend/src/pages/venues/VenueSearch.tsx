import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";
import { Venue } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const VenueSearch: React.FC = () => {
  // Get search params from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialCapacity = searchParams.get("capacity") || "";

  // State for filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [capacity, setCapacity] = useState(initialCapacity);

  // Fetch venues with initial search params
  const {
    venues,
    isLoading,
    error,
    totalVenues,
    totalPages,
    currentPage,
    fetchNextPage,
    fetchPreviousPage,
    setFilters,
  } = useVenues({
    initialFilters: {
      limit: 9,
      query: initialQuery || undefined,
      minCapacity: initialCapacity ? parseInt(initialCapacity) : undefined,
      sort: "rating_desc",
    },
    autoFetch: true,
  });

  // Handle search submission
  const handleSearch = () => {
    // Update URL search params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("query", searchQuery);
    if (capacity) newParams.set("capacity", capacity);
    setSearchParams(newParams);

    // Update venues filter
    setFilters({
      query: searchQuery || undefined,
      minCapacity: capacity ? parseInt(capacity) : undefined,
      page: 1,
    });
  };

  return (
    <div className="container mx-auto py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Wedding Venue</h1>
        <p className="text-muted-foreground mb-6">
          Discover venues that will accommodate all your wedding guests
        </p>

        {/* Search Bar */}
        <div className="bg-card shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5">
              <Input
                placeholder="Search venues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Capacity Select */}
            <div className="md:col-span-5">
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger>
                  <SelectValue placeholder="Guest Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Capacity</SelectItem>
                  <SelectItem value="50">50+ guests</SelectItem>
                  <SelectItem value="100">100+ guests</SelectItem>
                  <SelectItem value="200">200+ guests</SelectItem>
                  <SelectItem value="300">300+ guests</SelectItem>
                  <SelectItem value="500">500+ guests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <Button
                className="w-full"
                onClick={handleSearch}
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
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {isLoading
            ? "Loading venues..."
            : `Showing ${venues.length} of ${totalVenues} venues`}
          {capacity ? ` with ${capacity}+ guests capacity` : ""}
        </p>
      </div>

      {/* Results Grid */}
      {error ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-destructive text-lg">
            Error loading venues. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      ) : isLoading && venues.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-lg mb-2">No venues found matching your criteria</p>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setCapacity("");
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
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                onClick={fetchPreviousPage}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={fetchNextPage}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Venue Card Component
const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={
            venue.images[0]?.url ||
            "https://source.unsplash.com/random/600x400/?venue,wedding"
          }
          alt={venue.name}
          className="h-52 w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://source.unsplash.com/random/600x400/?venue,wedding";
          }}
        />
      </div>
      <CardContent className="py-4 flex-grow">
        <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {venue.address.city}, {venue.address.state}
        </div>

        <div className="flex items-center gap-1 mb-3 bg-muted/50 p-2 rounded-lg">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Up to {venue.capacity.max} guests
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {venue.shortDescription ||
            venue.description.substring(0, 120) + "..."}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center border-t pt-3">
        <div className="text-lg font-semibold">
          ₹{venue.pricePerDay.toLocaleString("en-IN")}
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
