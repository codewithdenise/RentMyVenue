import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin: React.FC = () => {
  const { login, requestOtp, verifyOtp, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    try {
      // First request OTP
      const otpSent = await requestOtp(email, 'login');
      if (otpSent) {
        setShowOtpForm(true);
      }
    } catch (err) {
      // error handled in useAuth
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    try {
      // First verify OTP
      const isOtpValid = await verifyOtp(email, otp);
      if (isOtpValid) {
        // Then complete login
        await login(email, password, false);
        navigate(from, { replace: true });
      }
    } catch (err) {
      // error handled in useAuth
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-md shadow-sm bg-background text-foreground border-border">
      <h2 className="text-2xl font-bold mb-4">
        {showOtpForm ? "Verify OTP" : "Admin Sign In"}
      </h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      
      {showOtpForm ? (
        <form onSubmit={handleOtpSubmit}>
          <div className="mb-4">
            <label htmlFor="otp" className="block mb-1 font-medium">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the verification code sent to {email}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="flex-1"
              onClick={() => setShowOtpForm(false)}
            >
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full mt-4">
            {isLoading ? "Sending OTP..." : "Sign In"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AdminLogin;
