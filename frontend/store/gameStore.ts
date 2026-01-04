import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================
// TYPES
// ============================

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: string | null;
    streakProtectionUsed: boolean; // Can miss 1 day per 7-day streak
}

export interface DailyReward {
    day: number;
    xp: number;
    bonus?: string; // Special bonus description
    claimed: boolean;
}

export interface LootDrop {
    id: string;
    merchantId: string;
    merchantName: string;
    discountPercent: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    expiresAt: Date;
    location: {
        lat: number;
        lng: number;
    };
}

export interface GymBadge {
    merchantId: string;
    merchantName: string;
    earnedAt: Date;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface GameState {
    // Streak System
    streak: StreakData;
    dailyRewards: DailyReward[];
    lastRewardClaimDate: string | null;

    // XP Multipliers
    xpMultiplier: number;
    activeBoosts: string[];

    // Gym Battles
    gymBadges: GymBadge[];
    dailyBattlesRemaining: number;

    // Loot Drops
    activeLootDrops: LootDrop[];
    claimedLootDrops: string[];

    // Stats
    totalUtopiansCaught: number;
    totalBattlesWon: number;
    totalDiscountsEarned: number;
    coins: number;
    xp: number;

    // Actions
    checkAndUpdateStreak: () => void;
    claimDailyReward: (day: number) => boolean;
    getXPMultiplier: () => number;
    addGymBadge: (badge: GymBadge) => void;
    useBattle: () => boolean;
    resetDailyBattles: () => void;
    claimLootDrop: (id: string) => LootDrop | null;
    incrementCatches: () => void;
    incrementBattleWins: () => void;
    addCoins: (amount: number) => void;
    addXP: (amount: number) => void;
}

// ============================
// DEFAULT VALUES
// ============================

const DEFAULT_DAILY_REWARDS: DailyReward[] = [
    { day: 1, xp: 50, claimed: false },
    { day: 2, xp: 75, claimed: false },
    { day: 3, xp: 100, bonus: 'Rare Spawn Ticket', claimed: false },
    { day: 4, xp: 125, claimed: false },
    { day: 5, xp: 150, claimed: false },
    { day: 6, xp: 200, bonus: 'Epic Loot Chance', claimed: false },
    { day: 7, xp: 500, bonus: '🎉 Legendary Bonus!', claimed: false },
];

const DEFAULT_STREAK: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    streakProtectionUsed: false,
};

// ============================
// HELPER FUNCTIONS
// ============================

const isToday = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const isYesterday = (dateString: string | null): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};

const calculateXPMultiplier = (streak: number): number => {
    if (streak >= 30) return 2.0;
    if (streak >= 21) return 1.8;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.3;
    if (streak >= 3) return 1.1;
    return 1.0;
};

// ============================
// ZUSTAND STORE
// ============================

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial State
            streak: DEFAULT_STREAK,
            dailyRewards: DEFAULT_DAILY_REWARDS,
            lastRewardClaimDate: null,
            xpMultiplier: 1.0,
            activeBoosts: [],
            gymBadges: [],
            dailyBattlesRemaining: 5,
            activeLootDrops: [],
            claimedLootDrops: [],
            totalUtopiansCaught: 0,
            totalBattlesWon: 0,
            totalDiscountsEarned: 0,
            coins: 500, // Starting coins for demo
            xp: 0,

            // Check and update streak on app open
            checkAndUpdateStreak: () => {
                const state = get();
                const today = new Date().toISOString().split('T')[0];

                // Already logged in today
                if (isToday(state.streak.lastLoginDate)) {
                    return;
                }

                let newStreak = state.streak.currentStreak;
                let streakProtectionUsed = state.streak.streakProtectionUsed;

                if (isYesterday(state.streak.lastLoginDate)) {
                    // Continuing streak!
                    newStreak += 1;

                    // Reset streak protection every 7 days
                    if (newStreak % 7 === 0) {
                        streakProtectionUsed = false;
                    }
                } else if (state.streak.lastLoginDate) {
                    // Missed a day
                    const daysSince = Math.floor(
                        (Date.now() - new Date(state.streak.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysSince === 2 && !streakProtectionUsed && state.streak.currentStreak >= 7) {
                        // Use streak protection (missed exactly 1 day)
                        streakProtectionUsed = true;
                        newStreak = state.streak.currentStreak; // Keep streak
                    } else {
                        // Reset streak
                        newStreak = 1;
                        streakProtectionUsed = false;
                    }
                } else {
                    // First login ever
                    newStreak = 1;
                }

                const longestStreak = Math.max(state.streak.longestStreak, newStreak);
                const xpMultiplier = calculateXPMultiplier(newStreak);

                // Reset daily rewards if streak resets
                let dailyRewards = state.dailyRewards;
                if (newStreak === 1 && state.streak.currentStreak > 1) {
                    dailyRewards = DEFAULT_DAILY_REWARDS;
                }

                // Reset daily battles
                const dailyBattlesRemaining = 5;

                set({
                    streak: {
                        currentStreak: newStreak,
                        longestStreak,
                        lastLoginDate: today,
                        streakProtectionUsed,
                    },
                    xpMultiplier,
                    dailyBattlesRemaining,
                    dailyRewards,
                });
            },

            // Claim daily reward
            claimDailyReward: (day: number) => {
                const state = get();
                const reward = state.dailyRewards.find(r => r.day === day);

                if (!reward || reward.claimed) return false;
                if (day > state.streak.currentStreak) return false;

                const today = new Date().toISOString().split('T')[0];

                set({
                    dailyRewards: state.dailyRewards.map(r =>
                        r.day === day ? { ...r, claimed: true } : r
                    ),
                    lastRewardClaimDate: today,
                });

                return true;
            },

            // Get current XP multiplier
            getXPMultiplier: () => {
                return get().xpMultiplier;
            },

            // Add gym badge
            addGymBadge: (badge: GymBadge) => {
                const state = get();
                const existingIndex = state.gymBadges.findIndex(
                    b => b.merchantId === badge.merchantId
                );

                if (existingIndex >= 0) {
                    // Upgrade existing badge
                    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
                    const currentTier = tiers.indexOf(state.gymBadges[existingIndex].tier);
                    const newTier = tiers.indexOf(badge.tier);

                    if (newTier > currentTier) {
                        const newBadges = [...state.gymBadges];
                        newBadges[existingIndex] = badge;
                        set({ gymBadges: newBadges });
                    }
                } else {
                    set({ gymBadges: [...state.gymBadges, badge] });
                }
            },

            // Use a battle (returns false if none remaining)
            useBattle: () => {
                const state = get();
                if (state.dailyBattlesRemaining <= 0) return false;

                set({ dailyBattlesRemaining: state.dailyBattlesRemaining - 1 });
                return true;
            },

            // Reset daily battles (called at midnight)
            resetDailyBattles: () => {
                set({ dailyBattlesRemaining: 5 });
            },

            // Claim a loot drop
            claimLootDrop: (id: string) => {
                const state = get();
                const drop = state.activeLootDrops.find(d => d.id === id);

                if (!drop) return null;
                if (state.claimedLootDrops.includes(id)) return null;

                set({
                    claimedLootDrops: [...state.claimedLootDrops, id],
                    totalDiscountsEarned: state.totalDiscountsEarned + 1,
                });

                return drop;
            },

            // Increment catch count
            incrementCatches: () => {
                set({ totalUtopiansCaught: get().totalUtopiansCaught + 1 });
            },

            // Increment battle wins
            incrementBattleWins: () => {
                set({ totalBattlesWon: get().totalBattlesWon + 1 });
            },

            // Add coins
            addCoins: (amount: number) => {
                set({ coins: get().coins + amount });
            },

            // Add XP
            addXP: (amount: number) => {
                set({ xp: get().xp + amount });
            },
        }),
        {
            name: 'utopia-game-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                streak: state.streak,
                dailyRewards: state.dailyRewards,
                lastRewardClaimDate: state.lastRewardClaimDate,
                gymBadges: state.gymBadges,
                claimedLootDrops: state.claimedLootDrops,
                totalUtopiansCaught: state.totalUtopiansCaught,
                totalBattlesWon: state.totalBattlesWon,
                totalDiscountsEarned: state.totalDiscountsEarned,
            }),
        }
    )
);
