import { api as apiClient } from './api/client';
import { Spawn, UserCollection } from '../types/game';

interface StandardResponse<T> {
    data: T;
    message?: string;
}

// Cast as any[[]] for development - these are just demo items
const MOCK_COLLECTION = [
    {
        _id: 'mock1',
        archetypeId: {
            _id: 'arch1',
            name: 'Glimmer Fox',
            rarity: 'Common',
            visuals: { spriteUrl: 'https://via.placeholder.com/60/4CAF50/fff?text=🦊' },
        },
        stats: { power: 45, charm: 30, chaos: 20 },
        isShiny: false,
        level: 3,
        nickname: undefined,
    },
    {
        _id: 'mock2',
        archetypeId: {
            _id: 'arch2',
            name: 'Shadow Raven',
            rarity: 'Rare',
            visuals: { spriteUrl: 'https://via.placeholder.com/60/2196F3/fff?text=🐦' },
        },
        stats: { power: 78, charm: 45, chaos: 35 },
        isShiny: false,
        level: 5,
        nickname: 'Midnight',
    },
    {
        _id: 'mock3',
        archetypeId: {
            _id: 'arch3',
            name: 'Phoenix Flame',
            rarity: 'Epic',
            visuals: { spriteUrl: 'https://via.placeholder.com/60/9C27B0/fff?text=🔥' },
        },
        stats: { power: 125, charm: 80, chaos: 60 },
        isShiny: true,
        level: 8,
        nickname: undefined,
    },
    {
        _id: 'mock4',
        archetypeId: {
            _id: 'arch4',
            name: 'Storm Dragon',
            rarity: 'Legendary',
            visuals: { spriteUrl: 'https://via.placeholder.com/60/FFD700/000?text=🐉' },
        },
        stats: { power: 250, charm: 120, chaos: 100 },
        isShiny: false,
        level: 12,
        nickname: 'Thunder',
    },
    {
        _id: 'mock5',
        archetypeId: {
            _id: 'arch5',
            name: 'Forest Spirit',
            rarity: 'Common',
            visuals: { spriteUrl: 'https://via.placeholder.com/60/4CAF50/fff?text=🌿' },
        },
        stats: { power: 35, charm: 20, chaos: 15 },
        isShiny: false,
        level: 2,
        nickname: undefined,
    },
] as UserCollection[];

const MOCK_SPAWNS: Spawn[] = [
    {
        _id: 'spawn1',
        archetypeId: {
            _id: 'arch1',
            name: 'Glimmer Fox',
            rarity: 'Common',
            visuals: { spriteUrl: '', markerUrl: '' },
        },
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        expiresAt: new Date(Date.now() + 3600000),
    } as any,
];

export const gameService = {
    getSpawns: async (latitude: number, longitude: number): Promise<Spawn[]> => {
        try {
            const response = await apiClient.get<StandardResponse<Spawn[]>>('/api/game/spawns', { latitude, longitude }, true);
            return response.data?.data || [];
        } catch (error) {
            console.log('[gameService] API unavailable, using mock spawns');
            return MOCK_SPAWNS;
        }
    },

    catchUtopian: async (
        instanceId: string,
        archetypeId: string,
        location: { latitude: number; longitude: number }
    ): Promise<{ success: boolean; data?: UserCollection; message?: string }> => {
        try {
            const response = await apiClient.post<StandardResponse<UserCollection>>('/api/game/catch', {
                instanceId,
                archetypeId,
                location
            }, true);

            if (response.error) {
                throw new Error(response.error);
            }

            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message
            };
        } catch (error: any) {
            console.error('Error catching utopian:', error);
            return {
                success: false,
                message: error.message || 'Failed to catch'
            };
        }
    },

    getMyCollection: async (): Promise<UserCollection[]> => {
        try {
            const response = await apiClient.get<StandardResponse<UserCollection[]>>('/api/game/collection', {}, true);
            const data = response.data?.data;

            // Return mock data if empty or undefined
            if (!data || data.length === 0) {
                console.log('[gameService] Empty collection, using mock data');
                return MOCK_COLLECTION;
            }

            return data;
        } catch (error) {
            console.log('[gameService] API unavailable, using mock collection');
            return MOCK_COLLECTION;
        }
    }
};
