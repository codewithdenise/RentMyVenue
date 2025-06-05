import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/types";
import authService from "@/services/authService";

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
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => Promise<void>;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getCurrentUser();

        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);

          // Handle redirect for authenticated users
          if (options.redirectIfAuthenticated) {
            navigate(options.redirectIfAuthenticated);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);

          // Handle redirect for unauthenticated users
          if (options.redirectIfUnauthenticated) {
            navigate(options.redirectIfUnauthenticated);
          }
        }
      } catch (err) {
        setError("Failed to authenticate");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [
    navigate,
    options.redirectIfAuthenticated,
    options.redirectIfUnauthenticated,
  ]);

  // Role-based access control
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && options.requireRole) {
      const requiredRoles = Array.isArray(options.requireRole)
        ? options.requireRole
        : [options.requireRole];

      if (!requiredRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
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
    async (
      email: string,
      password: string,
      remember = false,
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.login({
          email,
          password,
          remember,
        });

        if (response.success && response.data) {
          setUser(response.data.user);
          setIsAuthenticated(true);

          // Store token based on remember preference
          if (remember) {
            localStorage.setItem("rentmyvenue_token", response.data.token);
            localStorage.setItem(
              "rentmyvenue_user",
              JSON.stringify(response.data.user),
            );
          } else {
            sessionStorage.setItem("rentmyvenue_token", response.data.token);
            sessionStorage.setItem(
              "rentmyvenue_user",
              JSON.stringify(response.data.user),
            );
          }

          // Navigate based on role
          if (response.data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (response.data.user.role === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        } else {
          setError(response.error || "Login failed");
        }
      } catch (err) {
        setError("An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: UserRole,
    ): Promise<void> => {
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
          setUser(response.data.user);
          setIsAuthenticated(true);

          // Store auth token
          localStorage.setItem("rentmyvenue_token", response.data.token);
          localStorage.setItem(
            "rentmyvenue_user",
            JSON.stringify(response.data.user),
          );

          // Navigate based on role
          if (role === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        } else {
          setError(response.error || "Registration failed");
        }
      } catch (err) {
        setError("An error occurred during registration");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      await authService.logout();

      // Clear auth data
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_user");
      sessionStorage.removeItem("rentmyvenue_token");
      sessionStorage.removeItem("rentmyvenue_user");

      setUser(null);
      setIsAuthenticated(false);

      // Redirect to home
      navigate("/");
    } catch (err) {
      setError("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const requestOtp = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would call the API to send OTP
      const response = await authService.requestOtp(email);

      // For the sake of the demo, we'll always return success
      // In a real app, you'd check the response
      return true;
    } catch (err) {
      setError("Failed to send verification code");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (email: string, otp: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would call the API to verify OTP
        const response = await authService.verifyOtp({
          email,
          otp,
        });

        // For the sake of the demo, we'll accept any 6-digit OTP
        // In a real app, you'd check the API response
        return otp.length === 6 && /^\d+$/.test(otp);
      } catch (err) {
        setError("Failed to verify code");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<boolean> => {
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
    },
    [],
  );

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.resetPassword({
          token,
          password,
        });

        return response.success;
      } catch (err) {
        setError("Failed to reset password");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

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
  };
}
