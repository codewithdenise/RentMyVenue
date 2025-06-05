import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

// Types
export type UserRole = "user" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  signOut: () => void;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  requestOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearErrors: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock API responses for development - would be replaced with real API calls
const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "John User",
    role: "user",
    avatarUrl: "https://i.pravatar.cc/150?u=user",
  },
  {
    id: "2",
    email: "vendor@example.com",
    name: "Jane Vendor",
    role: "vendor",
    avatarUrl: "https://i.pravatar.cc/150?u=vendor",
  },
  {
    id: "3",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?u=admin",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("rentmyvenue_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Authentication failed. Please sign in again.",
        });
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, remember = false) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // This would be an API call in production
        const user = mockUsers.find((u) => u.email === email);

        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (remember) {
            localStorage.setItem("rentmyvenue_user", JSON.stringify(user));
          } else {
            sessionStorage.setItem("rentmyvenue_user", JSON.stringify(user));
          }

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (user.role === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Invalid email or password",
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Sign in failed. Please try again.",
        }));
      }
    },
    [navigate],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string, role: UserRole) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // This would be an API call in production
        const existingUser = mockUsers.find((u) => u.email === email);

        if (existingUser) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Email already in use",
          }));
          return;
        }

        // Create new user (mock)
        const newUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          email,
          name,
          role,
          avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
        };

        setState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        localStorage.setItem("rentmyvenue_user", JSON.stringify(newUser));

        // Navigate based on role
        if (role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Sign up failed. Please try again.",
        }));
      }
    },
    [navigate],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("rentmyvenue_user");
    sessionStorage.removeItem("rentmyvenue_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate("/");
  }, [navigate]);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // This would be an API call in production
      // For demo purposes, any 6-digit OTP will work
      const isValid = otp.length === 6 && /^\d+$/.test(otp);

      setState((prev) => ({ ...prev, isLoading: false }));
      return isValid;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "OTP verification failed. Please try again.",
      }));
      return false;
    }
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // This would be an API call in production
      // For demo, we'll just pretend to send an OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to send OTP. Please try again.",
      }));
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // This would be an API call in production
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to process request. Please try again.",
      }));
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // This would be an API call in production
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to reset password. Please try again.",
      }));
    }
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        verifyOtp,
        requestOtp,
        forgotPassword,
        resetPassword,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
