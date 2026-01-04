import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useArenaStore } from '@/store/arenaStore';

const UTOPIA_ARENA_ANDROID_PACKAGE = 'com.oops.game';
const UTOPIA_ARENA_IOS_SCHEME = 'oops://';
const UTOPIA_ARENA_UNIVERSAL_LINK = 'https://oops.app/game';

// Battle session types
export interface BattleSession {
    sessionId: string;
    challengeId: string;
    mode: '1v1' | '2v2' | 'koth' | 'collect';
    players: {
        id: string;
        username: string;
        team: number;
    }[];
    stake: {
        type: string;
        amount: number;
    };
    authToken: string;
    timestamp: number;
}

export interface BattleResult {
    sessionId: string;
    challengeId: string;
    won: boolean;
    myScore: number;
    opponentScore: number;
    duration: number;
    wasClutch: boolean;
    isRevenge: boolean;
    rewardsEarned: {
        xp: number;
        coins: number;
        items?: string[];
    };
}

/**
 * Utopia Arena Service
 * Handles communication between Expo app and Unity Utopia Arena for real PvP battles
 */
class UtopiaArenaService {
    private pendingSession: BattleSession | null = null;

    /**
     * Creates a battle session and launches Utopia Arena Unity app
     */
    async launchBattle(session: BattleSession): Promise<boolean> {
        this.pendingSession = session;

        // Build the deep link URL with battle parameters
        const params = new URLSearchParams({
            sessionId: session.sessionId,
            challengeId: session.challengeId,
            mode: session.mode,
            players: JSON.stringify(session.players),
            stake: JSON.stringify(session.stake),
            authToken: session.authToken,
            callback: 'utopia://battle-result',
        });

        const arenaUrl = Platform.select({
            android: `intent://battle?${params.toString()}#Intent;scheme=oops;package=${UTOPIA_ARENA_ANDROID_PACKAGE};end`,
            ios: `${UTOPIA_ARENA_IOS_SCHEME}battle?${params.toString()}`,
            default: `${UTOPIA_ARENA_UNIVERSAL_LINK}/battle?${params.toString()}`,
        });

        try {
            // Check if Utopia Arena is installed
            const canOpen = await Linking.canOpenURL(arenaUrl);

            if (canOpen) {
                await Linking.openURL(arenaUrl);
                return true;
            } else {
                // Utopia Arena not installed, use fallback
                console.log('Utopia Arena not installed, using fallback');
                return this.handleFallback(session);
            }
        } catch (error) {
            console.error('Failed to launch Utopia Arena:', error);
            return false;
        }
    }

    /**
     * Fallback when Utopia Arena app is not installed
     */
    private async handleFallback(session: BattleSession): Promise<boolean> {
        // Use in-app battle for fallback
        return false;
    }

    /**
     * Parses deep link result from Utopia Arena
     */
    parseBattleResult(url: string): BattleResult | null {
        try {
            const parsed = new URL(url);
            const params = parsed.searchParams;

            if (parsed.protocol !== 'utopia:' || parsed.host !== 'battle-result') {
                return null;
            }

            return {
                sessionId: params.get('sessionId') || '',
                challengeId: params.get('challengeId') || '',
                won: params.get('won') === 'true',
                myScore: parseInt(params.get('myScore') || '0', 10),
                opponentScore: parseInt(params.get('opponentScore') || '0', 10),
                duration: parseInt(params.get('duration') || '0', 10),
                wasClutch: params.get('wasClutch') === 'true',
                isRevenge: params.get('isRevenge') === 'true',
                rewardsEarned: JSON.parse(params.get('rewards') || '{"xp":0,"coins":0}'),
            };
        } catch (error) {
            console.error('Failed to parse battle result:', error);
            return null;
        }
    }

    /**
     * Generate a unique session ID for the battle
     */
    generateSessionId(): string {
        return `arena_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate mock auth token (in production, this would be a real JWT)
     */
    generateAuthToken(userId: string): string {
        const mockToken = btoa(JSON.stringify({
            userId,
            exp: Date.now() + 3600000,
            iat: Date.now(),
        }));
        return `arena_${mockToken}`;
    }

    /**
     * Get the pending session
     */
    getPendingSession(): BattleSession | null {
        return this.pendingSession;
    }

    /**
     * Clear pending session after result is processed
     */
    clearPendingSession(): void {
        this.pendingSession = null;
    }

    /**
     * Check if Utopia Arena app is installed
     */
    async isArenaInstalled(): Promise<boolean> {
        const scheme = Platform.select({
            android: `intent://test#Intent;scheme=utopiaarena;package=${UTOPIA_ARENA_ANDROID_PACKAGE};end`,
            ios: UTOPIA_ARENA_IOS_SCHEME,
            default: '',
        });

        if (!scheme) return false;

        try {
            return await Linking.canOpenURL(scheme);
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const utopiaArenaService = new UtopiaArenaService();

// Legacy export for backward compatibility
export const bossRoomService = utopiaArenaService;

/**
 * Hook for handling deep link battle results
 */
export function useBattleResultHandler() {
    const { endBattle } = useArenaStore();

    const handleBattleResult = (url: string) => {
        const result = utopiaArenaService.parseBattleResult(url);

        if (!result) {
            console.warn('Invalid battle result URL:', url);
            return null;
        }

        const pendingSession = utopiaArenaService.getPendingSession();

        if (pendingSession && pendingSession.sessionId !== result.sessionId) {
            console.warn('Session ID mismatch');
            return null;
        }

        // Process the battle result
        const battleResult = endBattle({
            mode: pendingSession?.mode || '1v1',
            opponent: pendingSession?.players.find(p => p.team !== 1) || {
                id: 'unknown',
                username: 'Opponent',
                avatar: '👤',
                level: 1,
            },
            won: result.won,
            myScore: result.myScore,
            opponentScore: result.opponentScore,
            duration: result.duration,
            stake: pendingSession?.stake || { type: 'pride', amount: 0 },
            wasClutch: result.wasClutch,
            isRevenge: result.isRevenge,
        });

        utopiaArenaService.clearPendingSession();

        return battleResult;
    };

    return { handleBattleResult };
}
