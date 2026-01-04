import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================
// TYPES
// ============================

export type StakeType = 'pride' | 'xp' | 'coins' | 'items';
export type BattleMode = '1v1' | '2v2' | 'koth' | 'collect';
export type BattleStatus = 'idle' | 'searching' | 'challenging' | 'waiting' | 'in_battle' | 'results';
export type ChallengeResponse = 'pending' | 'accepted' | 'declined' | 'expired';

export interface NearbyPlayer {
    id: string;
    username: string;
    avatar: string;
    level: number;
    rank: number;
    winRate: number;
    currentStreak: number;
    isOnline: boolean;
    distance: number; // meters
    lastSeen: Date;
    isFriend: boolean;
    isRival: boolean; // Lost to them recently
    headToHead: { wins: number; losses: number };
    location?: {
        lat: number;
        lng: number;
        merchantName?: string;
        merchantId?: string;
    };
}

export interface BattleStake {
    type: StakeType;
    amount: number;
    itemId?: string; // For item stakes
    itemName?: string;
}

export interface BattleChallenge {
    id: string;
    challengerId: string;
    challengerName: string;
    challengerAvatar: string;
    challengerLevel: number;
    challengerStreak: number;
    opponentId: string;
    opponentName?: string;
    mode: BattleMode;
    stake: BattleStake;
    message?: string;
    createdAt: Date;
    expiresAt: Date;
    status: ChallengeResponse;
    locationName?: string;
}

export interface BattleResult {
    id: string;
    date: Date;
    mode: BattleMode;
    opponent: {
        id: string;
        username: string;
        avatar: string;
        level: number;
    };
    won: boolean;
    myScore: number;
    opponentScore: number;
    duration: number; // seconds
    stake: BattleStake;
    rewards: {
        xp: number;
        coins: number;
        items?: string[];
        streakBonus?: number;
    };
    wasClutch: boolean; // Won with <10% HP
    isRevenge: boolean; // Beat a rival
    locationName?: string;
}

export interface WinStreak {
    current: number;
    best: number;
    multiplier: number;
    shieldActive: boolean; // Next loss protected
}

export interface Rivalry {
    odlayerId: string;
    playerName: string;
    wins: number;
    losses: number;
    lastBattle: Date;
    isNemesis: boolean; // Lost 3+ times in a row
}

export interface ArenaStats {
    totalBattles: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    longestStreak: number;
    clutchWins: number;
    revengeWins: number;
    coinsEarned: number;
    coinsLost: number;
    xpEarned: number;
    favoriteMode: BattleMode;
    uniqueOpponents: number;
}

// ============================
// STREAK MULTIPLIER CALCULATION
// ============================

const getStreakMultiplier = (streak: number): number => {
    if (streak >= 15) return 3.0;
    if (streak >= 10) return 2.5;
    if (streak >= 7) return 2.0;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
};

const getStreakReward = (streak: number): { type: 'none' | 'lootbox' | 'badge' | 'legendary'; description: string } => {
    if (streak >= 15) return { type: 'legendary', description: '👑 Crown + Legendary Loot!' };
    if (streak >= 10) return { type: 'legendary', description: '🎁 Legendary Chance Unlocked!' };
    if (streak >= 7) return { type: 'badge', description: '🔥 Hot Streak Badge!' };
    if (streak >= 5) return { type: 'lootbox', description: '🎁 Rare Loot Box!' };
    if (streak >= 3) return { type: 'lootbox', description: '📦 Bonus Loot Box!' };
    return { type: 'none', description: '' };
};

// ============================
// ARENA STORE
// ============================

interface ArenaState {
    // Status
    status: BattleStatus;
    isLocationSharing: boolean;

    // Discovery
    nearbyPlayers: NearbyPlayer[];
    lastLocationUpdate: Date | null;

    // Active battles
    currentChallenge: BattleChallenge | null;
    incomingChallenges: BattleChallenge[];
    activeBattleSessionId: string | null;

    // History & Stats
    battleHistory: BattleResult[];
    winStreak: WinStreak;
    rivalries: Rivalry[];
    stats: ArenaStats;

    // Preferences
    preferredMode: BattleMode;
    autoAcceptFriends: boolean;
    showOnMap: boolean;

    // Actions
    setLocationSharing: (enabled: boolean) => void;
    updateNearbyPlayers: (players: NearbyPlayer[]) => void;
    sendChallenge: (opponent: NearbyPlayer, mode: BattleMode, stake: BattleStake, message?: string) => BattleChallenge;
    receiveChallenge: (challenge: BattleChallenge) => void;
    respondToChallenge: (challengeId: string, accept: boolean) => void;
    startBattle: (sessionId: string) => void;
    endBattle: (result: Omit<BattleResult, 'id' | 'date' | 'rewards'>) => BattleResult;
    cancelChallenge: () => void;
    useStreakShield: () => boolean;
    updateRivalry: (opponentId: string, won: boolean, opponentName: string) => void;
    clearExpiredChallenges: () => void;
    setPreferredMode: (mode: BattleMode) => void;
    toggleAutoAcceptFriends: () => void;
    toggleShowOnMap: () => void;
}

export const useArenaStore = create<ArenaState>()(
    persist(
        (set, get) => ({
            // Initial State
            status: 'idle',
            isLocationSharing: false,
            nearbyPlayers: [],
            lastLocationUpdate: null,
            currentChallenge: null,
            incomingChallenges: [],
            activeBattleSessionId: null,
            battleHistory: [],
            winStreak: {
                current: 0,
                best: 0,
                multiplier: 1.0,
                shieldActive: false,
            },
            rivalries: [],
            stats: {
                totalBattles: 0,
                totalWins: 0,
                totalLosses: 0,
                winRate: 0,
                longestStreak: 0,
                clutchWins: 0,
                revengeWins: 0,
                coinsEarned: 0,
                coinsLost: 0,
                xpEarned: 0,
                favoriteMode: '1v1',
                uniqueOpponents: 0,
            },
            preferredMode: '1v1',
            autoAcceptFriends: false,
            showOnMap: true,

            // Location sharing toggle
            setLocationSharing: (enabled: boolean) => {
                set({ isLocationSharing: enabled, showOnMap: enabled });
            },

            // Update nearby players from server
            updateNearbyPlayers: (players: NearbyPlayer[]) => {
                const state = get();
                // Mark rivals
                const withRivals = players.map(p => ({
                    ...p,
                    isRival: state.rivalries.some(r => r.odlayerId === p.id && r.losses > r.wins),
                }));
                set({
                    nearbyPlayers: withRivals,
                    lastLocationUpdate: new Date(),
                });
            },

            // Send a battle challenge
            sendChallenge: (opponent, mode, stake, message) => {
                const challenge: BattleChallenge = {
                    id: `challenge_${Date.now()}`,
                    challengerId: 'current_user', // Replace with actual user ID
                    challengerName: 'You', // Replace with actual username
                    challengerAvatar: '🎮',
                    challengerLevel: 1, // Replace with actual level
                    challengerStreak: get().winStreak.current,
                    opponentId: opponent.id,
                    opponentName: opponent.username,
                    mode,
                    stake,
                    message,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 30000), // 30 seconds
                    status: 'pending',
                    locationName: opponent.location?.merchantName,
                };

                set({
                    currentChallenge: challenge,
                    status: 'challenging',
                });

                return challenge;
            },

            // Receive an incoming challenge
            receiveChallenge: (challenge) => {
                set(state => ({
                    incomingChallenges: [...state.incomingChallenges, challenge],
                }));
            },

            // Respond to a challenge
            respondToChallenge: (challengeId, accept) => {
                set(state => {
                    const challenge = state.incomingChallenges.find(c => c.id === challengeId);
                    if (!challenge) return state;

                    return {
                        incomingChallenges: state.incomingChallenges.filter(c => c.id !== challengeId),
                        currentChallenge: accept ? { ...challenge, status: 'accepted' } : null,
                        status: accept ? 'waiting' : state.status,
                    };
                });
            },

            // Start the actual battle
            startBattle: (sessionId) => {
                set({
                    activeBattleSessionId: sessionId,
                    status: 'in_battle',
                });
            },

            // End battle and calculate rewards
            endBattle: (result) => {
                const state = get();
                const streak = state.winStreak;

                // Calculate rewards
                let xpReward = result.won ? 100 : 25;
                let coinReward = 0;

                // Apply stake
                if (result.stake.type === 'xp') {
                    xpReward += result.won ? result.stake.amount : -Math.floor(result.stake.amount * 0.5);
                } else if (result.stake.type === 'coins') {
                    coinReward = result.won ? result.stake.amount : -result.stake.amount;
                }

                // Apply streak multiplier
                const streakMultiplier = result.won ? getStreakMultiplier(streak.current + 1) : 1;
                xpReward = Math.floor(xpReward * streakMultiplier);

                // Clutch bonus
                if (result.wasClutch && result.won) {
                    xpReward = Math.floor(xpReward * 1.5);
                }

                // Revenge bonus
                if (result.isRevenge && result.won) {
                    xpReward = Math.floor(xpReward * 1.25);
                    coinReward += 50;
                }

                const battleResult: BattleResult = {
                    ...result,
                    id: `battle_${Date.now()}`,
                    date: new Date(),
                    rewards: {
                        xp: xpReward,
                        coins: coinReward,
                        streakBonus: result.won ? streakMultiplier : undefined,
                    },
                };

                // Update streak
                let newStreak = streak;
                if (result.won) {
                    const newCurrent = streak.current + 1;
                    newStreak = {
                        current: newCurrent,
                        best: Math.max(streak.best, newCurrent),
                        multiplier: getStreakMultiplier(newCurrent),
                        shieldActive: newCurrent >= 5 && !streak.shieldActive, // Earn shield at 5
                    };
                } else {
                    if (streak.shieldActive) {
                        // Use shield, keep streak
                        newStreak = { ...streak, shieldActive: false };
                    } else {
                        newStreak = { ...streak, current: 0, multiplier: 1.0 };
                    }
                }

                // Update stats
                const newStats = { ...state.stats };
                newStats.totalBattles += 1;
                if (result.won) {
                    newStats.totalWins += 1;
                    if (result.wasClutch) newStats.clutchWins += 1;
                    if (result.isRevenge) newStats.revengeWins += 1;
                } else {
                    newStats.totalLosses += 1;
                }
                newStats.winRate = (newStats.totalWins / newStats.totalBattles) * 100;
                newStats.longestStreak = Math.max(newStats.longestStreak, newStreak.best);
                newStats.coinsEarned += coinReward > 0 ? coinReward : 0;
                newStats.coinsLost += coinReward < 0 ? Math.abs(coinReward) : 0;
                newStats.xpEarned += xpReward > 0 ? xpReward : 0;

                set({
                    battleHistory: [battleResult, ...state.battleHistory.slice(0, 99)],
                    winStreak: newStreak,
                    stats: newStats,
                    status: 'results',
                    currentChallenge: null,
                    activeBattleSessionId: null,
                });

                return battleResult;
            },

            // Cancel outgoing challenge
            cancelChallenge: () => {
                set({
                    currentChallenge: null,
                    status: 'idle',
                });
            },

            // Use streak shield to protect from next loss
            useStreakShield: () => {
                const state = get();
                if (!state.winStreak.shieldActive) return false;
                // Shield is used automatically on loss
                return true;
            },

            // Update rivalry record
            updateRivalry: (opponentId, won, opponentName) => {
                set(state => {
                    const existing = state.rivalries.find(r => r.odlayerId === opponentId);

                    if (existing) {
                        const updated = {
                            ...existing,
                            wins: existing.wins + (won ? 1 : 0),
                            losses: existing.losses + (won ? 0 : 1),
                            lastBattle: new Date(),
                            isNemesis: !won && existing.losses >= 2,
                        };
                        return {
                            rivalries: state.rivalries.map(r =>
                                r.odlayerId === opponentId ? updated : r
                            ),
                        };
                    } else {
                        return {
                            rivalries: [...state.rivalries, {
                                odlayerId: opponentId,
                                playerName: opponentName,
                                wins: won ? 1 : 0,
                                losses: won ? 0 : 1,
                                lastBattle: new Date(),
                                isNemesis: false,
                            }],
                        };
                    }
                });
            },

            // Clear expired challenges
            clearExpiredChallenges: () => {
                const now = new Date();
                set(state => ({
                    incomingChallenges: state.incomingChallenges.filter(
                        c => new Date(c.expiresAt) > now
                    ),
                    currentChallenge: state.currentChallenge &&
                        new Date(state.currentChallenge.expiresAt) > now
                        ? state.currentChallenge
                        : null,
                    status: state.currentChallenge &&
                        new Date(state.currentChallenge.expiresAt) <= now
                        ? 'idle'
                        : state.status,
                }));
            },

            // Preferences
            setPreferredMode: (mode) => set({ preferredMode: mode }),
            toggleAutoAcceptFriends: () => set(s => ({ autoAcceptFriends: !s.autoAcceptFriends })),
            toggleShowOnMap: () => set(s => ({ showOnMap: !s.showOnMap })),
        }),
        {
            name: 'utopia-arena-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                battleHistory: state.battleHistory.slice(0, 50),
                winStreak: state.winStreak,
                rivalries: state.rivalries,
                stats: state.stats,
                preferredMode: state.preferredMode,
                autoAcceptFriends: state.autoAcceptFriends,
                showOnMap: state.showOnMap,
            }),
        }
    )
);

// ============================
// HELPER HOOKS
// ============================

export const getStreakInfo = (streak: number) => ({
    multiplier: getStreakMultiplier(streak),
    reward: getStreakReward(streak),
    nextMilestone: streak < 3 ? 3 : streak < 5 ? 5 : streak < 7 ? 7 : streak < 10 ? 10 : streak < 15 ? 15 : null,
});
