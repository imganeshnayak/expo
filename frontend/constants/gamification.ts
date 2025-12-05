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

export const RANKS: Rank[] = [
    { name: 'Bronze I', xp: 0, league: 'Bronze', tier: 1 },
    { name: 'Bronze II', xp: 50, league: 'Bronze', tier: 2 },
    { name: 'Bronze III', xp: 150, league: 'Bronze', tier: 3 },
    { name: 'Silver I', xp: 250, league: 'Silver', tier: 1 },
    { name: 'Silver II', xp: 350, league: 'Silver', tier: 2 },
    { name: 'Silver III', xp: 450, league: 'Silver', tier: 3 },
    { name: 'Gold I', xp: 550, league: 'Gold', tier: 1 },
    { name: 'Gold II', xp: 650, league: 'Gold', tier: 2 },
    { name: 'Gold III', xp: 750, league: 'Gold', tier: 3 },
    { name: 'Platinum I', xp: 850, league: 'Platinum', tier: 1 },
    { name: 'Platinum II', xp: 950, league: 'Platinum', tier: 2 },
    { name: 'Platinum III', xp: 1050, league: 'Platinum', tier: 3 },
    { name: 'Diamond I', xp: 1150, league: 'Diamond', tier: 1 },
    { name: 'Diamond II', xp: 1250, league: 'Diamond', tier: 2 },
    { name: 'Diamond III', xp: 1350, league: 'Diamond', tier: 3 },
    { name: 'Legendary', xp: 1450, league: 'Legendary', tier: 1 },
];

export const UTOPIA_MODE_THRESHOLD = 250; // Silver I unlock

export const FEATURE_UNLOCKS = {
    MISSIONS: 250,
    UTOPIA_MAP: 250,
    SKILL_TREES: 450,
    AVATAR: 250,
    LOYALTY_CARDS: 250,
    FLASH_DEALS: 350,
    PAY_LATER: 450,
    LEADERBOARD: 550,
    PREMIUM_SKIN: 850,
    NO_ADS: 1050,
    XP_MULTIPLIER: 750,
    FOUNDERS_CLUB: 1450,
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
