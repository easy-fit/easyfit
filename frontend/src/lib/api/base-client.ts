import { ENV } from '@/config/env';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

interface ApiError extends Error {
  status?: number;
  response?: unknown;
}

export class BaseApiClient {
  constructor(private baseURL: string = ENV.API_URL || 'http://localhost:3000/api/v1') {}

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private async handleAuthError(originalRequest: () => Promise<Response>): Promise<Response> {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = this.performTokenRefresh();
    }

    try {
      const refreshSuccess = await refreshPromise;

      if (refreshSuccess) {
        return await originalRequest();
      } else {
        throw new Error('Authentication failed');
      }
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  protected async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
      return fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    };

    try {
      let response = await makeRequest();

      if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/')) {
        response = await this.handleAuthError(makeRequest);
      }

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => null);
        const errorMessage = errorResponse?.message || errorResponse?.error || response.statusText;

        const error: ApiError = new Error(errorMessage || `API Error: ${response.status}`);
        error.status = response.status;
        error.response = errorResponse;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error');
    }
  }
}
