import * as React from "react";
import { useState, useEffect } from "react";

import { format } from "date-fns";
import {
  Check,
  CreditCard,
  Copy,
  Download,
  MapPin,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import bookingService from "@/services/bookingService";
import { ApiResponse, Booking } from "@/types";

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("Booking ID is required");

        // In a real application, you would fetch the booking details from the API
        // For now, we'll simulate a response
        const response: ApiResponse<Booking> = await bookingService.getBookingById(id);
        setBooking(response.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load booking details";
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, toast]);

  // Handle copy booking ID
  const handleCopyBookingId = () => {
    if (!booking) return;

    navigator.clipboard
      .writeText(booking.id)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy booking ID to clipboard.",
          variant: "destructive",
        });
      });
  };

  // Handle payment
  const handleMakePayment = () => {
    // In a real application, this would redirect to a payment gateway
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });

    // Simulate payment success after a delay
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your booking is now confirmed!",
      });

      // Update booking status
      setBooking({
        ...booking,
        status: "confirmed",
        paymentStatus: "paid",
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading booking details...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-destructive mb-2">
                Error Loading Booking
              </h2>
              <p className="mb-4">{error || "Booking not found"}</p>
              <Button onClick={() => navigate("/venues")}>Browse Venues</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center bg-primary/5">
            <div className="flex justify-center mb-4">
              {booking.status === "confirmed" ? (
                <div className="bg-green-100 text-green-800 p-3 rounded-full">
                  <Check className="h-10 w-10" />
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-full">
                  <CreditCard className="h-10 w-10" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {booking.status === "confirmed"
                ? "Booking Confirmed!"
                : "Booking Created"}
            </CardTitle>
            {booking.status === "confirmed" ? (
              <p className="text-muted-foreground mt-2">
                Your booking is confirmed. We&apos;re looking forward to hosting your event!
              </p>
            ) : (
              <p className="text-muted-foreground mt-2">
                Complete payment to confirm your booking.
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Booking ID */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleCopyBookingId}
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Venue Details */}
            <div>
              <h3 className="font-medium mb-2">Venue Details</h3>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        booking.venue.image ||
                        "https://source.unsplash.com/random/100x100/?venue,wedding"
                      }
                      alt={booking.venue.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{booking.venue.name}</h4>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {booking.venue.address.city},{" "}
                        {booking.venue.address.state}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="font-medium mb-2">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Check-in:</span>
                  </div>
                  <p className="pl-6">
                    {format(new Date(booking.startDate), "EEEE, d MMMM yyyy")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Check-out:</span>
                  </div>
                  <p className="pl-6">
                    {format(new Date(booking.endDate), "EEEE, d MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Guests:</span>
                <span>{booking.guestCount} persons</span>
              </div>

              {booking.specialRequests && (
                <div className="mt-4">
                  <p className="font-medium mb-1">Special Requests:</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Details */}
            <div>
              <h3 className="font-medium mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      booking.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>
                    {booking.paymentMethod === "online"
                      ? "Online Payment"
                      : "Pay at Venue"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{booking.totalPrice.toLocaleString("en-IN")}</span>
                </div>
                {booking.paymentStatus === "paid" && (
                  <div className="flex justify-between text-sm">
                    <span>Transaction ID</span>
                    <span>{booking.transactionId || "TXN123456789"}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Booking Status */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Booking Status</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {booking.status === "confirmed"
                  ? "Your booking is confirmed. We&apos;re looking forward to hosting your event!"
                  : booking.status === "pending"
                    ? "Your booking is pending payment. Please complete the payment to confirm your booking."
                    : "Your booking has been cancelled."}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {booking.status === "pending" && (
              <Button className="w-full" size="lg" onClick={handleMakePayment}>
                Complete Payment
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => {
                toast({
                  title: "Download Initiated",
                  description: "Your booking details are being downloaded.",
                });
              }}
            >
              <Download className="h-4 w-4" />
              Download Booking Details
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
