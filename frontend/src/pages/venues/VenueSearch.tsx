import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import {
  Loader2,
  Search,
  Users,
  MapPin,
  Calendar,
  Star,
  Filter,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VenueCapacityFilter } from "@/components/venues/VenueCapacityFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";





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
  const initialCapacity = searchParams.get("capacity") || "";
  const initialSort = searchParams.get("sort") || "rating_desc";
  const initialMinPrice = searchParams.get("min_price") || "";
  const initialMaxPrice = searchParams.get("max_price") || "";
  const initialAmenities = searchParams.get("amenities")?.split(",") || [];
  const initialFromDate = searchParams.get("from_date") || "";
  const initialToDate = searchParams.get("to_date") || "";

  // State for filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [capacity, setCapacity] = useState(initialCapacity);
  const [sortOption, setSortOption] = useState(initialSort);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMinPrice ? parseInt(initialMinPrice) : 1000,
    initialMaxPrice ? parseInt(initialMaxPrice) : 50000,
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialAmenities);
  const [fromDate, setFromDate] = useState<Date | undefined>(initialFromDate ? new Date(initialFromDate) : undefined);
  const [toDate, setToDate] = useState<Date | undefined>(initialToDate ? new Date(initialToDate) : undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);




  // List of available amenities
  const amenitiesList = [
    "Wifi",
    "Parking",
    "Air Conditioning",
    "Swimming Pool",
    "Kitchen",
    "Catering",
    "Sound System",
    "Decoration Services",
    "Indoor Space",
    "Outdoor Space",
    "Seating Arrangement",
    "Bridal Room",
  ];

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
    minCapacity: initialCapacity && initialCapacity !== "any" ? parseInt(initialCapacity) : undefined,
    minPrice: initialMinPrice ? parseInt(initialMinPrice) : undefined,
    maxPrice: initialMaxPrice ? parseInt(initialMaxPrice) : undefined,
    amenities: initialAmenities.length > 0 ? initialAmenities : undefined,
    startDate: initialFromDate || undefined,
    endDate: initialToDate || undefined,
    sort: initialSort as
      | "price_asc"
      | "price_desc"
      | "rating_desc"
      | "newest",
  });




  const totalVenues = meta.total;
  const totalPages = meta.totalPages;
  const currentPage = meta.page;

  // Handle search submission
  const handleSearch = () => {
    // Update URL search params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("query", searchQuery);
    if (capacity) newParams.set("capacity", capacity);
    if (sortOption) newParams.set("sort", sortOption);
    if (priceRange[0] > 1000)
      newParams.set("min_price", priceRange[0].toString());
    if (priceRange[1] < 50000)
      newParams.set("max_price", priceRange[1].toString());
    if (selectedAmenities.length > 0)
      newParams.set("amenities", selectedAmenities.join(","));
    if (fromDate) newParams.set("from_date", fromDate.toISOString().split('T')[0]);
    if (toDate) newParams.set("to_date", toDate.toISOString().split('T')[0]);

    setSearchParams(newParams);

    // Update venues filter
    setFilters({
      query: searchQuery || undefined,
      minCapacity: capacity && capacity !== "any" ? parseInt(capacity) : undefined,
      minPrice: priceRange[0] > 1000 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 50000 ? priceRange[1] : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      startDate: fromDate ? fromDate.toISOString().split('T')[0] : undefined,
      endDate: toDate ? toDate.toISOString().split('T')[0] : undefined,
      sort: sortOption as "price_asc" | "price_desc" | "rating_desc" | "newest",
      page: 1,
      limit: 9,
    });
  };




  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setCapacity("");
    setSortOption("rating_desc");
    setPriceRange([1000, 50000]);
    setSelectedAmenities([]);
    setFromDate(undefined);
    setToDate(undefined);
    setSearchParams({});
    setFilters({
      limit: 9,
      page: 1,
      sort: "rating_desc",
    });
  };

  // Handle individual filter removal
  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case "query":
        setSearchQuery("");
        break;
      case "capacity":
        setCapacity("");
        break;
      case "price":
        setPriceRange([1000, 50000]);
        break;
      case "amenity":
        if (value) {
          setSelectedAmenities((prev) => prev.filter((a) => a !== value));
        }
        break;
      case "fromDate":
        setFromDate(undefined);
        break;
      case "toDate":
        setToDate(undefined);
        break;
      default:
        break;
    }
    // Update URL params after removal
    const newParams = new URLSearchParams(searchParams);
    if (filterType === "query") newParams.delete("query");
    if (filterType === "capacity") newParams.delete("capacity");
    if (filterType === "price") {
      newParams.delete("min_price");
      newParams.delete("max_price");
    }
    if (filterType === "amenity" && value) {
      const currentAmenities = newParams.get("amenities")?.split(",") || [];
      const updatedAmenities = currentAmenities.filter((a) => a !== value);
      if (updatedAmenities.length > 0) {
        newParams.set("amenities", updatedAmenities.join(","));
      } else {
        newParams.delete("amenities");
      }
    }
    if (filterType === "fromDate") newParams.delete("from_date");
    if (filterType === "toDate") newParams.delete("to_date");
    setSearchParams(newParams);
    // Update filters for fetching
    setFilters({
      ...filters,
      query: filterType === "query" ? undefined : filters.query,
      minCapacity: filterType === "capacity" ? undefined : filters.minCapacity,
      minPrice: filterType === "price" ? undefined : filters.minPrice,
      maxPrice: filterType === "price" ? undefined : filters.maxPrice,
      amenities: filterType === "amenity" && value ? selectedAmenities.filter((a) => a !== value) : filters.amenities,
      startDate: filterType === "fromDate" ? undefined : filters.startDate,
      endDate: filterType === "toDate" ? undefined : filters.endDate,
      page: 1,
    });
  };






  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  // Format price to Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Search Input */}
            <div className="md:col-span-4">
              <Input
                placeholder="Search venues, locations, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* From Date */}
            <div className="md:col-span-2">
              <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm"
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {fromDate ? format(fromDate, "PPP") : <span>From Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setOpenFromDate(false);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="md:col-span-2">
              <Popover open={openToDate} onOpenChange={setOpenToDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm"
                    disabled={!fromDate}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {toDate ? format(toDate, "PPP") : <span>To Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setOpenToDate(false);
                    }}
                    initialFocus
                    disabled={(date) => !fromDate || date < fromDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Capacity Select */}
            <div className="md:col-span-2">
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Guest Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Capacity</SelectItem>
                  <SelectItem value="50">50+ guests</SelectItem>
                  <SelectItem value="100">100+ guests</SelectItem>
                  <SelectItem value="200">200+ guests</SelectItem>
                  <SelectItem value="300">300+ guests</SelectItem>
                  <SelectItem value="500">500+ guests</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Filter Button (Mobile) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader>
                    <SheetTitle>Filter Venues</SheetTitle>
                    <SheetDescription>
                      Refine your search with these filters
                    </SheetDescription>
                  </SheetHeader>

                  <div className="py-4 space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          min={1000}
                          max={50000}
                          step={1000}
                          value={priceRange}
                          onValueChange={(value) =>
                            setPriceRange(value as [number, number])
                          }
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Sort By</h3>
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating_desc">Top Rated</SelectItem>
                          <SelectItem value="price_asc">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="price_desc">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Amenities</h3>
                      <div className="space-y-2">
                        {amenitiesList.map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-${amenity}`}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <label
                              htmlFor={`mobile-${amenity}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button onClick={handleSearch}>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort By (Desktop) */}
            <div className="hidden md:block md:col-span-1">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating_desc">Top Rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1">
              <Button
                className="w-full"
                size="sm"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Search className="mr-1 h-3 w-3" />
                )}
                Search
              </Button>
            </div>



          </div>
        </div>
      </div>

      {/* Main Content Area with Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop Only) */}
        <div className="hidden lg:block">
          <div className="bg-card rounded-lg p-5 shadow-sm sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground text-sm"
              >
                Clear All
              </Button>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    <Slider
                      min={1000}
                      max={50000}
                      step={1000}
                      value={priceRange}
                      onValueChange={(value) =>
                        setPriceRange(value as [number, number])
                      }
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="capacity">
                <AccordionTrigger>Guest Capacity</AccordionTrigger>
                <AccordionContent>
                  <VenueCapacityFilter
                    selectedCapacity={capacity}
                    onChange={setCapacity}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="amenities">
                <AccordionTrigger>Amenities</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {amenitiesList.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button className="w-full mt-4" onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3">
          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
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
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <VenueCardSkeleton key={index} />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-lg mb-2">
                No venues found matching your criteria
              </p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
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
    </div>
  );
};

// Venue Card Component with enhanced design
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
