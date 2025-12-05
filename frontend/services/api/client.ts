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

// Get stored auth token
export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

// Set auth token
export const setToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

// Remove auth token
export const removeToken = async (): Promise<void> => {
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

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        requiresAuth: boolean = false
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add auth token if required
        if (requiresAuth) {
            const token = await getToken();
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            console.log(`[API] ${options.method || 'GET'} ${endpoint}`);

            const response = await fetchWithTimeout(url, {
                ...options,
                headers,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = data?.message || `Request failed with status ${response.status}`;
                console.error(`[API Error] ${endpoint}: ${errorMessage}`);
                return {
                    data: null,
                    error: errorMessage,
                    status: response.status,
                };
            }

            console.log(`[API Success] ${endpoint}`);
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
    async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' }, requiresAuth);
    }

    // POST request
    async post<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = false
    ): Promise<ApiResponse<T>> {
        return this.request<T>(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            requiresAuth
        );
    }

    // PUT request
    async put<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = false
    ): Promise<ApiResponse<T>> {
        return this.request<T>(
            endpoint,
            {
                method: 'PUT',
                body: JSON.stringify(body),
            },
            requiresAuth
        );
    }

    // DELETE request
    async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth);
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
