import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import venueService from "@/services/venueService";
import { Venue } from "@/types";

const Index = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.append("query", location);

    navigate(`/venues${params.toString() ? "?" + params.toString() : ""}`);
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchFeaturedVenues = async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        const response = await venueService.getFeaturedVenues();
        if (response.success && response.data) {
          // Limit to top 10 featured venues
          setFeaturedVenues(response.data.slice(0, 10));
        } else {
          setFeaturedVenues([]);
          setErrorFeatured(response.error || "Failed to load featured venues");
        }
      } catch (error: any) {
        setErrorFeatured(error.message || "Failed to load featured venues");
        setFeaturedVenues([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedVenues();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      }
    };

    if (carouselRef.current) {
      carouselRef.current.addEventListener('scroll', checkScroll);
      checkScroll();
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, [featuredVenues]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://cdn.pixabay.com/photo/2017/08/06/12/06/people-2591874_1280.jpg")'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="container relative z-20 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Get Your Perfect Wedding Venue
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white">
              Explore beautiful venues that can host your wedding guests
            </p>

            {/* Search Box */}
            <div className="max-w-7xl mx-auto">
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-md items-center"
              >
                {/* Location */}
                <div className="flex flex-col flex-grow min-w-[220px]">
                  <div className="relative flex-grow">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <Input
                      type="text"
                      placeholder="Location (Tehsil, District, State)"
                      className="pl-10 w-full h-12 rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>


                {/* Find Venues Button */}
                <div className="flex flex-col flex-grow-0 min-w-[140px]">
                  <Button
                    type="submit"
                    className="w-full px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    style={{ minHeight: '48px' }}
                  >
                    <Search className="mr-2 h-5 w-5" /> Find Venues
                  </Button>
                </div>
              </form>

              {/* Rest of the component JSX */}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Featured Venues</h2>
            <p className="text-muted-foreground mt-2">
              Discover some of our most popular wedding venues
            </p>
          </div>

          {loadingFeatured && <p className="text-center">Loading featured venues...</p>}
          {errorFeatured && <p className="text-red-600 text-center">{errorFeatured}</p>}

          {featuredVenues.length > 0 && (
            <div className="relative">
              {/* Navigation Buttons for Desktop */}
              <div className="hidden lg:block">
                {canScrollLeft && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                    onClick={scrollLeft}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {canScrollRight && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                    onClick={scrollRight}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>

              {/* Carousel Container */}
              <div
                ref={carouselRef}
                className="overflow-hidden whitespace-nowrap scroll-smooth"
                style={{ scrollbarWidth: 'none' /* Firefox */, msOverflowStyle: 'none' /* IE and Edge */ }}
              >
                <div className="inline-flex gap-4">
                  {/* Featured Venue Cards */}
                  {featuredVenues.map((venue) => (
                    <div key={venue.id} className="w-[calc(33.33%-1rem)] inline-block">
                      <Card className="overflow-hidden border h-full">
                        <img
                          src={venue.images?.[0]?.url || "https://source.unsplash.com/random/600x400/?venue,wedding"}
                          alt={venue.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://source.unsplash.com/random/600x400/?venue,wedding";
                          }}
                        />
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{venue.name}</h3>
                            <div className="text-lg font-semibold">
                              ₹{venue.pricePerDay?.toLocaleString("en-IN") || "N/A"}
                              <span className="text-sm text-muted-foreground">
                                /day
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm mb-4">
                            <MapPin className="mr-1 h-4 w-4" />
                            {`${venue.address.city}, ${venue.address.state}`}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-accent px-2 py-1 rounded">
                              <Users className="mr-1 h-4 w-4 text-accent-foreground" />
                              <span className="text-sm">
                                Up to {venue.capacity.max} guests
                              </span>
                            </div>
                            <Link to={`/venues/${venue.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/venues">
              <Button size="lg">View All Venues</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">
              Finding your perfect rural wedding venue is easy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Search</h3>
              <p className="text-muted-foreground">
                Enter your location to find beautiful venues for your wedding
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Book</h3>
              <p className="text-muted-foreground">
                Select your dates and book your venue with simple availability
                checks
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                  <path d="M11 17v.01" />
                  <path d="M7 14v.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Celebrate</h3>
              <p className="text-muted-foreground">
                Enjoy your special day in a beautiful setting with your loved
                ones
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
