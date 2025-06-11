import { useState, useEffect } from "react";

import { format } from "date-fns";
import {
  MapPin,
  CalendarIcon,
  Clock,
  Users,
  Info,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import bookingService from "@/services/bookingService";
import venueService from "@/services/venueService";
import { Venue } from "@/types";


const VenueBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [guestCount, setGuestCount] = useState(50);
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");

  // Additional services
  const [additionalServices, setAdditionalServices] = useState<{
    catering: boolean;
    decoration: boolean;
    photography: boolean;
    soundSystem: boolean;
  }>({
    catering: false,
    decoration: false,
    photography: false,
    soundSystem: false,
  });

  // Price calculation
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch venue details
  useEffect(() => {
    const fetchVenueDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("Venue ID is required");

        // In a real application, you would fetch the venue details from the API
        // For now, we'll simulate a response
        const response = await venueService.getVenueById(id);
        if (response.success && response.data) {
          setVenue(response.data);
          // Initialize total price with venue base price
          if (response.data.pricePerDay) {
            setTotalPrice(response.data.pricePerDay);
          }
        } else {
          throw new Error(response.error || "Failed to fetch venue details");
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

  // Calculate total price whenever booking details change
  useEffect(() => {
    if (!venue) return;

    let total = venue.pricePerDay || 25000; // Base price per day

    // Calculate number of days
    if (startDate && endDate) {
      const days = Math.max(
        1,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
      total *= days;
    }

    // Add costs for additional services
    if (additionalServices.catering) total += 15000;
    if (additionalServices.decoration) total += 20000;
    if (additionalServices.photography) total += 25000;
    if (additionalServices.soundSystem) total += 10000;

    // Update total price
    setTotalPrice(total);
  }, [venue, startDate, endDate, additionalServices]);

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this venue.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Dates Required",
        description: "Please select both check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);

    try {
      // Create booking payload
      const bookingData = {
        venueId: id,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        guestCount,
        specialRequests,
        totalPrice,
        additionalServices,
        paymentMethod,
      };

      // Call booking service to create a booking
      const response = await bookingService.createBooking(bookingData as any);

      if (response.success) {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully!",
        });

        // Navigate to booking confirmation page
        navigate(`/booking/confirmation/${response.data.bookingId}`);
      } else {
        toast({
          title: "Booking Failed",
          description: response.error || "Could not create booking.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: "An unknown error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setBookingLoading(false);
    }
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
                Error Loading Venue
              </h2>
              <p className="mb-4">{error || "Venue not found"}</p>
              <Button onClick={() => navigate("/venues")}>
                Back to Venues
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book {venue.name}</h1>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {venue.address?.city || "City"}, {venue.address?.state || "State"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <h3 className="font-medium">Select Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="check-in">Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-out">Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) =>
                            date < new Date() ||
                            (startDate ? date <= startDate : false)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {Math.ceil(
                        (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      day(s)
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Guest Count */}
              <div className="space-y-2">
                <Label htmlFor="guest-count">Number of Guests</Label>
                <div className="flex items-center">
                  <Input
                    id="guest-count"
                    type="number"
                    min={1}
                    max={venue.capacity?.max || 500}
                    value={guestCount}
                    onChange={(e) =>
                      setGuestCount(parseInt(e.target.value) || 50)
                    }
                    className="w-32"
                  />
                  <span className="ml-3 text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Maximum capacity: {venue.capacity?.max || 500}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Additional Services */}
              <div className="space-y-3">
                <h3 className="font-medium">Additional Services</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="catering"
                      checked={additionalServices.catering}
                      onCheckedChange={(checked) =>
                        setAdditionalServices({
                          ...additionalServices,
                          catering: !!checked,
                        })
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="catering"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Catering Services
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Professional catering for your event (₹15,000)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="decoration"
                      checked={additionalServices.decoration}
                      onCheckedChange={(checked) =>
                        setAdditionalServices({
                          ...additionalServices,
                          decoration: !!checked,
                        })
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="decoration"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Decoration Package
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Elegant decorations for your event (₹20,000)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="photography"
                      checked={additionalServices.photography}
                      onCheckedChange={(checked) =>
                        setAdditionalServices({
                          ...additionalServices,
                          photography: !!checked,
                        })
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="photography"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Photography & Videography
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Professional photo and video coverage (₹25,000)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="sound-system"
                      checked={additionalServices.soundSystem}
                      onCheckedChange={(checked) =>
                        setAdditionalServices({
                          ...additionalServices,
                          soundSystem: !!checked,
                        })
                      }
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor="sound-system"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sound System
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Professional sound system and DJ (₹10,000)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="special-requests">Special Requests</Label>
                <Textarea
                  id="special-requests"
                  placeholder="Any special requirements or requests for your event..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                />
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-medium">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online-payment" />
                    <Label
                      htmlFor="online-payment"
                      className="flex items-center"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Online (Credit/Debit Card, UPI)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="venue" id="pay-at-venue" />
                    <Label htmlFor="pay-at-venue">Pay at Venue</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Venue Charges</span>
                  <span>
                    ₹{venue.pricePerDay?.toLocaleString("en-IN") || "25,000"}
                  </span>
                </div>

                {startDate && endDate && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {Math.ceil(
                        (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      day(s)
                    </span>
                    <span>×</span>
                  </div>
                )}

                {/* Additional Services Summary */}
                {(additionalServices.catering ||
                  additionalServices.decoration ||
                  additionalServices.photography ||
                  additionalServices.soundSystem) && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-1">
                      Additional Services:
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {additionalServices.catering && (
                        <li className="flex justify-between">
                          <span>Catering Services</span>
                          <span>₹15,000</span>
                        </li>
                      )}
                      {additionalServices.decoration && (
                        <li className="flex justify-between">
                          <span>Decoration Package</span>
                          <span>₹20,000</span>
                        </li>
                      )}
                      {additionalServices.photography && (
                        <li className="flex justify-between">
                          <span>Photography & Videography</span>
                          <span>₹25,000</span>
                        </li>
                      )}
                      {additionalServices.soundSystem && (
                        <li className="flex justify-between">
                          <span>Sound System</span>
                          <span>₹10,000</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="text-sm text-muted-foreground flex items-start pt-2">
                <Info className="h-4 w-4 mr-1 mt-0.5" />
                <span>
                  A 20% advance payment is required to confirm your booking.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleBookingSubmit}
                disabled={bookingLoading || !startDate || !endDate}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/venues/${id}`)}
              >
                Back to Venue Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VenueBooking;
