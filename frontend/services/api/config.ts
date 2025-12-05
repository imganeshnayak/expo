// API Configuration
// For Expo development, use your computer's local IP address
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP

import { Platform } from 'react-native';

const getBaseUrl = () => {
    // For physical devices, use your machine's actual IP address
    if (__DEV__) {
        return 'http://192.168.1.102:5000';
    }

    // Production - Update this with your production API URL
    return 'https://api.your-production-url.com';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
    },

    // Wallet
    WALLET: {
        GET: '/api/wallet',
        TOPUP: '/api/wallet/topup',
        WITHDRAW: '/api/wallet/withdraw',
    },

    // Deals
    DEALS: {
        LIST: '/api/deals',
        GET: (id: string) => `/api/deals/${id}`,
        CREATE: '/api/deals',
    },

    // Loyalty & Gamification
    LOYALTY: {
        PROFILE: '/api/loyalty',
        MISSIONS: '/api/loyalty/missions',
        CLAIM: (missionId: string) => `/api/loyalty/claim/${missionId}`,
        GAMIFICATION: '/api/loyalty/gamification',
        ACTION: '/api/loyalty/action',
    },

    // Rides (ONDC)
    RIDES: {
        SEARCH: '/api/rides/search',
        SELECT: '/api/rides/select',
        INIT: '/api/rides/init',
        CONFIRM: '/api/rides/confirm',
        STATUS: '/api/rides/status',
        CANCEL: '/api/rides/cancel',
    },

    // Health Check
    HEALTH: '/health',
};
