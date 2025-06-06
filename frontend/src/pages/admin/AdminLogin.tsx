import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/services/authService";
import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sun,
  Moon,
  Mail,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const AdminLogin: React.FC = () => {
  const { login, requestOtp, verifyOtp, logout, error, isLoading, clearError } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    try {
      // Request OTP for login (no extra role argument)
      const otpSent = await requestOtp(email, password, "login");
      if (otpSent) {
        setShowOtpForm(true);
      }
    } catch (err) {}
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    try {
      // Call authService directly to get the response with tokens
      const response = await authService.verifyOtp({ email, otp }, 'login');
      if (response.success && response.data.user) {
        if (response.data.user.role === "admin") {
          // Store tokens and user data (already handled by authService.verifyOtp)
          navigate(from, { replace: true });
        } else {
          // If not admin, logout and show error
          setLocalError("Access denied. Admin privileges required.");
          await logout();
          setShowOtpForm(false);
          setOtp("");
        }
      }
    } catch (err) {
      // Handle any other errors
      setLocalError("Failed to verify OTP. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    setShowOtpForm(false);
    setOtp("");
    clearError();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <Link
            to="/"
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            RentMyVenue
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-muted"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)] p-6 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Admin Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Admin Portal
            </Badge>
          </div>

          <Card className="shadow-lg border border-border bg-card">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {showOtpForm ? (
                    <KeyRound className="h-8 w-8 text-primary" />
                  ) : (
                    <Lock className="h-8 w-8 text-primary" />
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {showOtpForm ? "Verify Your Identity" : "Admin Sign In"}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {showOtpForm
                    ? "Enter the verification code sent to your email"
                    : "Sign in to access the admin dashboard"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {(error || localError) && (
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}

              {showOtpForm && (
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Verification code sent to <strong>{email}</strong>
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={showOtpForm ? handleOtpSubmit : handleSubmit}
                className="space-y-6"
              >
                {!showOtpForm ? (
                  <>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@rentmyvenue.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-12 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-12 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                      >
                        Remember me for 30 days
                      </Label>
                    </div>
                  </>
                ) : (
                  <>
                    {/* OTP Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="otp"
                        className="text-sm font-medium text-foreground"
                      >
                        Verification Code
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          disabled={isLoading}
                          required
                          maxLength={6}
                          className="pl-10 h-12 text-center text-lg font-mono tracking-widest bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Code expires in 5 minutes
                      </p>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="space-y-3">
                  {showOtpForm ? (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToLogin}
                        disabled={isLoading}
                        className="flex-1 h-12 border-input hover:bg-muted"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Verification Code
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Secured with multi-factor authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
