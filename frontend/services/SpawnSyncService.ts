import { Spawn } from '../types/game';
import { gameService } from './gameService';

// H3 Resolution 9 is approx 170m edge length
const HEX_RESOLUTION = 9;
const SPAWN_WINDOW_MS = 15000; // 15 seconds

interface LocalSpawn extends Spawn {
    despawnAt: number; // Unix timestamp ms
    isShiny?: boolean; // Optional property
}

class SpawnSyncService {
    private cache: Map<string, LocalSpawn> = new Map();
    private salt: string = 'utopia_secret_salt';

    public initialize(salt: string) {
        this.salt = salt;
    }

    // Deterministic Pseudo-Random Number Generator
    private seededRandom(seed: string): number {
        let h = 0x811c9dc5;
        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return ((h >>> 0) / 4294967296);
    }

    public async getVisibleSpawns(lat: number, lng: number): Promise<LocalSpawn[]> {
        // 1. Calculate Time Window
        const now = Date.now();
        const currentWindow = Math.floor(now / SPAWN_WINDOW_MS);
        const despawnTime = (currentWindow + 1) * SPAWN_WINDOW_MS;

        // 2. Poll Server for Authoritative Spawns (with fallback)
        try {
            const remoteSpawns = await gameService.getSpawns(lat, lng);

            // Merging logic: Add new, Remove old
            // Ideally server returns proper 'despawnAt'
            // We augment them here for client-side smoothing
            const processed = remoteSpawns.map(s => ({
                ...s,
                despawnAt: despawnTime
            }));

            return processed;

        } catch (error) {
            console.log("Offline Spawn Fallback");
            // 3. Fallback: Deterministic Generation (Offline Mode)
            // Ideally we use h3-js here, but it's a heavy native dep.
            // Simplified: Grid based on lat/lng rounding
            return this.generateDeterministicSpawns(lat, lng, currentWindow, despawnTime);
        }
    }

    private generateDeterministicSpawns(lat: number, lng: number, window: number, despawnAt: number): LocalSpawn[] {
        const spawns: LocalSpawn[] = [];

        // Simple Grid Logic (0.001 degree ~ 111m)
        const GRID_SIZE = 0.0015;
        const latBase = Math.floor(lat / GRID_SIZE);
        const lngBase = Math.floor(lng / GRID_SIZE);

        // Check 3x3 grid around user
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const hLat = latBase + dx;
                const hLng = lngBase + dy;
                const seed = `${hLat},${hLng},${window},${this.salt}`;
                const rng = this.seededRandom(seed);

                if (rng > 0.7) { // 30% chance of spawn per cell
                    spawns.push({
                        id: `offline_${hLat}_${hLng}_${window}`,
                        location: {
                            latitude: (hLat * GRID_SIZE) + (GRID_SIZE * 0.5), // Center of cell
                            longitude: (hLng * GRID_SIZE) + (GRID_SIZE * 0.5)
                        },
                        archetype: this.getMockArchetype(rng),
                        isShiny: rng > 0.98,
                        despawnAt: despawnAt,
                        expiresAt: new Date(despawnAt).toISOString()
                    });
                }
            }
        }
        return spawns;
    }

    private getMockArchetype(rng: number) {
        // Simplified archetype picker
        const baseMock = {
            _id: 'mock_id',
            baseStats: { power: 10, charm: 10, chaos: 10 },
            lore: { backstory: 'A glitch in the simulation.', personality: 'Glitchy' },
            spawnConditions: { timeOfDay: 'Any' as const }
        };

        if (rng > 0.95) return { ...baseMock, name: 'Glitch', rarity: 'Legendary', visuals: { spriteUrl: 'https://via.placeholder.com/64/FFD700' } } as any;
        if (rng > 0.90) return { ...baseMock, name: 'Firewall', rarity: 'Mythic', visuals: { spriteUrl: 'https://via.placeholder.com/64/F44336' } } as any;
        return { ...baseMock, name: 'Bytey', rarity: 'Common', visuals: { spriteUrl: 'https://via.placeholder.com/64/4CAF50' } } as any;
    }
}

export const spawnSyncService = new SpawnSyncService();
