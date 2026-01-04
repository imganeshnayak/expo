import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    RANKS,
    getRankByXP,
    getUnlockedFeatures,
    isUtopiaMode,
    type Rank,
    type FeatureId
} from '@/constants/gamification';
import { UserProfile } from '@/services/api';



import { loyaltyService, PendingReward } from '@/services/api/loyaltyService';

export interface GamificationState {
    xp: {
        current: number;
        lifetime: number;
    };
    rank: Rank;
    streak: {
        current: number;
        lastActiveDate: string; // ISO date string
    };
    unlockedFeatures: FeatureId[];
    skillTree: Record<string, number>;
    isUtopiaMode: boolean;
    lastLogin: string;
    pendingRewards: PendingReward[];
}

interface UserState {
    user: UserProfile | null;
    gamification: GamificationState;

    // Actions
    setUser: (user: UserProfile | null) => void;
    updateGamification: (data: Partial<GamificationState>) => void;
    addXP: (amount: number, source?: string) => Promise<{ leveledUp: boolean; newRank?: Rank; unlockedFeatures?: FeatureId[] }>;
    unlockFeature: (featureId: FeatureId) => void;
    updateStreak: () => void;
    logout: () => void;
    canAccessFeature: (featureId: FeatureId) => boolean;
    fetchPendingRewards: () => Promise<void>;
    claimReward: (rewardId: string) => Promise<void>;
    fetchGamificationProfile: () => Promise<void>;
}

const initialGamification: GamificationState = {
    xp: { current: 0, lifetime: 0 },
    rank: RANKS[0], // Bronze I
    streak: { current: 0, lastActiveDate: new Date().toISOString() },
    unlockedFeatures: [],
    skillTree: {},
    isUtopiaMode: false,
    lastLogin: new Date().toISOString(),
    pendingRewards: [],
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            gamification: initialGamification,

            setUser: (user) => {
                set({ user });
                if (user?.gamification) {
                    set((state) => ({
                        gamification: {
                            ...state.gamification,
                            xp: user.gamification?.xp || state.gamification.xp,
                            rank: user.gamification?.rank ? {
                                ...state.gamification.rank,
                                ...user.gamification.rank,
                                name: user.gamification.rank.displayName || state.gamification.rank.name
                            } as Rank : state.gamification.rank,
                            streak: user.gamification?.streak ? { ...user.gamification.streak, lastActiveDate: user.gamification.streak.lastActiveDate || new Date().toISOString() } : state.gamification.streak,
                            unlockedFeatures: (user.gamification?.unlockedFeatures as FeatureId[]) || state.gamification.unlockedFeatures,
                            pendingRewards: (user.gamification?.pendingRewards as any) || [],
                        }
                    }));
                }
            },

            updateGamification: (data) =>
                set((state) => ({
                    gamification: { ...state.gamification, ...data },
                })),

            addXP: async (amount, source) => {
                return new Promise((resolve) => {
                    set((state) => {
                        const oldXP = state.gamification.xp.current;
                        const newXP = oldXP + amount;
                        const lifetimeXP = state.gamification.xp.lifetime + amount;

                        // Get old and new ranks
                        const oldRank = state.gamification.rank;
                        const newRank = getRankByXP(newXP);
                        const leveledUp = newRank.name !== oldRank.name;

                        // Check for newly unlocked features
                        const oldUnlocked = getUnlockedFeatures(oldXP);
                        const newUnlocked = getUnlockedFeatures(newXP);
                        const newlyUnlocked = newUnlocked.filter(f => !oldUnlocked.includes(f));

                        // Check if entering Utopia Mode
                        const wasUtopiaMode = state.gamification.isUtopiaMode;
                        const nowUtopiaMode = isUtopiaMode(newXP);
                        const enteredUtopiaMode = !wasUtopiaMode && nowUtopiaMode;

                        // Log XP gain (in production, send to analytics)
                        console.log(`[XP] +${amount} from ${source || 'unknown'} | ${oldXP} → ${newXP}`);
                        if (leveledUp) {
                            console.log(`[RANK UP] ${oldRank.name} → ${newRank.name}`);
                        }
                        if (enteredUtopiaMode) {
                            console.log(`[UTOPIA MODE] Unlocked! Welcome to the premium experience.`);
                        }

                        const result = {
                            leveledUp,
                            newRank: leveledUp ? newRank : undefined,
                            unlockedFeatures: newlyUnlocked.length > 0 ? newlyUnlocked : undefined,
                        };

                        // Resolve the promise with the result
                        setTimeout(() => resolve(result), 0);

                        return {
                            gamification: {
                                ...state.gamification,
                                xp: { current: newXP, lifetime: lifetimeXP },
                                rank: newRank,
                                unlockedFeatures: newUnlocked,
                                isUtopiaMode: nowUtopiaMode,
                            },
                        };
                    });
                });
            },

            unlockFeature: (featureId) =>
                set((state) => {
                    if (state.gamification.unlockedFeatures.includes(featureId)) {
                        return state;
                    }
                    return {
                        gamification: {
                            ...state.gamification,
                            unlockedFeatures: [...state.gamification.unlockedFeatures, featureId],
                        },
                    };
                }),

            updateStreak: () =>
                set((state) => {
                    const today = new Date().toISOString().split('T')[0];
                    const lastActive = new Date(state.gamification.streak.lastActiveDate).toISOString().split('T')[0];

                    if (today === lastActive) {
                        // Already checked in today
                        return state;
                    }

                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    const isConsecutive = lastActive === yesterday;

                    return {
                        gamification: {
                            ...state.gamification,
                            streak: {
                                ...state.gamification.streak,
                                current: isConsecutive ? state.gamification.streak.current + 1 : 1,
                                lastActiveDate: new Date().toISOString(),
                            },
                            lastLogin: new Date().toISOString(),
                        },
                    };
                }),

            canAccessFeature: (featureId) => {
                const state = get();
                return state.gamification.unlockedFeatures.includes(featureId);
            },

            fetchPendingRewards: async () => {
                if (!get().user) return; // Auth Guard
                try {
                    const response = await loyaltyService.getPendingRewards();
                    if (response.data) {
                        set((state) => ({
                            gamification: {
                                ...state.gamification,
                                pendingRewards: response.data || [],
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch pending rewards', error);
                }
            },

            claimReward: async (rewardId: string) => {
                if (!get().user) return; // Auth Guard
                try {
                    const response = await loyaltyService.claimXPReward(rewardId);
                    if (response.data) {
                        // Update local state with new XP/Rank from backend
                        const { newXp, newRank, unlockedFeatures } = response.data;

                        set((state) => {
                            // Calculate the difference to update lifetime XP
                            const xpDiff = newXp - state.gamification.xp.current;

                            return {
                                gamification: {
                                    ...state.gamification,
                                    xp: {
                                        current: newXp,
                                        lifetime: state.gamification.xp.lifetime + (xpDiff > 0 ? xpDiff : 0)
                                    },
                                    rank: { ...state.gamification.rank, ...newRank } as Rank,
                                    unlockedFeatures: unlockedFeatures as FeatureId[] || state.gamification.unlockedFeatures,
                                    pendingRewards: state.gamification.pendingRewards.filter(r => r._id !== rewardId),
                                }
                            };
                        });

                        // Fetch updated gamification profile to ensure consistency
                        await get().fetchGamificationProfile();
                        await get().fetchPendingRewards();
                    }
                } catch (error) {
                    console.error('Failed to claim reward', error);
                    throw error;
                }
            },

            fetchGamificationProfile: async () => {
                if (!get().user) return; // Auth Guard
                try {
                    const response = await loyaltyService.getGamificationProfile();
                    if (response.data) {
                        const { xp, rank, streak, unlockedFeatures } = response.data;

                        set((state) => ({
                            gamification: {
                                ...state.gamification,
                                xp: xp || state.gamification.xp,
                                rank: rank ? getRankByXP(xp.current) : state.gamification.rank,
                                streak: streak ? {
                                    current: streak.current,
                                    lastActiveDate: streak.lastActiveDate
                                } : state.gamification.streak,
                                unlockedFeatures: (unlockedFeatures as FeatureId[]) || state.gamification.unlockedFeatures,
                                isUtopiaMode: isUtopiaMode(xp?.current || 0),
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch gamification profile', error);
                }
            },

            logout: () => set({ user: null, gamification: initialGamification }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
