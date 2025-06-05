import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserBookings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Mock data for demonstration
  const bookings = [
    {
      id: "BK001",
      venueName: "Grand Palace Banquet Hall",
      venueId: "1",
      date: "2024-06-15",
      time: "18:00",
      endTime: "23:00",
      guests: 150,
      status: "confirmed",
      amount: 45000,
      paidAmount: 15000,
      location: "Mumbai, Maharashtra",
      bookingDate: "2024-05-10",
      eventType: "Wedding",
      vendorContact: {
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        email: "rajesh@grandpalace.com",
      },
      amenities: ["AC", "Parking", "Catering", "Decoration"],
    },
    {
      id: "BK002",
      venueName: "Garden View Resort",
      venueId: "2",
      date: "2024-07-20",
      time: "16:00",
      endTime: "22:00",
      guests: 200,
      status: "pending",
      amount: 65000,
      paidAmount: 0,
      location: "Pune, Maharashtra",
      bookingDate: "2024-05-15",
      eventType: "Reception",
      vendorContact: {
        name: "Priya Sharma",
        phone: "+91 87654 32109",
        email: "priya@gardenview.com",
      },
      amenities: ["Swimming Pool", "Garden", "AC", "Parking"],
    },
    {
      id: "BK003",
      venueName: "Sunset Gardens",
      venueId: "3",
      date: "2024-05-25",
      time: "17:00",
      endTime: "21:00",
      guests: 80,
      status: "completed",
      amount: 28000,
      paidAmount: 28000,
      location: "Nashik, Maharashtra",
      bookingDate: "2024-04-20",
      eventType: "Birthday Party",
      vendorContact: {
        name: "Amit Patel",
        phone: "+91 76543 21098",
        email: "amit@sunsetgardens.com",
      },
      amenities: ["Garden", "Sound System", "Lighting"],
    },
    {
      id: "BK004",
      venueName: "Royal Banquet",
      venueId: "4",
      date: "2024-04-10",
      time: "19:00",
      endTime: "23:30",
      guests: 120,
      status: "cancelled",
      amount: 38000,
      paidAmount: 5000,
      location: "Delhi",
      bookingDate: "2024-03-15",
      eventType: "Anniversary",
      vendorContact: {
        name: "Suresh Gupta",
        phone: "+91 65432 10987",
        email: "suresh@royalbanquet.com",
      },
      amenities: ["AC", "Valet Parking", "Premium Catering"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatus = (status: string, paidAmount: number, totalAmount: number) => {
    if (status === "cancelled") {
      return <Badge variant="outline" className="text-red-600">Refund Pending</Badge>;
    }
    if (paidAmount === 0) {
      return <Badge variant="outline" className="text-orange-600">Payment Pending</Badge>;
    }
    if (paidAmount < totalAmount) {
      return <Badge variant="outline" className="text-yellow-600">Partial Payment</Badge>;
    }
    return <Badge variant="outline" className="text-green-600">Paid</Badge>;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case "date_desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date_asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount_desc":
        return b.amount - a.amount;
      case "amount_asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">
            Track and manage all your venue bookings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/venues">
            <Button>Book New Venue</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (Newest First)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest First)</SelectItem>
                <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
                <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-6">
        {sortedBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{booking.venueName}</h3>
                    {getStatusBadge(booking.status)}
                    {getPaymentStatus(booking.status, booking.paidAmount, booking.amount)}
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-semibold">{booking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.time} - {booking.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{booking.guests} guests</p>
                    <p className="text-xs text-muted-foreground">{booking.eventType}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">₹{booking.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid: ₹{booking.paidAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {booking.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Vendor Contact */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-2">Vendor Contact:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {booking.vendorContact.name}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {booking.vendorContact.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {booking.vendorContact.email}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link to={`/venues/${booking.venueId}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Venue
                  </Button>
                </Link>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download Invoice
                </Button>
                {booking.status === "confirmed" && (
                  <>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact Vendor
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call Vendor
                    </Button>
                  </>
                )}
                {booking.status === "completed" && (
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-1" />
                    Write Review
                  </Button>
                )}
                {booking.status === "pending" && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Complete Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't made any bookings yet"}
              </p>
              <Link to="/venues">
                <Button>Browse Venues</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
