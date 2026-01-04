import api, { ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface LoyaltyProfile {
    points: number;
    level: string;
    history: PointTransaction[];
}

export interface PointTransaction {
    _id: string;
    userId: string;
    type: 'earn' | 'redeem' | 'expired' | 'bonus';
    amount: number;
    description: string;
    source: 'purchase' | 'mission' | 'referral' | 'reward' | 'bonus' | 'admin';
    referenceId?: string;
    createdAt: string;
}

export interface Mission {
    _id: string;
    title: string;
    description: string;
    type: 'first_ride' | 'weekly_rides' | 'referral' | 'spend_amount' | 'streak' | 'custom';
    targetValue: number;
    rewardPoints: number;
    expiresAt?: string;
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface GamificationProfile {
    xp: {
        current: number;
        lifetime: number;
    };
    rank: {
        league: string;
        tier: number;
        displayName: string;
    };
    streak: {
        current: number;
        lastActiveDate: string;
    };
    unlockedFeatures: string[];
    skillTree: Record<string, number>;
}

export interface ClaimRewardResponse {
    message: string;
    points: number;
    level: string;
}

export interface XPActionResult {
    newXp: number;
    leveledUp: boolean;
    newRank?: {
        league: string;
        tier: number;
        displayName: string;
    };
    unlockedFeatures?: string[];
}

export interface PendingReward {
    _id: string;
    title: string;
    xp: number;
    source: string;
    createdAt: string;
}

export interface DailyCheckInResponse {
    message: string;
    streak: number;
    xpEarned: number;
    nextCheckInAt: string;
    pendingRewards: PendingReward[];
}

export interface CheckInStatus {
    canCheckIn: boolean;
    lastCheckIn: string | null;
    nextCheckInAt: string | null;
    hoursRemaining: number;
    minutesRemaining: number;
    currentStreak: number;
}


// Loyalty Service
export const loyaltyService = {
    // Get user's loyalty profile (points, level, history)
    async getProfile(): Promise<ApiResponse<LoyaltyProfile>> {
        return api.get<LoyaltyProfile>(API_ENDPOINTS.LOYALTY.PROFILE, {}, true);
    },

    // Get available missions
    async getMissions(): Promise<ApiResponse<Mission[]>> {
        return api.get<Mission[]>(API_ENDPOINTS.LOYALTY.MISSIONS, {}, true);
    },

    // Claim a mission reward
    async claimReward(missionId: string): Promise<ApiResponse<ClaimRewardResponse>> {
        return api.post<ClaimRewardResponse>(
            API_ENDPOINTS.LOYALTY.CLAIM(missionId),
            {},
            true
        );
    },

    // Get gamification profile (XP, rank, unlocks)
    async getGamificationProfile(): Promise<ApiResponse<GamificationProfile>> {
        return api.get<GamificationProfile>(API_ENDPOINTS.LOYALTY.GAMIFICATION, {}, true);
    },

    // Get pending XP rewards
    async getPendingRewards(): Promise<ApiResponse<PendingReward[]>> {
        return api.get<PendingReward[]>('/api/loyalty/gamification/rewards/pending', {}, true);
    },

    // Claim a pending XP reward
    async claimXPReward(rewardId: string): Promise<ApiResponse<XPActionResult>> {
        return api.post<XPActionResult>(
            `/api/loyalty/gamification/rewards/${rewardId}/claim`,
            {},
            true
        );
    },

    // Trigger an XP action (for testing/dev)
    async triggerAction(amount: number, source: string): Promise<ApiResponse<XPActionResult>> {
        return api.post<XPActionResult>(
            API_ENDPOINTS.LOYALTY.ACTION,
            { amount, source },
            true
        );
    },

    // Daily check-in
    async dailyCheckIn(): Promise<ApiResponse<DailyCheckInResponse>> {
        return api.post<DailyCheckInResponse>(
            '/api/loyalty/checkin',
            {},
            true
        );
    },

    // Get daily check-in status
    async getCheckInStatus(): Promise<ApiResponse<CheckInStatus>> {
        // Fix incorrect argument order (pass empty params object) and silence global 401 handler
        return api.get<CheckInStatus>(
            '/api/loyalty/checkin/status',
            {},
            true,
            { skipGlobalAuthHandler: true }
        );
    },
};

export default loyaltyService;
