import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  CreditCard,
  Bell,
  Settings,
  User,
  Heart,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard: React.FC = () => {
  // Mock data for demonstration
  const upcomingBookings = [
    {
      id: "1",
      venueName: "Grand Palace Banquet Hall",
      date: "2024-06-15",
      time: "18:00",
      guests: 150,
      status: "confirmed",
      amount: 45000,
      location: "Mumbai, Maharashtra",
    },
    {
      id: "2",
      venueName: "Garden View Resort",
      date: "2024-07-20",
      time: "16:00",
      guests: 200,
      status: "pending",
      amount: 65000,
      location: "Pune, Maharashtra",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "booking",
      message: "Booking confirmed for Grand Palace Banquet Hall",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "payment",
      message: "Payment of ₹15,000 processed successfully",
      time: "1 day ago",
    },
    {
      id: "3",
      type: "review",
      message: "Review submitted for Sunset Gardens",
      time: "3 days ago",
    },
  ];

  const quickStats = [
    {
      title: "Total Bookings",
      value: "12",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Upcoming Events",
      value: "2",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Favorite Venues",
      value: "8",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "Reviews Given",
      value: "5",
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  const getStatusBadge = (status: string) => {
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
          <h1 className="text-3xl font-bold">Welcome back, John!</h1>
          <p className="text-muted-foreground">
            Manage your bookings and discover new venues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Link to="/user/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Link to="/user/bookings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.venueName}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.location}
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {booking.time}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {booking.guests} guests
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      ₹{booking.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {booking.status === "confirmed" && (
                      <Button size="sm" variant="outline">
                        Contact Venue
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {upcomingBookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <Link to="/venues">
                    <Button className="mt-4">Browse Venues</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/venues">
                <Button className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Browse Venues
                </Button>
              </Link>
              <Link to="/user/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
              </Link>
              <Link to="/user/profile">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Saved Venues
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
