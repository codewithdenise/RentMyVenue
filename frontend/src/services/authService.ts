/**
 * Authentication Service
 *
 * Handles all authentication-related API calls connected to Django backend.
 */

import { User, UserRole, ApiResponse } from "@/types";
import api from "./api";

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

// Backend response interfaces
interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined?: string;
  email_verified?: boolean;
  is_active?: boolean;
}

interface RegisterResponse {
  user: BackendUser;
  detail: string;
}

interface LoginResponse {
  detail: string;
}

interface OtpVerifyResponse {
  detail?: string;
  access?: string;
  refresh?: string;
  user?: BackendUser;
}

// Auth service methods
const authService = {
  // Register new user
  register: async (
    data: RegisterData,
  ): Promise<ApiResponse<{ user: User; message: string }>> => {
    try {
      const response = await api.post<RegisterResponse>(
        "/api/accounts/register/",
        {
          email: data.email,
          password: data.password,
          first_name: data.name.split(' ')[0] || data.name,
          last_name: data.name.split(' ').slice(1).join(' ') || '',
          role: data.role.charAt(0).toUpperCase() + data.role.slice(1), // Capitalize first letter
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
              name: `${response.data.user.first_name} ${response.data.user.last_name}`.trim(),
              role: response.data.user.role.toLowerCase() as UserRole,
              createdAt: response.data.user.date_joined || new Date().toISOString(),
            },
            message: response.data.detail,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Registration failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  },

  // Login user (step 1: verify password and send OTP)
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post<{ detail: string }>(
        "/api/accounts/login/",
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            message: response.data.detail,
          },
        };
      }

      return {
        success: false,
        error: response.error || "Login failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },

  // Verify OTP code (step 2: complete login or signup)
  verifyOtp: async (
    data: OtpVerificationData,
    type: 'login' | 'signup' = 'login'
  ): Promise<ApiResponse<{ user?: User; token?: string; message: string }>> => {
    try {
      const response = await api.post<OtpVerifyResponse>(
        `/api/accounts/otp-verify/?type=${type}`,
        {
          email: data.email,
          otp: data.otp,
        }
      );

      if (response.success && response.data) {
        if (type === 'login' && response.data.access && response.data.user) {
          // Store tokens
          localStorage.setItem("rentmyvenue_token", response.data.access);
          localStorage.setItem("rentmyvenue_refresh_token", response.data.refresh || '');
          
          // Store user data
          const userData = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: `${response.data.user.first_name} ${response.data.user.last_name}`.trim(),
            role: response.data.user.role.toLowerCase() as UserRole,
            createdAt: response.data.user.date_joined || new Date().toISOString(),
          };
          localStorage.setItem("rentmyvenue_user", JSON.stringify(userData));

          return {
            success: true,
            data: {
              user: userData,
              token: response.data.access,
              message: "Login successful",
            },
          };
        } else {
          // Signup OTP verification
          return {
            success: true,
            data: {
              message: response.data.detail || "Email verified successfully",
            },
          };
        }
      }

      return {
        success: false,
        error: response.error || "OTP verification failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "OTP verification failed",
      };
    }
  },

  // Request OTP for email verification
  requestOtp: async (
    email: string,
    type: 'login' | 'signup' = 'signup'
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      // Use the appropriate endpoint based on type
      const endpoint = type === 'login' ? '/api/accounts/login/' : '/api/accounts/register/';
      const data = type === 'login' ? { email, password: 'dummy' } : { email };
      
      const response = await api.post<{ detail: string }>(endpoint, data);

      if (response.success && response.data) {
        return {
          success: true,
          data: { success: true },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to send verification code",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to send verification code",
      };
    }
  },

  // Forgot password request
  forgotPassword: async (
    email: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      // Note: This endpoint might need to be implemented in Django backend
      const response = await api.post<{ detail: string }>(
        "/api/accounts/forgot-password/",
        { email }
      );

      if (response.success) {
        return {
          success: true,
          data: { success: true },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to process request",
      };
    } catch (error: any) {
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
      // Note: This endpoint might need to be implemented in Django backend
      const response = await api.post<{ detail: string }>(
        "/api/accounts/reset-password/",
        {
          token: data.token,
          password: data.password,
        }
      );

      if (response.success) {
        return {
          success: true,
          data: { success: true },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to reset password",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const token = localStorage.getItem("rentmyvenue_token");
      
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      const response = await api.get<BackendUser>("/api/accounts/profile/");

      if (response.success && response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          name: `${response.data.first_name} ${response.data.last_name}`.trim(),
          role: response.data.role.toLowerCase() as UserRole,
          createdAt: response.data.date_joined || new Date().toISOString(),
        };

        // Update stored user data
        localStorage.setItem("rentmyvenue_user", JSON.stringify(userData));

        return {
          success: true,
          data: userData,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to get user profile",
      };
    } catch (error: any) {
      // If token is invalid, clear storage
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");
      
      return {
        success: false,
        error: error.message || "Failed to get user profile",
      };
    }
  },

  // Refresh access token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const refreshToken = localStorage.getItem("rentmyvenue_refresh_token");
      
      if (!refreshToken) {
        return { success: false, error: "No refresh token available" };
      }

      const response = await api.post<{ access: string }>(
        "/api/accounts/token/refresh/",
        { refresh: refreshToken }
      );

      if (response.success && response.data) {
        localStorage.setItem("rentmyvenue_token", response.data.access);
        
        return {
          success: true,
          data: { token: response.data.access },
        };
      }

      return {
        success: false,
        error: response.error || "Failed to refresh token",
      };
    } catch (error: any) {
      // Clear all tokens if refresh fails
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");
      
      return {
        success: false,
        error: error.message || "Failed to refresh token",
      };
    }
  },

  // Logout user
  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const refreshToken = localStorage.getItem("rentmyvenue_refresh_token");
      
      if (refreshToken) {
        // Blacklist the refresh token
        await api.post("/api/accounts/token/blacklist/", {
          refresh: refreshToken,
        });
      }

      // Clear local storage
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");

      return {
        success: true,
        data: { success: true },
      };
    } catch (error: any) {
      // Even if API call fails, clear local storage
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");
      
      return {
        success: true,
        data: { success: true },
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("rentmyvenue_token");
    const user = localStorage.getItem("rentmyvenue_user");
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    try {
      const userData = localStorage.getItem("rentmyvenue_user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
