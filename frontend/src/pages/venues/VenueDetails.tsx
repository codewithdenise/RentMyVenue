import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVenue } from "@/hooks/useVenues";
import {
  Calendar,
  MapPin,
  Users,
  Phone,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { AuthModalType } from "@/components/auth/AuthModals";

interface VenueDetailsProps {
  openAuthModal?: (type: AuthModalType) => void;
}

const VenueDetails: React.FC<VenueDetailsProps> = ({ openAuthModal }) => {
  const { id } = useParams<{ id: string }>();
  const { venue, isLoading, error } = useVenue({ id, autoFetch: true });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [guestCount, setGuestCount] = useState<string>("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Date options for booking (for demo purposes)
  const availableDates = [
    { date: "2023-11-25", day: "Sat, 25 Nov" },
    { date: "2023-11-26", day: "Sun, 26 Nov" },
    { date: "2023-12-02", day: "Sat, 2 Dec" },
    { date: "2023-12-03", day: "Sun, 3 Dec" },
    { date: "2023-12-09", day: "Sat, 9 Dec" },
    { date: "2023-12-10", day: "Sun, 10 Dec" },
  ];

  const handleBooking = () => {
    if (!isAuthenticated && openAuthModal) {
      openAuthModal("signin");
      return;
    }

    // In a real app, we would handle the booking logic here
    alert(
      `Booking request for ${venue?.name} on ${selectedDate} for ${guestCount} guests`,
    );
  };

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send the enquiry to the backend
    setShowEnquiryForm(false);
    alert("Your enquiry has been sent to the venue owner.");
  };

  if (isLoading) {
    return <VenueDetailsSkeleton />;
  }

  if (error || !venue) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-16 bg-muted rounded-lg">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Venue Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The venue you're looking for doesn't exist or there was an error
            loading it.
          </p>
          <Button onClick={() => navigate("/venues")}>
            Browse Other Venues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Results
        </Button>
      </div>

      {/* Venue Title Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{venue.name}</h1>
        <div className="flex items-center mt-2 text-muted-foreground">
          <MapPin className="h-5 w-5 mr-1" />
          <span>
            {venue.address.street}, {venue.address.city}, {venue.address.state},{" "}
            {venue.address.zipCode}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden h-[400px]">
            <img
              src={venue.images[selectedImageIndex]?.url}
              alt={`${venue.name} - Main Image`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://source.unsplash.com/random/800x600/?wedding,venue";
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() =>
                setSelectedImageIndex(
                  (prev) =>
                    (prev - 1 + venue.images.length) % venue.images.length,
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() =>
                setSelectedImageIndex(
                  (prev) => (prev + 1) % venue.images.length,
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-2">
          {venue.images.slice(0, 4).map((image, i) => (
            <div
              key={i}
              className={`relative rounded-lg overflow-hidden h-[195px] cursor-pointer ${
                i === selectedImageIndex ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedImageIndex(i)}
            >
              <img
                src={image.url}
                alt={`${venue.name} - Image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://source.unsplash.com/random/400x300/?wedding,venue";
                }}
              />
              {i === 3 && venue.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    +{venue.images.length - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail Gallery for Mobile */}
      <div className="flex lg:hidden gap-2 overflow-x-auto mb-8 pb-2">
        {venue.images.map((image, i) => (
          <div
            key={i}
            className={`relative rounded-lg overflow-hidden h-16 w-24 flex-shrink-0 cursor-pointer ${
              i === selectedImageIndex ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedImageIndex(i)}
          >
            <img
              src={image.url}
              alt={`${venue.name} - Thumbnail ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://source.unsplash.com/random/100x100/?wedding,venue";
              }}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Venue Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-lg">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <span className="font-bold text-lg">
                    {venue.capacity.max}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Max Guests
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <svg
                    className="h-6 w-6 text-primary mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  <span className="font-bold text-lg">
                    {venue.rating.toFixed(1)}/5
                  </span>
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <span className="font-bold text-lg">
                    {venue.vendor.responseTime}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Response Time
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="h-6 w-6 text-primary mb-2" />
                  <span className="font-bold text-lg">Flexible</span>
                  <span className="text-sm text-muted-foreground">
                    Cancellation
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-2">About This Venue</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {venue.description}
                </p>
              </div>

              {/* Capacity Details */}
              <div>
                <h2 className="text-xl font-bold mb-2">Capacity Information</h2>
                <div className="bg-accent/20 p-4 rounded-lg border border-accent/30">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-primary mr-2" />
                    <span className="font-medium">
                      This venue can accommodate between {venue.capacity.min}{" "}
                      and {venue.capacity.max} guests
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">
                        Minimum
                      </div>
                      <div className="text-lg font-bold">
                        {venue.capacity.min} Guests
                      </div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">
                        Recommended
                      </div>
                      <div className="text-lg font-bold">
                        {Math.round(
                          (venue.capacity.min + venue.capacity.max) / 2,
                        )}{" "}
                        Guests
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md text-center">
                      <div className="text-sm text-muted-foreground">
                        Maximum
                      </div>
                      <div className="text-lg font-bold">
                        {venue.capacity.max} Guests
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-bold mb-4">Location</h2>
                <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30712.144916174317!2d${
                      venue.address.longitude || 76.9214289
                    }!3d${
                      venue.address.latitude || 11.0168445
                    }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f971cb5%3A0x2fc1c81e183ed282!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1646754229503!5m2!1sen!2sin`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
                <div className="mt-3 text-muted-foreground">
                  <p>
                    {venue.address.street}, {venue.address.city},{" "}
                    {venue.address.state}, {venue.address.zipCode}
                  </p>
                </div>
              </div>

              {/* Vendor Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Hosted by</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted mr-4">
                    <img
                      src={venue.vendor.avatarUrl}
                      alt={venue.vendor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://source.unsplash.com/random/100x100/?portrait";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{venue.vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Venue Manager • {venue.vendor.responseRate}% response rate
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Venue Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venue.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-accent/10 p-3 rounded-lg"
                  >
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {venue.amenities.length === 0 && (
                <p className="text-muted-foreground">
                  No amenities listed for this venue.
                </p>
              )}

              <h2 className="text-xl font-bold mb-4 mt-8">Venue Categories</h2>
              <div className="flex flex-wrap gap-2">
                {venue.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Reviews ({venue.reviews.length})
                </h2>
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-2">
                    {venue.rating.toFixed(1)}
                  </div>
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(venue.rating)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {venue.reviews.length === 0 ? (
                  <p className="text-muted-foreground">
                    No reviews yet for this venue.
                  </p>
                ) : (
                  venue.reviews.slice(0, 5).map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-border pb-4 last:border-0"
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted mr-3">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://source.unsplash.com/random/100x100/?portrait";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{review.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                              },
                            )}
                          </div>
                        </div>
                        <div className="ml-auto flex">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                )}

                {venue.reviews.length > 5 && (
                  <Button variant="outline" className="w-full">
                    View All {venue.reviews.length} Reviews
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Booking Widget */}
        <div>
          <div className="sticky top-24">
            <Card className="border border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-bold">
                      ₹{venue.pricePerDay.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground text-sm">/day</span>
                  </div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      Capacity: {venue.capacity.min}-{venue.capacity.max} guests
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates.map((date) => (
                      <Button
                        key={date.date}
                        variant={
                          selectedDate === date.date ? "default" : "outline"
                        }
                        className="h-auto py-2 text-xs"
                        onClick={() => setSelectedDate(date.date)}
                      >
                        {date.day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Guests
                  </label>
                  <select
                    className="w-full h-10 pl-3 pr-10 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  >
                    <option value="">Select guest count</option>
                    {[50, 100, 150, 200, 250, 300].map((num) => (
                      <option
                        key={num}
                        value={num.toString()}
                        disabled={
                          num < venue.capacity.min || num > venue.capacity.max
                        }
                      >
                        {num} guests
                        {num < venue.capacity.min
                          ? " (Too few)"
                          : num > venue.capacity.max
                            ? " (Too many)"
                            : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between mb-2">
                    <span>Venue Rental</span>
                    <span>₹{venue.pricePerDay.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-muted-foreground">
                    <span>Service fee</span>
                    <span>
                      ₹
                      {Math.round(venue.pricePerDay * 0.1).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>
                      ₹
                      {Math.round(venue.pricePerDay * 1.1).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedDate || !guestCount}
                  onClick={handleBooking}
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEnquiryForm(true)}
                >
                  Contact Host
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Similar Venues Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Similar Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-44 relative">
                  <img
                    src={`https://source.unsplash.com/random/300x200/?wedding,venue,rural&sig=${i + 30}`}
                    alt="Similar Venue"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-1">
                    {
                      [
                        "Mountain View Resort",
                        "River Garden Palace",
                        "Sunset Hill Farm",
                        "Lake Paradise Inn",
                      ][i]
                    }
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {
                        [
                          "Shimla, Himachal Pradesh",
                          "Goa, India",
                          "Udaipur, Rajasthan",
                          "Ooty, Tamil Nadu",
                        ][i]
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-sm mb-2">
                    <Users className="h-3 w-3 mr-1 text-primary" />
                    <span>Up to {[300, 200, 500, 150][i]} guests</span>
                  </div>
                  <div className="font-semibold">
                    ₹{[65000, 55000, 85000, 45000][i].toLocaleString("en-IN")}
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Enquiry Form Dialog */}
      <Dialog open={showEnquiryForm} onOpenChange={setShowEnquiryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Venue Host</DialogTitle>
            <DialogDescription>
              Send a message to the venue host to ask specific questions or
              request more information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnquiry}>
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <Input required placeholder="Enter your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Phone
                </label>
                <Input required type="tel" placeholder="Enter your phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Email
                </label>
                <Input required type="email" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Message
                </label>
                <textarea
                  required
                  className="w-full min-h-[100px] p-3 border border-input rounded-md resize-none"
                  placeholder="What would you like to know about this venue?"
                ></textarea>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEnquiryForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Message</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Skeleton component for loading state
const VenueDetailsSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-10 w-2/3 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[195px] rounded-lg" />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Skeleton className="h-10 w-80 mb-4" />
            <Skeleton className="h-40 w-full mb-2" />
            <Skeleton className="h-40 w-full mb-2" />
            <Skeleton className="h-40 w-full mb-2" />
          </div>
        </div>
        <div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
