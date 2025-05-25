import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Auth is now handled via modals
import AuthModals, { AuthModalType } from "@/components/auth/AuthModals";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Main Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import VenueSearch from "@/pages/venues/VenueSearch";
import VenueDetails from "@/pages/venues/VenueDetails";
import VenueBooking from "@/pages/venues/VenueBooking";
import BookingConfirmation from "@/pages/venues/BookingConfirmation";

// Dashboard Pages
import UserDashboard from "@/pages/user/UserDashboard";
import UserBookings from "@/pages/user/UserBookings";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const App = () => {
  // Create a new QueryClient instance inside the component
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1, // Reduce retries to improve error reporting
        refetchOnWindowFocus: false, // Disable refetching on window focus
      },
    },
  });

  // State for authentication modal
  const [authModalOpen, setAuthModalOpen] = useState<AuthModalType>("none");

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4">
          Something went wrong. Please refresh the page.
        </div>
      }
    >
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeProvider>
              <AuthProvider>
                {/* Auth Modals - Global */}
                <AuthModals
                  open={authModalOpen}
                  onOpenChange={setAuthModalOpen}
                />

                <Routes>
                  {/* Main Routes with MainLayout */}
                  <Route
                    element={
                      <MainLayout
                        onOpenAuthModal={(type) => setAuthModalOpen(type)}
                      />
                    }
                  >
                    <Route path="/" element={<Index />} />
                    <Route path="/venues" element={<VenueSearch />} />
                    <Route
                      path="/venues/:id"
                      element={
                        <VenueDetails
                          openAuthModal={(type) => setAuthModalOpen(type)}
                        />
                      }
                    />
                    <Route path="/venues/:id/book" element={<VenueBooking />} />
                    <Route
                      path="/booking/confirmation/:id"
                      element={<BookingConfirmation />}
                    />
                    <Route
                      path="/how-it-works"
                      element={<div>How It Works (Coming Soon)</div>}
                    />
                    <Route
                      path="/become-a-host"
                      element={
                        <div className="p-4">
                          <h1 className="text-2xl font-bold mb-4">
                            Become a Host
                          </h1>
                          <p className="mb-2">
                            Share your venue with couples looking for the
                            perfect wedding location.
                          </p>
                          <button
                            className="px-4 py-2 bg-primary text-white rounded"
                            onClick={() => setAuthModalOpen("signup")}
                          >
                            Get Started
                          </button>
                        </div>
                      }
                    />
                    <Route
                      path="/featured-venues"
                      element={<div>Featured Venues (Coming Soon)</div>}
                    />
                    <Route
                      path="/faq"
                      element={
                        <div>Frequently Asked Questions (Coming Soon)</div>
                      }
                    />
                    <Route
                      path="/support"
                      element={<div>Support Center (Coming Soon)</div>}
                    />
                    <Route
                      path="/cancellation-policy"
                      element={<div>Cancellation Policy (Coming Soon)</div>}
                    />
                    <Route
                      path="/safety-resources"
                      element={<div>Safety Resources (Coming Soon)</div>}
                    />
                    <Route
                      path="/privacy-policy"
                      element={<div>Privacy Policy (Coming Soon)</div>}
                    />
                    <Route
                      path="/terms-of-service"
                      element={<div>Terms of Service (Coming Soon)</div>}
                    />
                    <Route
                      path="/cookies-policy"
                      element={<div>Cookies Policy (Coming Soon)</div>}
                    />
                  </Route>

                  {/* User Dashboard Routes */}
                  <Route path="/user" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="bookings" element={<UserBookings />} />
                    <Route
                      path="profile"
                      element={<div>User Profile (Coming Soon)</div>}
                    />
                    <Route
                      path="settings"
                      element={<div>User Settings (Coming Soon)</div>}
                    />
                  </Route>

                  {/* Vendor Dashboard Routes */}
                  <Route path="/vendor" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<VendorDashboard />} />
                    <Route
                      path="venues"
                      element={<div>Venue Management (Coming Soon)</div>}
                    />
                    <Route
                      path="bookings"
                      element={<div>Booking Requests (Coming Soon)</div>}
                    />
                    <Route
                      path="finances"
                      element={<div>Financial Reports (Coming Soon)</div>}
                    />
                    <Route
                      path="profile"
                      element={<div>Vendor Profile (Coming Soon)</div>}
                    />
                    <Route
                      path="settings"
                      element={<div>Vendor Settings (Coming Soon)</div>}
                    />
                  </Route>

                  {/* Admin Dashboard Routes */}
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route
                      path="users"
                      element={<div>User Management (Coming Soon)</div>}
                    />
                    <Route
                      path="venues"
                      element={<div>Venue Approvals (Coming Soon)</div>}
                    />
                    <Route
                      path="reports"
                      element={<div>System Reports (Coming Soon)</div>}
                    />
                    <Route
                      path="settings"
                      element={<div>Admin Settings (Coming Soon)</div>}
                    />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </ThemeProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
