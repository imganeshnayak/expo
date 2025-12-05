import { Platform } from 'react-native';

// API Configuration
// Using local IP to allow connection from physical devices on the same network
const DEFAULT_API_URL = 'http://192.168.1.102:5000';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

// API Client
class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers = new Headers(options.headers);

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error((error as any).message || `HTTP ${response.status}`);
        }

        return response.json() as Promise<T>;
    }

    // GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Upload Image
    async uploadImage(uri: string): Promise<string> {
        const formData = new FormData();

        // Append file
        const filename = uri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // @ts-ignore - React Native FormData expects this structure
        formData.append('image', { uri, name: filename, type });

        const headers = new Headers();
        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }
        // Do NOT set Content-Type to multipart/form-data manually, let the browser/engine handle boundary

        const response = await fetch(`${this.baseURL}/api/upload`, {
            method: 'POST',
            body: formData as any,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error((error as any).message || `HTTP ${response.status}`);
        }

        const data = await response.json() as { url: string };
        return data.url;
    }
}

// Create singleton instance
export const api = new ApiClient(API_URL);

// Export API URL for reference
export { API_URL };
