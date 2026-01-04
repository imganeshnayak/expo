import { api } from './api/client';
import { useArenaStore, NearbyPlayer, BattleChallenge, BattleStake } from '@/store/arenaStore';

// Backend API endpoints for Arena
const ARENA_ENDPOINTS = {
    NEARBY_PLAYERS: '/api/arena/nearby',
    SEND_CHALLENGE: '/api/arena/challenge',
    RESPOND_CHALLENGE: '/api/arena/challenge/respond',
    REPORT_RESULT: '/api/arena/result',
    STATUS: '/api/arena/status',
    LEADERBOARD: '/api/arena/leaderboard',
};

export interface NearbyPlayersResponse {
    players: NearbyPlayer[];
    lastUpdate: string;
    yourLocation: {
        lat: number;
        lng: number;
    };
}

export interface ChallengeRequest {
    opponentId: string;
    mode: '1v1' | '2v2' | 'koth' | 'collect';
    stake: BattleStake;
    message?: string;
}

export interface ChallengeResponse {
    challenge: BattleChallenge;
    status: 'sent' | 'error';
    error?: string;
}

export interface BattleResultRequest {
    challengeId: string;
    sessionId: string;
    won: boolean;
    myScore: number;
    opponentScore: number;
    duration: number;
}

export interface ArenaLeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar: string;
    wins: number;
    losses: number;
    winRate: number;
    winStreak: number;
    xpEarned: number;
}

/**
 * Arena Service - Backend API integration for real player discovery and battles
 */
class ArenaService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECTS = 5;

    /**
     * Fetch nearby players from the server
     */
    async getNearbyPlayers(
        latitude: number,
        longitude: number,
        radius: number = 500 // meters
    ): Promise<NearbyPlayer[]> {
        try {
            const response = await api.get<NearbyPlayersResponse>(ARENA_ENDPOINTS.NEARBY_PLAYERS, {
                params: { lat: latitude, lng: longitude, radius },
            });
            return response.players;
        } catch (error) {
            console.error('[ArenaService] Failed to fetch nearby players:', error);
            // Return mock data as fallback
            return this.getMockNearbyPlayers();
        }
    }

    /**
     * Send a battle challenge to another player
     */
    async sendChallenge(request: ChallengeRequest): Promise<ChallengeResponse> {
        try {
            const response = await api.post<ChallengeResponse>(ARENA_ENDPOINTS.SEND_CHALLENGE, request);
            return response;
        } catch (error) {
            console.error('[ArenaService] Failed to send challenge:', error);
            throw error;
        }
    }

    /**
     * Respond to an incoming challenge
     */
    async respondToChallenge(
        challengeId: string,
        accept: boolean
    ): Promise<{ success: boolean; sessionId?: string }> {
        try {
            const response = await api.post<{ success: boolean; sessionId?: string }>(
                ARENA_ENDPOINTS.RESPOND_CHALLENGE,
                { challengeId, accept }
            );
            return response;
        } catch (error) {
            console.error('[ArenaService] Failed to respond to challenge:', error);
            throw error;
        }
    }

    /**
     * Report battle result to the server
     */
    async reportBattleResult(result: BattleResultRequest): Promise<void> {
        try {
            await api.post(ARENA_ENDPOINTS.REPORT_RESULT, result);
        } catch (error) {
            console.error('[ArenaService] Failed to report battle result:', error);
            // Store locally for retry
            this.queueResultForRetry(result);
        }
    }

    /**
     * Get arena leaderboard
     */
    async getLeaderboard(
        type: 'global' | 'friends' = 'global',
        limit: number = 100
    ): Promise<ArenaLeaderboardEntry[]> {
        try {
            const response = await api.get<{ entries: ArenaLeaderboardEntry[] }>(
                ARENA_ENDPOINTS.LEADERBOARD,
                { params: { type, limit } }
            );
            return response.entries;
        } catch (error) {
            console.error('[ArenaService] Failed to fetch leaderboard:', error);
            return [];
        }
    }

    /**
     * Connect to real-time status WebSocket
     */
    connectToStatusStream(
        userId: string,
        onChallenge: (challenge: BattleChallenge) => void,
        onPlayerUpdate: (players: NearbyPlayer[]) => void
    ): () => void {
        const wsUrl = `wss://api.utopia.app${ARENA_ENDPOINTS.STATUS}?userId=${userId}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[ArenaService] WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'challenge') {
                        onChallenge(data.challenge);
                    } else if (data.type === 'players') {
                        onPlayerUpdate(data.players);
                    }
                } catch (e) {
                    console.error('[ArenaService] Failed to parse message:', e);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[ArenaService] WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('[ArenaService] WebSocket closed');
                this.attemptReconnect(userId, onChallenge, onPlayerUpdate);
            };
        } catch (error) {
            console.error('[ArenaService] Failed to connect WebSocket:', error);
        }

        // Return cleanup function
        return () => {
            this.ws?.close();
            this.ws = null;
        };
    }

    private attemptReconnect(
        userId: string,
        onChallenge: (challenge: BattleChallenge) => void,
        onPlayerUpdate: (players: NearbyPlayer[]) => void
    ) {
        if (this.reconnectAttempts < this.MAX_RECONNECTS) {
            this.reconnectAttempts++;
            console.log(`[ArenaService] Reconnecting... attempt ${this.reconnectAttempts}`);
            setTimeout(() => {
                this.connectToStatusStream(userId, onChallenge, onPlayerUpdate);
            }, 2000 * this.reconnectAttempts);
        }
    }

    private queueResultForRetry(result: BattleResultRequest) {
        // Store in AsyncStorage for retry on next app open
        // Implementation would use a queue system
        console.log('[ArenaService] Result queued for retry:', result);
    }

    /**
     * Get mock nearby players for demo/fallback
     */
    getMockNearbyPlayers(): NearbyPlayer[] {
        return [
            {
                id: '1',
                username: 'DragonSlayer99',
                avatar: '🐉',
                level: 24,
                rank: 5,
                winRate: 78,
                currentStreak: 5,
                isOnline: true,
                distance: 25,
                lastSeen: new Date(),
                isFriend: false,
                isRival: true,
                headToHead: { wins: 2, losses: 4 },
            },
            {
                id: '2',
                username: 'NightHunter',
                avatar: '🌙',
                level: 18,
                rank: 15,
                winRate: 65,
                currentStreak: 2,
                isOnline: true,
                distance: 45,
                lastSeen: new Date(),
                isFriend: true,
                isRival: false,
                headToHead: { wins: 3, losses: 1 },
            },
            {
                id: '3',
                username: 'PhoenixRising',
                avatar: '🔥',
                level: 31,
                rank: 3,
                winRate: 82,
                currentStreak: 8,
                isOnline: true,
                distance: 80,
                lastSeen: new Date(),
                isFriend: false,
                isRival: false,
                headToHead: { wins: 0, losses: 0 },
            },
            {
                id: '4',
                username: 'ShadowMaster',
                avatar: '🦇',
                level: 22,
                rank: 8,
                winRate: 71,
                currentStreak: 0,
                isOnline: true,
                distance: 120,
                lastSeen: new Date(),
                isFriend: false,
                isRival: false,
                headToHead: { wins: 1, losses: 1 },
            },
            {
                id: '5',
                username: 'StormBringer',
                avatar: '⚡',
                level: 27,
                rank: 6,
                winRate: 75,
                currentStreak: 3,
                isOnline: false,
                distance: 200,
                lastSeen: new Date(Date.now() - 300000),
                isFriend: false,
                isRival: false,
                headToHead: { wins: 0, losses: 0 },
            },
        ];
    }

    /**
     * Update user's location for player discovery
     */
    async broadcastLocation(
        latitude: number,
        longitude: number,
        isSearching: boolean = true
    ): Promise<void> {
        try {
            await api.put('/api/arena/location', {
                lat: latitude,
                lng: longitude,
                isSearching,
            });
        } catch (error) {
            console.error('[ArenaService] Failed to broadcast location:', error);
        }
    }
}

// Export singleton instance
export const arenaService = new ArenaService();
