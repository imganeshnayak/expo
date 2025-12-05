// API Services - Main export file
export { api, getToken, setToken, removeToken, ApiError } from './client';
export type { ApiResponse } from './client';

export { API_BASE_URL, API_ENDPOINTS } from './config';

// Auth Service
export { authService } from './authService';
export type { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from './authService';

// Loyalty Service
export { loyaltyService } from './loyaltyService';
export type {
    LoyaltyProfile,
    PointTransaction,
    Mission,
    GamificationProfile,
    ClaimRewardResponse,
    XPActionResult,
} from './loyaltyService';

// Wallet Service
export { walletService } from './walletService';
export type { Wallet, WalletTransaction } from './walletService';

// Deals Service
export { dealsService } from './dealsService';
export type { Deal, CreateDealRequest } from './dealsService';

// User Service
export { userService } from './userService';
export type { ClaimedDeal } from './userService';
