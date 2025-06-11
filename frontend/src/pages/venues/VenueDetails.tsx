import * as React from "react";
import { useState, useEffect } from "react";

import { isBefore, isSameDay, parseISO } from "date-fns";
import {
  MapPin,
  Heart,
  Share2,
  Star,
  Users,
  Clock,
  Car,
  Music,
  Utensils,
  Wifi,
  Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import venueService from "@/services/venueService";
import type { Venue } from "@/types";


interface VenueDetailsProps {
  openAuthModal: (type: "signup" | "none" | "login" | "forgotPassword", signupRole?: "user" | "vendor") => void;
}

const VenueDetails: React.FC<VenueDetailsProps> = ({ openAuthModal }): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<
    Array<{ start: string; end: string }>
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Icon map for amenities
  const amenityIcons: Record<string, React.ReactNode> = {
    Wifi: <Wifi className="h-4 w-4" />,
    Parking: <Car className="h-4 w-4" />,
    "Sound System": <Music className="h-4 w-4" />,
    Catering: <Utensils className="h-4 w-4" />,
  };

  // Fetch venue details and booked dates
  useEffect(() => {
    const fetchVenueDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("Venue ID is required");

        const response = await venueService.getVenueById(id);
        // Use getVenueAvailability as fallback for booked dates
        let bookedResponse = null;
        try {
          bookedResponse = await venueService.getVenueAvailability(id, "", "");
        } catch (e) {
          bookedResponse = null;
        }

        if (response && response.success && response.data) {
          setVenue(response.data);

          // Set the first image as selected
          if (response.data.images && response.data.images.length > 0) {
            setSelectedImage(response.data.images[0].url);
          }
        } else {
          throw new Error(response?.error || "Failed to load venue details");
        }

        if (bookedResponse && bookedResponse.success && bookedResponse.data) {
          // Adapt data shape if needed
          if ("booked_ranges" in bookedResponse.data) {
            setBookedRanges(bookedResponse.data.booked_ranges);
          } else if ("conflictingDates" in bookedResponse.data) {
            const ranges = bookedResponse.data.conflictingDates.map((dateStr: string) => ({
              start: dateStr,
              end: dateStr,
            }));
            setBookedRanges(ranges);
          }
        }

      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
        toast({
          title: "Error",
          description: "Failed to load venue details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [id, toast]);

  // Check if a date is disabled (past or booked)
  const isDateDisabled = (date: Date) => {
    if (isBefore(date, new Date())) return true;

    for (const range of bookedRanges) {
      const start = parseISO(range.start);
      const end = parseISO(range.end);
      if (
        (isSameDay(date, start) || isSameDay(date, end)) ||
        (date > start && date < end)
      ) {
        return true;
      }
    }
    return false;
  };

  // Handle booking button click
  const handleBookNow = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!selectedDate) {
      toast({
        title: "Select a date",
        description: "Please select a date before booking.",
        variant: "default",
      });
      return;
    }
    navigate(`/venues/${id}/book?date=${selectedDate.toISOString()}`);
  };

  // Toggle favorite with backend integration placeholder
  const toggleFavorite = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setIsFavorited(!isFavorited);

    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorited
        ? "This venue has been removed from your favorites."
        : "This venue has been added to your favorites.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading venue details...</span>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-destructive mb-2">
                Venue Not Available
              </h2>
              <p className="mb-4">
                {error === "This venue is currently not available."
                  ? `This venue is currently not available for booking. It may be under review or temporarily unlisted.`
                  : error === "Venue not found."
                  ? "The venue you&apos;re looking for could not be found. It may have been removed or the link might be incorrect."
                  : error || "An error occurred while loading the venue."}
              </p>
              <Button onClick={() => navigate("/venues")}>Back to Venues</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Venue Name and Location */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {venue.address.city}, {venue.address.state}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
            />
            {isFavorited ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link Copied",
                description: "Venue link copied to clipboard.",
              });
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Venue Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2">
          <img
            src={
              selectedImage ||
              venue.images[0]?.url ||
              "https://source.unsplash.com/random/800x600/?venue,wedding"
            }
            alt={venue.name}
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {venue.images.slice(0, 3).map((image, index: number) => (
            <button
              key={index}
              type="button"
              className={`w-full h-[120px] rounded-lg cursor-pointer transition-opacity ${
                selectedImage === image.url
                  ? "ring-2 ring-primary"
                  : "hover:opacity-90"
              }`}
              onClick={() => setSelectedImage(image.url)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedImage(image.url);
                }
              }}
            >
              <img
                src={image.url}
                alt={image.alt || `${venue.name} image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
          ))}
          {venue.images.length > 3 && (
            <button
              type="button"
              className="w-full h-[120px] bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() =>
                toast({
                  title: "Gallery View",
                  description: "Full gallery view is coming soon!",
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  toast({
                    title: "Gallery View",
                    description: "Full gallery view is coming soon!",
                  });
                }
              }}
            >
              <span className="text-sm font-medium">
                +{venue.images.length - 3} more
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Venue Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Venue Description and Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">About This Venue</h2>
                  <p className="text-muted-foreground">
                    Hosted by {venue.vendor.name}
                  </p>
                </div>
                {venue.rating && (
                  <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-primary fill-primary mr-1" />
                    <span className="font-medium">
                      {venue.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-muted/50 px-3 py-1.5 rounded-md flex items-center">
                  <Users className="h-4 w-4 text-primary mr-2" />
                  <span>Up to {venue.capacity.max} guests</span>
                </div>
                <div className="bg-muted/50 px-3 py-1.5 rounded-md flex items-center">
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  <span>Vendor responds {venue.vendor.responseTime}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="prose prose-sm max-w-none">
                <p>{venue.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Details, Amenities, etc. */}
          <Tabs defaultValue="amenities">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    What this venue offers
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {venue.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        {amenityIcons[amenity] || (
                          <div className="w-4 h-4 rounded-full bg-primary/20" />
                        )}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                    <p className="text-muted-foreground">Map loading...</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Address:</p>
                    <p className="text-muted-foreground">
                      {venue.address.street}, {venue.address.city},{" "}
                      {venue.address.state}, {venue.address.zipCode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Exact location provided after booking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Booking Card */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-2xl font-bold">
                    ₹{venue.pricePerDay.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground">/day</span>
                </div>
                {venue.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">
                      {venue.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border rounded-md p-4 mb-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="rounded-md border"
                />
              </div>

              <Button className="w-full mb-3" size="lg" onClick={handleBookNow}>
                Book Now
              </Button>

              <p className="text-center text-sm text-muted-foreground mb-4">
                You won&apos;t be charged yet
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    ₹{venue.pricePerDay.toLocaleString("en-IN")} × 1 day
                  </span>
                  <span>₹{venue.pricePerDay.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>
                    ₹
                    {Math.round(venue.pricePerDay * 0.05).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    ₹{(venue.pricePerDay * 1.05).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
