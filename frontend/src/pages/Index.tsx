import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.append("query", location);
    if (capacity) params.append("capacity", capacity);

    navigate(`/venues${params.toString() ? "?" + params.toString() : ""}`);
  };

  // Featured venues
  const featuredVenues = [
    {
      name: "Green Valley Farm",
      location: "Coimbatore, Tamil Nadu",
      image:
        "https://source.unsplash.com/random/600x400/?rural,wedding,venue,farm&sig=1",
      capacity: 250,
      price: 75000,
    },
    {
      name: "Lakeside Manor",
      location: "Shimla, Himachal Pradesh",
      image:
        "https://source.unsplash.com/random/600x400/?rural,wedding,venue,lake&sig=2",
      capacity: 150,
      price: 60000,
    },
    {
      name: "Heritage Garden",
      location: "Jaipur, Rajasthan",
      image:
        "https://source.unsplash.com/random/600x400/?rural,wedding,venue,garden&sig=3",
      capacity: 400,
      price: 90000,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/20">
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Find Your Perfect Wedding Venue
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover beautiful venues that can accommodate your wedding guests
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-2 bg-card p-4 rounded-lg shadow"
              >
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Location (District, State)"
                    className="pl-10 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="relative flex-grow-0 w-full md:w-auto">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <select
                    className="w-full md:w-48 h-10 pl-10 pr-4 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  >
                    <option value="">Number of guests</option>
                    <option value="50">50+ guests</option>
                    <option value="100">100+ guests</option>
                    <option value="200">200+ guests</option>
                    <option value="300">300+ guests</option>
                    <option value="500">500+ guests</option>
                  </select>
                </div>
                <Button type="submit" className="px-8">
                  <Search className="mr-2 h-4 w-4" /> Find Venues
                </Button>
              </form>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Venue Cards */}
            {featuredVenues.map((venue, i) => (
              <Card key={i} className="overflow-hidden border">
                <img
                  src={venue.image}
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
                      ₹{venue.price.toLocaleString("en-IN")}
                      <span className="text-sm text-muted-foreground">
                        /day
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="mr-1 h-4 w-4" />
                    {venue.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-accent px-2 py-1 rounded">
                      <Users className="mr-1 h-4 w-4 text-accent-foreground" />
                      <span className="text-sm">
                        Up to {venue.capacity} guests
                      </span>
                    </div>
                    <Link to="/venues">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                Enter your location and guest count to find venues that can
                accommodate your wedding
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

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Venue?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start your search today and discover the perfect setting for your
            special day
          </p>
          <Link to="/venues">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              Browse Venues
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
