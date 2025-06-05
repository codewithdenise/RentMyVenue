/**
 * Authentication Service
 *
 * Handles all authentication-related API calls.
 * For this implementation, we'll use simulated responses.
 */

import { User, UserRole, ApiResponse } from "@/types";
import api, { simulateApiCall } from "./api";

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    email: "user@example.com",
    name: "John User",
    role: "user",
    avatarUrl: "https://i.pravatar.cc/150?u=user1",
    createdAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "vendor-1",
    email: "vendor@example.com",
    name: "Jane Vendor",
    role: "vendor",
    avatarUrl: "https://i.pravatar.cc/150?u=vendor1",
    phone: "+1234567890",
    createdAt: "2022-11-22T15:45:00Z",
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?u=admin1",
    createdAt: "2022-10-10T09:15:00Z",
  },
];

// Interface definitions
interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface OtpVerificationData {
  email: string;
  otp: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

// Auth service methods
const authService = {
  // Login user
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      // In a real implementation, this would call the API
      // api.post<{user: User; token: string}>("/auth/login", credentials);

      // Simulated API response
      const user = MOCK_USERS.find((u) => u.email === credentials.email);

      if (!user) {
        return await simulateApiCall<
          ApiResponse<{ user: User; token: string }>
        >({ success: false, error: "Invalid email or password" }, 800);
      }

      const result: ApiResponse<{ user: User; token: string }> = {
        success: true,
        data: {
          user,
          token:
            "mock_jwt_token_" + Math.random().toString(36).substring(2, 15),
        },
      };

      return await simulateApiCall(result, 800);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },

  // Register new user
  register: async (
    data: RegisterData,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      // Check if email already exists
      const existingUser = MOCK_USERS.find((u) => u.email === data.email);

      if (existingUser) {
        return await simulateApiCall<
          ApiResponse<{ user: User; token: string }>
        >({ success: false, error: "Email already in use" }, 800);
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const result: ApiResponse<{ user: User; token: string }> = {
        success: true,
        data: {
          user: newUser,
          token:
            "mock_jwt_token_" + Math.random().toString(36).substring(2, 15),
        },
      };

      return await simulateApiCall(result, 1000);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  },

  // Request OTP for email verification
  requestOtp: async (
    email: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      return await simulateApiCall(
        { success: true, data: { success: true } },
        1000,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to send OTP",
      };
    }
  },

  // Verify OTP code
  verifyOtp: async (
    data: OtpVerificationData,
  ): Promise<ApiResponse<{ verified: boolean }>> => {
    try {
      // For demo, we'll consider any 6-digit OTP as valid
      const isValid = data.otp.length === 6 && /^\d+$/.test(data.otp);

      return await simulateApiCall(
        {
          success: true,
          data: { verified: isValid },
        },
        800,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "OTP verification failed",
      };
    }
  },

  // Forgot password request
  forgotPassword: async (
    email: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const user = MOCK_USERS.find((u) => u.email === email);

      if (!user) {
        return await simulateApiCall(
          { success: false, error: "No account found with that email" },
          800,
        );
      }

      return await simulateApiCall(
        { success: true, data: { success: true } },
        1000,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to process request",
      };
    }
  },

  // Reset password with token
  resetPassword: async (
    data: ResetPasswordData,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      // For demo purposes, any token is considered valid
      return await simulateApiCall(
        { success: true, data: { success: true } },
        1200,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      // This would typically check localStorage for a token and verify with the API
      const storedUser = localStorage.getItem("rentmyvenue_user");

      if (!storedUser) {
        return { success: false, error: "Not authenticated" };
      }

      const user = JSON.parse(storedUser);
      return await simulateApiCall({ success: true, data: user }, 300);
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get user profile",
      };
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      // Clear local storage
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");

      return await simulateApiCall(
        { success: true, data: { success: true } },
        300,
      );
    } catch (error) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  },
};

export default authService;
