export interface UtopianArchetype {
    _id: string;
    name: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';
    baseStats: {
        power: number;
        charm: number;
        chaos: number;
    };
    visuals: {
        spriteUrl: string;
        color: string;
        icon: string;
    };
    lore: {
        backstory: string;
        personality: string;
    };
}

export interface UserCollection {
    _id: string;
    userId: string;
    archetypeId: UtopianArchetype;
    nickname?: string;
    level: number;
    xp: number;
    iv: {
        power: number;
        charm: number;
        chaos: number;
    };
    stats: {
        power: number;
        charm: number;
        chaos: number;
    };
    isShiny: boolean;
    locationCaught: {
        latitude: number;
        longitude: number;
    };
    capturedAt: string;
    isFavorite: boolean;
}

export interface Spawn {
    id: string; // Instance ID
    archetype: UtopianArchetype;
    location: {
        latitude: number;
        longitude: number;
    };
    expiresAt: string;
}
