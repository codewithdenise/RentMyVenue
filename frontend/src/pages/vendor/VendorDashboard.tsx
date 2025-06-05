import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const VendorDashboard: React.FC = () => {
  // Mock data for demonstration
  const venues = [
    {
      id: "1",
      name: "Grand Palace Banquet Hall",
      status: "published",
      bookings: 12,
      revenue: 540000,
      rating: 4.8,
      reviews: 24,
      location: "Mumbai, Maharashtra",
      lastBooking: "2024-05-20",
    },
    {
      id: "2",
      name: "Garden View Resort",
      status: "pending",
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      location: "Pune, Maharashtra",
      lastBooking: null,
    },
    {
      id: "3",
      name: "Sunset Gardens",
      status: "published",
      bookings: 8,
      revenue: 320000,
      rating: 4.6,
      reviews: 15,
      location: "Nashik, Maharashtra",
      lastBooking: "2024-05-18",
    },
  ];

  const recentBookings = [
    {
      id: "1",
      venueName: "Grand Palace Banquet Hall",
      customerName: "Rahul & Priya",
      date: "2024-06-15",
      guests: 150,
      amount: 45000,
      status: "confirmed",
    },
    {
      id: "2",
      venueName: "Sunset Gardens",
      customerName: "Amit & Sneha",
      date: "2024-06-20",
      guests: 120,
      amount: 38000,
      status: "pending",
    },
    {
      id: "3",
      venueName: "Grand Palace Banquet Hall",
      customerName: "Vikram & Kavya",
      date: "2024-07-05",
      guests: 200,
      amount: 55000,
      status: "confirmed",
    },
  ];

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: "₹8,60,000",
      change: "+12%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Venues",
      value: "3",
      change: "+1",
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      title: "Total Bookings",
      value: "20",
      change: "+5",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: "4.7",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Edit className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your venues and track your business performance
          </p>
        </div>
        <Link to="/vendor/venues/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Venue
          </Button>
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Venues */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Venues</CardTitle>
              <Link to="/vendor/venues">
                <Button variant="outline" size="sm">
                  Manage All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{venue.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {venue.location}
                      </div>
                    </div>
                    {getStatusBadge(venue.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Bookings</p>
                      <p className="font-semibold">{venue.bookings}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold">
                        ₹{venue.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold">
                          {venue.rating || "N/A"}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({venue.reviews})
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Booking</p>
                      <p className="font-semibold">
                        {venue.lastBooking
                          ? new Date(venue.lastBooking).toLocaleDateString()
                          : "None"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Bookings
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/vendor/venues/new">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Venue
                </Button>
              </Link>
              <Link to="/vendor/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
              </Link>
              <Link to="/vendor/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to="/vendor/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.venueName}
                      </p>
                    </div>
                    {getBookingStatusBadge(booking.status)}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {booking.guests} guests
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ₹{booking.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/vendor/bookings">
                <Button variant="outline" size="sm" className="w-full">
                  View All Bookings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
