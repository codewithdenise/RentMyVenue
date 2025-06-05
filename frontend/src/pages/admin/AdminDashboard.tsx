import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  Building,
  Star,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const pendingApprovals = [
    {
      id: "1",
      type: "venue",
      name: "Royal Gardens Banquet",
      vendor: "Rajesh Kumar",
      submittedDate: "2024-05-20",
      location: "Delhi",
    },
    {
      id: "2",
      type: "vendor",
      name: "Premium Events Co.",
      contact: "Amit Sharma",
      submittedDate: "2024-05-19",
      location: "Mumbai",
    },
    {
      id: "3",
      type: "venue",
      name: "Lakeside Resort",
      vendor: "Priya Patel",
      submittedDate: "2024-05-18",
      location: "Udaipur",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "venue_approved",
      message: "Venue 'Grand Palace' approved and published",
      time: "2 hours ago",
      user: "Admin",
    },
    {
      id: "2",
      type: "vendor_registered",
      message: "New vendor 'Elite Events' registered",
      time: "4 hours ago",
      user: "System",
    },
    {
      id: "3",
      type: "booking_completed",
      message: "Booking #1234 completed successfully",
      time: "6 hours ago",
      user: "Customer",
    },
    {
      id: "4",
      type: "venue_rejected",
      message: "Venue 'City Hall' rejected - incomplete documentation",
      time: "1 day ago",
      user: "Admin",
    },
  ];

  const systemStats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      description: "Active platform users",
    },
    {
      title: "Active Venues",
      value: "156",
      change: "+8%",
      icon: MapPin,
      color: "text-green-600",
      description: "Published venues",
    },
    {
      title: "Total Bookings",
      value: "1,234",
      change: "+15%",
      icon: Calendar,
      color: "text-purple-600",
      description: "All-time bookings",
    },
    {
      title: "Platform Revenue",
      value: "₹12.5L",
      change: "+18%",
      icon: DollarSign,
      color: "text-yellow-600",
      description: "Commission earned",
    },
  ];

  const quickStats = [
    {
      title: "Pending Approvals",
      value: "8",
      icon: Clock,
      color: "text-orange-600",
      urgent: true,
    },
    {
      title: "Active Vendors",
      value: "89",
      icon: Building,
      color: "text-blue-600",
      urgent: false,
    },
    {
      title: "Customer Support",
      value: "3",
      icon: AlertTriangle,
      color: "text-red-600",
      urgent: true,
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: Activity,
      color: "text-green-600",
      urgent: false,
    },
  ];

  const getApprovalBadge = (type: string) => {
    switch (type) {
      case "venue":
        return <Badge className="bg-blue-100 text-blue-800">Venue</Badge>;
      case "vendor":
        return <Badge className="bg-purple-100 text-purple-800">Vendor</Badge>;
      case "user":
        return <Badge className="bg-green-100 text-green-800">User</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "venue_approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "venue_rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "vendor_registered":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "booking_completed":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage the RentMyVenue platform
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/reports">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className={stat.urgent ? "border-orange-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              {stat.urgent && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Needs Attention
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Pending Approvals
              </CardTitle>
              <Link to="/admin/approvals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type === "venue" ? `Vendor: ${item.vendor}` : `Contact: ${item.contact}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Location: {item.location}
                      </p>
                    </div>
                    {getApprovalBadge(item.type)}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(item.submittedDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <p className="text-muted-foreground">All caught up! No pending approvals.</p>
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
              <Link to="/admin/users">
                <Button className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/venues">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Venues
                </Button>
              </Link>
              <Link to="/admin/vendors">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="h-4 w-4 mr-2" />
                  Manage Vendors
                </Button>
              </Link>
              <Link to="/admin/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Bookings
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
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
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/admin/activity">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
