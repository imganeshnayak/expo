/**
 * GameStore Unit Tests
 * Testing Zustand store directly without React hooks testing library
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// Import after mocking
import { useGameStore } from '../../store/gameStore';

describe('GameStore', () => {
    beforeEach(() => {
        // Reset store state between tests
        useGameStore.setState({
            streak: {
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: null,
                streakProtectionUsed: false,
            },
            dailyRewards: [
                { day: 1, xp: 50, claimed: false },
                { day: 2, xp: 75, claimed: false },
                { day: 3, xp: 100, bonus: 'Rare Spawn Ticket', claimed: false },
                { day: 4, xp: 125, claimed: false },
                { day: 5, xp: 150, claimed: false },
                { day: 6, xp: 200, bonus: 'Epic Loot Chance', claimed: false },
                { day: 7, xp: 500, bonus: '🎉 Legendary Bonus!', claimed: false },
            ],
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
        });
    });

    describe('Streak System', () => {
        it('should start with no streak', () => {
            const state = useGameStore.getState();
            expect(state.streak.currentStreak).toBe(0);
        });

        it('should initialize streak to 1 on first login', () => {
            useGameStore.getState().checkAndUpdateStreak();
            const state = useGameStore.getState();
            expect(state.streak.currentStreak).toBe(1);
            expect(state.streak.lastLoginDate).toBeTruthy();
        });

        it('should not change streak if already logged in today', () => {
            const today = new Date().toISOString().split('T')[0];
            useGameStore.setState({
                streak: {
                    currentStreak: 5,
                    longestStreak: 5,
                    lastLoginDate: today,
                    streakProtectionUsed: false,
                },
            });

            useGameStore.getState().checkAndUpdateStreak();
            const state = useGameStore.getState();
            expect(state.streak.currentStreak).toBe(5);
        });
    });

    describe('XP Multiplier', () => {
        it('should return 1.0 for streak < 3', () => {
            const multiplier = useGameStore.getState().getXPMultiplier();
            expect(multiplier).toBe(1.0);
        });

        it('should return correct multiplier from state', () => {
            useGameStore.setState({ xpMultiplier: 1.3 });
            const multiplier = useGameStore.getState().getXPMultiplier();
            expect(multiplier).toBe(1.3);
        });
    });

    describe('Daily Battles', () => {
        it('should start with 5 battles', () => {
            const state = useGameStore.getState();
            expect(state.dailyBattlesRemaining).toBe(5);
        });

        it('should decrement battles on use', () => {
            useGameStore.getState().useBattle();
            const state = useGameStore.getState();
            expect(state.dailyBattlesRemaining).toBe(4);
        });

        it('should return false when no battles remaining', () => {
            useGameStore.setState({ dailyBattlesRemaining: 0 });
            const battleUsed = useGameStore.getState().useBattle();
            expect(battleUsed).toBe(false);
            expect(useGameStore.getState().dailyBattlesRemaining).toBe(0);
        });

        it('should reset battles to 5', () => {
            useGameStore.setState({ dailyBattlesRemaining: 0 });
            useGameStore.getState().resetDailyBattles();
            expect(useGameStore.getState().dailyBattlesRemaining).toBe(5);
        });
    });

    describe('Daily Rewards', () => {
        it('should not claim reward for day > current streak', () => {
            const claimed = useGameStore.getState().claimDailyReward(5);
            expect(claimed).toBe(false);
        });

        it('should claim reward for valid day', () => {
            useGameStore.setState({
                streak: { currentStreak: 3, longestStreak: 3, lastLoginDate: null, streakProtectionUsed: false },
            });
            const claimed = useGameStore.getState().claimDailyReward(2);
            expect(claimed).toBe(true);

            const reward = useGameStore.getState().dailyRewards.find((r: { day: number }) => r.day === 2);
            expect(reward?.claimed).toBe(true);
        });

        it('should not claim already claimed reward', () => {
            useGameStore.setState({
                streak: { currentStreak: 3, longestStreak: 3, lastLoginDate: null, streakProtectionUsed: false },
                dailyRewards: [
                    { day: 1, xp: 50, claimed: true },
                    { day: 2, xp: 75, claimed: false },
                ],
            });
            const claimed = useGameStore.getState().claimDailyReward(1);
            expect(claimed).toBe(false);
        });
    });

    describe('Stats Tracking', () => {
        it('should increment catches', () => {
            useGameStore.getState().incrementCatches();
            useGameStore.getState().incrementCatches();
            expect(useGameStore.getState().totalUtopiansCaught).toBe(2);
        });

        it('should increment battle wins', () => {
            useGameStore.getState().incrementBattleWins();
            expect(useGameStore.getState().totalBattlesWon).toBe(1);
        });
    });
});
