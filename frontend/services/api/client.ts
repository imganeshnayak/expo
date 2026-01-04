import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

// Token storage key
const TOKEN_KEY = 'auth_token';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

// API Response type
export interface ApiResponse<T = any> {
    data: T | null;
    error: string | null;
    status: number;
}

// Custom error class for API errors
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// In-memory token cache
let memoryToken: string | null = null;

// Get stored auth token
export const getToken = async (): Promise<string | null> => {
    if (memoryToken) return memoryToken;
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) memoryToken = token;
        return token;
    } catch {
        return null;
    }
};

// Set auth token
export const setToken = async (token: string): Promise<void> => {
    memoryToken = token;
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

// Remove auth token
export const removeToken = async (): Promise<void> => {
    memoryToken = null;
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

// Create request with timeout
const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

// Main API client
class ApiClient {
    private baseUrl: string;
    private onUnauthorized: (() => void) | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setUnauthorizedCallback(callback: () => void) {
        this.onUnauthorized = callback;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit & { skipGlobalAuthHandler?: boolean } = {},
        requiresAuth: boolean = false
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        // Add auth token if required
        if (requiresAuth) {
            const token = await getToken();
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            // Suppress logs for frequent polling endpoints
            const isPolling = endpoint.includes('/checkin/status');
            if (!isPolling) {
                console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
            }

            const response = await fetchWithTimeout(url, {
                ...options,
                headers,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = data?.message || `Request failed with status ${response.status}`;
                if (response.status === 401) {
                    if (!options.skipGlobalAuthHandler) {
                        this.onUnauthorized?.();
                    }
                    // Don't log error for 401 as it's handled globally (or skipped)
                } else {
                    console.error(`[API Error] ${endpoint}: ${errorMessage}`);
                }

                return {
                    data: null,
                    error: errorMessage,
                    status: response.status,
                };
            }

            return {
                data,
                error: null,
                status: response.status,
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.error(`[API Timeout] ${endpoint}`);
                    return {
                        data: null,
                        error: 'Request timeout. Please check your connection.',
                        status: 0,
                    };
                }
                console.error(`[API Network Error] ${endpoint}: ${error.message}`);
                return {
                    data: null,
                    error: 'Network error. Please check your connection.',
                    status: 0,
                };
            }
            return {
                data: null,
                error: 'An unexpected error occurred.',
                status: 0,
            };
        }
    }

    // GET request
    async get<T>(
        endpoint: string,
        params: Record<string, any> = {},
        requiresAuth: boolean = false,
        options: { skipGlobalAuthHandler?: boolean } = {}
    ): Promise<ApiResponse<T>> {
        let url = endpoint;
        if (Object.keys(params).length > 0) {
            // Filter out undefined/null values
            const validParams = Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>);

            const queryString = new URLSearchParams(validParams).toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return this.request<T>(url, { method: 'GET', ...options }, requiresAuth);
    }

    // POST request
    async post<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = false,
        options: { skipGlobalAuthHandler?: boolean } = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify(body),
                ...options
            },
            requiresAuth
        );
    }

    // PUT request
    async put<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = false,
        options: { skipGlobalAuthHandler?: boolean } = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(
            endpoint,
            {
                method: 'PUT',
                body: JSON.stringify(body),
                ...options
            },
            requiresAuth
        );
    }

    // DELETE request
    async delete<T>(
        endpoint: string,
        requiresAuth: boolean = false,
        options: { skipGlobalAuthHandler?: boolean } = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options }, requiresAuth);
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
