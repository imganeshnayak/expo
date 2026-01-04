import UtopianArchetype, { IUtopianArchetype } from '../../models/game/UtopianArchetype';
import crypto from 'crypto';

// Constants
const H3_RESOLUTION_DEG = 0.001; // Roughly 100m grid for simplified hex behavior
const SPAWN_SALT = process.env.SPAWN_SALT || 'UTOPIA_SECRET_GAME_SALT';
const RESET_INTERVAL_MS = 15 * 60 * 1000; // 15 Minutes
const SPAWN_CHANCE = 0.4; // 40% chance per hex per window

// Rarity Weights
const RARITY_PROBABILITIES = {
    Common: 0.55,
    Rare: 0.25,
    Epic: 0.12,
    Mythic: 0.06,
    Legendary: 0.02
};

export class SpawnService {

    // Get all active spawns around a user
    static async getSpawnsAround(lat: number, lng: number, radiusKm: number = 0.5) {
        // Generate grid points around user
        // Simple approximation: check lat/lng rounded buckets
        const gridPoints = this.getGridPointsInRadius(lat, lng, radiusKm);

        const spawns = [];

        // Fetch all archetypes once to pick from (caching recommended in prod)
        const allArchetypes = await UtopianArchetype.find({ isActive: true }).lean();

        for (const point of gridPoints) {
            const spawn = this.generateSpawnforGrid(point.latStr, point.lngStr, allArchetypes);
            if (spawn) {
                spawns.push(spawn);
            }
        }

        return spawns;
    }

    // Deterministic generation
    private static generateSpawnforGrid(latStr: string, lngStr: string, archetypes: any[]) {
        const timeWindow = Math.floor(Date.now() / RESET_INTERVAL_MS);
        const seed = `${latStr}:${lngStr}:${timeWindow}:${SPAWN_SALT}`;

        // Hash the seed to get random numbers
        const hash = crypto.createHash('sha256').update(seed).digest('hex');

        // Convert first 8 chars to float 0-1
        const spawnRoll = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

        if (spawnRoll > SPAWN_CHANCE) {
            return null; // No spawn here this window
        }

        // Determine Rarity
        const rarityRoll = parseInt(hash.substring(8, 16), 16) / 0xffffffff;
        let rarity = 'Common';
        let cumulative = 0;

        for (const [r, prob] of Object.entries(RARITY_PROBABILITIES)) {
            cumulative += prob;
            if (rarityRoll < cumulative) {
                rarity = r;
                break;
            }
        }

        // Pick Archetype of rarity
        const candidates = archetypes.filter(a => a.rarity === rarity);
        if (candidates.length === 0) return null; // Fallback

        // Pick specific archetype
        const pickRoll = parseInt(hash.substring(16, 24), 16) / 0xffffffff;
        const index = Math.floor(pickRoll * candidates.length);
        const selected = candidates[index];

        // Calculate precise location within the grid (offset)
        const latOffset = (parseInt(hash.substring(24, 28), 16) / 0xffff) * H3_RESOLUTION_DEG - (H3_RESOLUTION_DEG / 2);
        const lngOffset = (parseInt(hash.substring(28, 32), 16) / 0xffff) * H3_RESOLUTION_DEG - (H3_RESOLUTION_DEG / 2);

        return {
            id: hash.substring(0, 16), // Instance ID
            archetype: selected,
            location: {
                latitude: parseFloat(latStr) + latOffset,
                longitude: parseFloat(lngStr) + lngOffset
            },
            expiresAt: new Date((timeWindow + 1) * RESET_INTERVAL_MS)
        };
    }

    // Helper to get grid centers
    private static getGridPointsInRadius(lat: number, lng: number, radiusKm: number) {
        const points = [];
        const latStep = H3_RESOLUTION_DEG;
        const lngStep = H3_RESOLUTION_DEG;
        const steps = Math.ceil(radiusKm / 0.1); // approx 100m steps

        const centerLat = Math.round(lat / latStep) * latStep;
        const centerLng = Math.round(lng / lngStep) * lngStep;

        for (let x = -steps; x <= steps; x++) {
            for (let y = -steps; y <= steps; y++) {
                points.push({
                    latStr: (centerLat + (x * latStep)).toFixed(4),
                    lngStr: (centerLng + (y * lngStep)).toFixed(4)
                });
            }
        }
        return points;
    }
}
