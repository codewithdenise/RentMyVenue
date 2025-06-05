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
import HowItWorks from "@/pages/HowItWorks";
import VenueSearch from "@/pages/venues/VenueSearch";
import VenueDetails from "@/pages/venues/VenueDetails";
import VenueBooking from "@/pages/venues/VenueBooking";
import BookingConfirmation from "@/pages/venues/BookingConfirmation";

// Dashboard Pages
import UserDashboard from "@/pages/user/UserDashboard";
import UserBookings from "@/pages/user/UserBookings";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLogin from "@/pages/admin/AdminLogin";
import RequireAdminAuth from "@/components/auth/RequireAdminAuth";
import BecomeHost from "@/pages/BecomeHost";

type AuthModalState = {
  type: AuthModalType;
  signupRole?: "user" | "vendor";
};

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
  const [authModalOpen, setAuthModalOpen] = useState<AuthModalState>({
    type: "none",
  });

  // Function to open auth modal with optional signupRole
  const openAuthModal = (type: "signup" | "none" | "login" | "forgotPassword", signupRole?: "user" | "vendor") => {
    // Only set valid AuthModalTypes
    const validType: AuthModalType = type === "forgotPassword" ? "none" : type;
    setAuthModalOpen({ type: validType, signupRole });
  };

  // Function to handle modal close
  const handleAuthModalClose = () => {
    setAuthModalOpen({ type: "none" });
  };

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
                  open={authModalOpen.type}
                  onOpenChange={(type) => {
                    if (type === "none") {
                      handleAuthModalClose();
                    } else {
                      setAuthModalOpen((prev) => ({ ...prev, type }));
                    }
                  }}
                  signupRole={authModalOpen.signupRole}
                />

                <Routes>
                  {/* Main Routes with MainLayout */}
                  <Route
                    element={
                      <MainLayout onOpenAuthModal={openAuthModal} />
                    }
                  >
                    <Route path="/" element={<Index />} />
                    <Route path="/venues" element={<VenueSearch />} />
                    <Route
                      path="/venues/:id"
                      element={
                        <VenueDetails openAuthModal={openAuthModal} />
                      }
                    />
                    <Route path="/venues/:id/book" element={<VenueBooking />} />
                    <Route
                      path="/booking/confirmation/:id"
                      element={<BookingConfirmation />}
                    />
                    <Route
                      path="/how-it-works"
                      element={<HowItWorks />}
                    />
                    <Route
                      path="/become-a-host"
                      element={
                        <BecomeHost openAuthModal={openAuthModal} />
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
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdminAuth>
                        <DashboardLayout />
                      </RequireAdminAuth>
                    }
                  >
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
