// Utopia Gamification System Constants

export const XP_ACTIONS = {
    SIGNUP: 100,
    PROFILE_PHOTO: 50,
    DAILY_OPEN: 10,
    DAILY_CHECKIN: 10,
    SCAN_QR: 20,
    REDEEM_DEAL: 30,
    UPLOAD_BILL_PER_100: 10, // 10 XP per ₹100 spent
    DAILY_MISSION: 100,
    WEEKLY_MISSION: 500,
    REFERRAL: 150,
    FRIEND_FIRST_BILL: 200,
} as const;

export interface Rank {
    name: string;
    xp: number;
    league: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legendary';
    tier: number;
}

// 1XP ~ ₹10-100 spend or 1 check-in. Slow progression is key.
export const RANKS: Rank[] = [
    // Bronze (The Rookie)
    { name: 'Bronze I', xp: 0, league: 'Bronze', tier: 1 },
    { name: 'Bronze II', xp: 2500, league: 'Bronze', tier: 2 },
    { name: 'Bronze III', xp: 5000, league: 'Bronze', tier: 3 },

    // Silver (The Regular)
    { name: 'Silver I', xp: 10000, league: 'Silver', tier: 1 },
    { name: 'Silver II', xp: 20000, league: 'Silver', tier: 2 },
    { name: 'Silver III', xp: 35000, league: 'Silver', tier: 3 },

    // Gold (The Pro)
    { name: 'Gold I', xp: 50000, league: 'Gold', tier: 1 },
    { name: 'Gold II', xp: 75000, league: 'Gold', tier: 2 },
    { name: 'Gold III', xp: 100000, league: 'Gold', tier: 3 },

    // Platinum (The Elite)
    { name: 'Platinum I', xp: 150000, league: 'Platinum', tier: 1 },
    { name: 'Platinum II', xp: 250000, league: 'Platinum', tier: 2 },
    { name: 'Platinum III', xp: 400000, league: 'Platinum', tier: 3 },

    // Diamond (The Legend)
    { name: 'Diamond I', xp: 600000, league: 'Diamond', tier: 1 },
    { name: 'Diamond II', xp: 800000, league: 'Diamond', tier: 2 },
    { name: 'Diamond III', xp: 1000000, league: 'Diamond', tier: 3 },

    // Legendary
    { name: 'Legendary', xp: 2000000, league: 'Legendary', tier: 1 },
];

export const UTOPIA_MODE_THRESHOLD = 50000; // Gold I unlock (Neon Mode)

// Feature Unlock Schedule - Exciting rewards for each tier!
export const FEATURE_UNLOCKS = {
    // Bronze (Starter Perks)
    DAILY_SCRATCH_CARD: 0,       // Bronze I - Win daily prizes
    MISSIONS: 0,                 // Bronze I - UNLOCKED FROM START!
    VOUCHERS: 5000,              // Bronze III - Claimable discount vouchers

    // Silver (Growing Benefits)
    LOYALTY_CARDS: 10000,        // Silver I - Link store loyalty programs
    DEAL_ALERTS: 20000,          // Silver II - Get notified of nearby deals
    EXCLUSIVE_DEALS: 35000,      // Silver III - Access Silver-only deals

    // Gold (Premium Rewards)
    FLASH_DROPS: 50000,          // Gold I - Limited-time mega deals
    PRIORITY_SUPPORT: 75000,     // Gold II - Skip the queue support
    XP_BOOST_1_5X: 100000,       // Gold III - Level up 1.5x faster

    // Platinum (Elite Status)
    DOUBLE_DAILY: 150000,        // Platinum I - 2x Scratch Cards Daily
    GIFT_MODE: 250000,           // Platinum II - Send rewards to friends
    MONTHLY_LOOT: 400000,        // Platinum III - Free Mystery Box/Month

    // Diamond (VIP Treatment)
    VIP_LOUNGE: 600000,          // Diamond I - Exclusive merchant events
    PROFILE_AURA: 800000,        // Diamond II - Special profile effects
    VERIFIED_BADGE: 1000000,     // Diamond III - Blue checkmark status

    // Legendary (The Ultimate)
    LEGENDARY_UI: 2000000,       // Custom app theme & ultimate perks
} as const;

export type FeatureId = keyof typeof FEATURE_UNLOCKS;

// Helper function to get current rank based on XP
export const getRankByXP = (xp: number): Rank => {
    // Find the highest rank the user qualifies for
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].xp) {
            return RANKS[i];
        }
    }
    return RANKS[0]; // Default to Bronze I
};

// Helper function to get next rank
export const getNextRank = (currentXP: number): Rank | null => {
    const currentRank = getRankByXP(currentXP);
    const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);

    if (currentIndex < RANKS.length - 1) {
        return RANKS[currentIndex + 1];
    }
    return null; // Already at max rank
};

// Helper function to calculate XP progress to next rank
export const getXPProgress = (currentXP: number): { current: number; required: number; percentage: number } => {
    const currentRank = getRankByXP(currentXP);
    const nextRank = getNextRank(currentXP);

    if (!nextRank) {
        return { current: currentXP, required: currentXP, percentage: 100 };
    }

    const xpInCurrentRank = currentXP - currentRank.xp;
    const xpRequiredForNext = nextRank.xp - currentRank.xp;
    const percentage = Math.min((xpInCurrentRank / xpRequiredForNext) * 100, 100);

    return {
        current: xpInCurrentRank,
        required: xpRequiredForNext,
        percentage,
    };
};

// Check if user can access a feature
export const canAccessFeature = (userXP: number, featureId: FeatureId): boolean => {
    return userXP >= FEATURE_UNLOCKS[featureId];
};

// Check if user is in Utopia Mode
export const isUtopiaMode = (xp: number): boolean => {
    return xp >= UTOPIA_MODE_THRESHOLD;
};

// Get all unlocked features for a user
export const getUnlockedFeatures = (userXP: number): FeatureId[] => {
    return Object.entries(FEATURE_UNLOCKS)
        .filter(([_, requiredXP]) => userXP >= requiredXP)
        .map(([featureId]) => featureId as FeatureId);
};
