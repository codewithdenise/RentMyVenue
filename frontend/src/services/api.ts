/**
 * API Client for RentMyVenue
 *
 * Handles all API communication with Django backend including authentication,
 * token refresh, and error handling.
 */

import type { ApiResponse } from "../types";


// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_TIMEOUT = 10000; // 10 seconds

// Error types
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "TimeoutError";
  }
}

// Helper for simulating API delays in development (kept for backward compatibility)
export const simulateApiCall = async <T>(
  data: T,
  delay = 500,
  shouldFail = false,
  failureRate = 0,
): Promise<T> => {
  const shouldRandomlyFail = Math.random() < failureRate;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail || shouldRandomlyFail) {
    throw new ApiError("Simulated API failure", 500);
  }

  return data;
};

// Token refresh function
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("rentmyvenue_refresh_token");
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/accounts/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("rentmyvenue_token", data.access);
      return data.access;
    } else {
      // Refresh token is invalid, clear all tokens
      localStorage.removeItem("rentmyvenue_user");
      localStorage.removeItem("rentmyvenue_token");
      localStorage.removeItem("rentmyvenue_refresh_token");
      return null;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

// Base request function
const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_URL}${endpoint}`;

    // Add default headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add auth token if available
    const authToken = localStorage.getItem("rentmyvenue_token");
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount === 0) {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the request with new token
          return request<T>(endpoint, options, retryCount + 1);
        } else {
          // Refresh failed, redirect to login
          window.location.href = "/auth/signin";
          throw new ApiError("Authentication failed", 401);
        }
      }

      let data: unknown;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle Django error responses
        let errorMessage = "An error occurred";
        
        if (typeof data === "object" && data !== null) {
          const errorData = data as Record<string, any>;
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors;
          } else {
            // Handle field-specific errors
            const fieldErrors = Object.entries(errorData)
              .filter(([key, value]) => Array.isArray(value))
              .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
              .join("; ");
            
            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        } else if (typeof data === "string") {
          errorMessage = data;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      // Return successful response
      return {
        success: true,
        data: data as T,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError();
      }
      throw error;
    }
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof TimeoutError ||
      error instanceof NetworkError
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unknown error occurred",
    };
  }
};

// API client methods
const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Upload file method for handling multipart/form-data
  upload: <T>(endpoint: string, formData: FormData, options?: RequestInit) => {
    const uploadOptions = { ...options };
    // Remove Content-Type header to let browser set it with boundary
    if (uploadOptions.headers) {
      delete (uploadOptions.headers as any)["Content-Type"];
    }
    
    return request<T>(endpoint, {
      ...uploadOptions,
      method: "POST",
      body: formData,
    });
  },
};

export default api;
