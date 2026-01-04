import api, { setToken, removeToken, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface AuthResponse {
    _id: string;
    name: string;
    email: string;
    phone: string;
    token: string;
}

export interface UserProfile {
    _id: string;
    email: string;
    phone: string;
    profile: {
        name: string;
        avatar?: string;
        location?: {
            address: string;
            coordinates: {
                latitude: number;
                longitude: number;
            };
        };
        preferences: {
            notifications: boolean;
            locationServices: boolean;
            language: string;
        };
    };
    loyaltyPoints: number;
    loyaltyLevel: string;
    gamification?: {
        xp: { current: number; lifetime: number };
        rank: { league: string; tier: number; displayName: string };
        streak: { current: number; lastActiveDate: string };
        unlockedFeatures: string[];
        skillTree: Record<string, number>;
        pendingRewards?: Array<{
            _id: string;
            title: string;
            xp: number;
            source: string;
            createdAt: string;
        }>;
    };
}

// Auth Service
export const authService = {
    // Login user
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

        if (response.data?.token) {
            await setToken(response.data.token);
        }

        return response;
    },

    // Register new user
    async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);

        if (response.data?.token) {
            await setToken(response.data.token);
        }

        return response;
    },

    // Get current user profile
    async getMe(): Promise<ApiResponse<UserProfile>> {
        return api.get<UserProfile>(API_ENDPOINTS.AUTH.ME, {}, true);
    },

    // Logout user
    async logout(): Promise<void> {
        await removeToken();
    },
};

export default authService;
