/**
 * API Client for RentMyVenue
 *
 * This is a base API client setup that would be used to connect to a backend.
 * For this implementation, we'll use mock data and simulate API calls.
 */

import type { ApiResponse } from "../types";
import axios from 'axios';

// Base API configuration
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_TIMEOUT = 5000; // 5 seconds

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Helper for simulating API delays in development
export const simulateApiCall = async <T>(
  data: T,
  delay = 500,
  shouldFail = false,
  failureRate = 0,
): Promise<T> => {
  // Determine if this call should randomly fail
  const shouldRandomlyFail = Math.random() < failureRate;

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail || shouldRandomlyFail) {
    throw new ApiError("Simulated API failure", 500);
  }

  return data;
};

// Base request function that would handle actual API calls
const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_URL}${endpoint}`;

    // Add default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
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

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || "An error occurred", response.status);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
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
      throw error;
    }

    throw new NetworkError(error.message || "Network error occurred");
  }
};

// API client methods
const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
