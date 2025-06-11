import { useState, useCallback, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import authService from "@/services/authService";
import { User, UserRole } from "@/types";


interface UseAuthOptions {
  redirectIfAuthenticated?: string;
  redirectIfUnauthenticated?: string;
  requireRole?: UserRole | UserRole[];
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  requestOtp: (email: string, password: string, type?: 'login' | 'signup') => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  clearError: () => void;
  refreshAuthState: () => Promise<void>;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh auth state from storage and validate token
  const refreshAuthState = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("rentmyvenue_token");
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Try to refresh token first
      const refreshResponse = await authService.refreshToken();
      if (!refreshResponse.success) {
        throw new Error("Token refresh failed");
      }

      // Get current user with fresh token
      const userResponse = await authService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } else {
        throw new Error("Failed to get user data");
      }
    } catch (err) {
      console.error("Auth state refresh failed:", err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth state on mount and token changes
  useEffect(() => {
    refreshAuthState();

    // Listen for storage changes (e.g., token updates in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rentmyvenue_token") {
        refreshAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Role-based access control
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && options.requireRole) {
      const requiredRoles = Array.isArray(options.requireRole)
        ? options.requireRole
        : [options.requireRole];

      if (!requiredRoles.includes(user.role.toLowerCase() as UserRole)) {
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, options.requireRole, navigate]);

  const login = useCallback(
    async (email: string, password: string, remember = false): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.login({
          email,
          password,
          remember,
        });

        if (response.success) {
          await refreshAuthState();
        } else {
          setError(response.error || "Login failed");
        }
      } catch (err) {
        setError("An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.verifyOtp({ email, otp }, 'login');
        if (response.success) {
          await refreshAuthState();
          return true;
        } else {
          setError(response.error || "Invalid verification code");
          return false;
        }
      } catch (err) {
        setError("Failed to verify code");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.register({
          email,
          password,
          name,
          role,
        });

        if (response.success && response.data) {
          return true;
        } else if (response.error) {
          setError(response.error);
          return false;
        } else {
          setError("Registration failed");
          return false;
        }
      } catch (err) {
        setError("An error occurred during registration");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
    } catch (err) {
      setError("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const requestOtp = useCallback(async (email: string, password: string, type: 'login' | 'signup' = 'signup'): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.requestOtp(email, password, type);
      return response.success;
    } catch (err) {
      setError("Failed to send verification code");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.forgotPassword(email);
      return response.success;
    } catch (err) {
      setError("Failed to process password reset request");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.resetPassword({ token, password });
      return response.success;
    } catch (err) {
      setError("Failed to reset password");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    requestOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    clearError,
    refreshAuthState,
  };
}
