import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
import { storage } from '../lib/storage';

interface MerchantUser {
    id: string;
    email: string;
    name: string;
    role: string;
    merchantId: string;
    businessName: string;
    businessType?: string;
    phone?: string;
    address?: string;
    settings?: any;
    businessHours?: {
        weekdays: string;
        weekends: string;
    };
    paymentMethods?: string[];
    logo?: string;
}

interface RegisterData {
    email: string;
    password: string;
    businessName: string;
    name: string;
    phone: string;
}

interface AuthState {
    user: MerchantUser | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    updateProfile: (updates: Partial<MerchantUser>) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post<{
                        success: boolean;
                        token: string;
                        user: MerchantUser;
                    }>('/api/merchant/auth/login', { email, password });

                    const { token, user } = response;

                    // Save to storage
                    await storage.saveToken(token);
                    await storage.saveUser(user);

                    // Set API token
                    api.setToken(token);

                    set({ user, token, isLoading: false });
                    console.log('✅ Login successful:', user.businessName);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    console.error('❌ Login failed:', error.message);
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });
                console.log('📝 Starting registration for:', data.email, data.businessName);
                try {
                    const response = await api.post<{
                        success: boolean;
                        token: string;
                        user: MerchantUser;
                    }>('/api/merchant/auth/register', data);

                    console.log('✅ Registration API response:', response);

                    const { token, user } = response;

                    await storage.saveToken(token);
                    await storage.saveUser(user);
                    api.setToken(token);

                    set({ user, token, isLoading: false });
                    console.log('✅ Registration successful:', user.businessName);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    console.error('❌ Registration failed:', error.message);
                    throw error;
                }
            },

            logout: async () => {
                await storage.clearAll();
                api.clearToken();
                set({ user: null, token: null, error: null });
                console.log('👋 Logged out');
            },

            loadUser: async () => {
                const token = await storage.getToken();
                const user = await storage.getUser();

                if (token && user) {
                    api.setToken(token);
                    set({ user, token });
                    console.log('🔄 User loaded from storage:', user.businessName);
                }
            },

            updateProfile: async (updates: Partial<MerchantUser>) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.put<{
                        success: boolean;
                        user: MerchantUser;
                    }>('/api/merchant/auth/profile', updates);

                    const updatedUser = response.user;
                    await storage.saveUser(updatedUser);
                    set({ user: updatedUser, isLoading: false });
                    console.log('✅ Profile updated');
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    console.error('❌ Profile update failed:', error.message);
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'uma-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
