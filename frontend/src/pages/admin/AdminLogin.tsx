import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin: React.FC = () => {
  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password, false);
      navigate(from, { replace: true });
    } catch (err) {
      // error handled in useAuth
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Sign In</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
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
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
