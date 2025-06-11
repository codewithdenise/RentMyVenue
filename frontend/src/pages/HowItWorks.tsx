import * as React from "react";

import { Search, Calendar, Users, MapPin, Shield, Clock, CreditCard, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";



const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How RentMyVenue Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Your journey to finding the perfect wedding venue starts here
            </p>
          </div>
        </div>
      </section>

      {/* Main Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1: Search */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Search</h3>
              <p className="text-muted-foreground">
                Enter your preferred location and dates to discover beautiful wedding venues. 
                Filter by capacity, price range, and amenities to find venues that match your needs.
              </p>
            </div>

            {/* Step 2: Book */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Book</h3>
              <p className="text-muted-foreground">
                Browse venue details, check real-time availability, and secure your date instantly. 
                Our streamlined booking process makes planning your special day effortless.
              </p>
            </div>

            {/* Step 3: Celebrate */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <HeartHandshake className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Celebrate</h3>
              <p className="text-muted-foreground">
                Create lasting memories in your chosen venue. Our dedicated support team ensures 
                everything runs smoothly from booking to your special day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose RentMyVenue
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Verified Venues */}
            <div className="flex flex-col items-center text-center p-6">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Venues</h3>
              <p className="text-muted-foreground">
                All venues are personally verified to ensure quality and accuracy
              </p>
            </div>

            {/* Real-time Availability */}
            <div className="flex flex-col items-center text-center p-6">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Availability</h3>
              <p className="text-muted-foreground">
                Check venue availability instantly and book your preferred dates
              </p>
            </div>

            {/* Secure Payments */}
            <div className="flex flex-col items-center text-center p-6">
              <CreditCard className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                Safe and secure payment processing for your peace of mind
              </p>
            </div>

            {/* Guest Capacity */}
            <div className="flex flex-col items-center text-center p-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Guest Management</h3>
              <p className="text-muted-foreground">
                Find venues that perfectly accommodate your guest list
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Find Your Perfect Venue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your search today and discover beautiful venues for your special day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/venues">
                <Button size="lg" className="min-w-[200px]">
                  <Search className="mr-2 h-5 w-5" />
                  Search Venues
                </Button>
              </Link>
              <Link to="/become-a-host">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  <MapPin className="mr-2 h-5 w-5" />
                  List Your Venue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
