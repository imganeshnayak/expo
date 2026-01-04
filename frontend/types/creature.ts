/**
 * Creature Types and Data Structures
 * Core definitions for the Oops creature battler system
 */

// Element types for creature battles
export type CreatureElement =
    | 'blaze'   // 🔥 Strong vs Nature, Weak vs Aqua
    | 'aqua'    // 💧 Strong vs Blaze, Weak vs Volt
    | 'volt'    // ⚡ Strong vs Aqua, Weak vs Earth
    | 'nature'  // 🌿 Strong vs Earth, Weak vs Blaze
    | 'earth'   // 🪨 Strong vs Volt, Weak vs Nature
    | 'shadow'  // 👻 Strong vs Shadow, Weak vs Light
    | 'light';  // ✨ Strong vs Shadow, Weak vs Shadow

// Rarity levels
export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Element effectiveness chart
export const ELEMENT_CHART: Record<CreatureElement, { strongVs: CreatureElement; weakVs: CreatureElement }> = {
    blaze: { strongVs: 'nature', weakVs: 'aqua' },
    aqua: { strongVs: 'blaze', weakVs: 'volt' },
    volt: { strongVs: 'aqua', weakVs: 'earth' },
    nature: { strongVs: 'earth', weakVs: 'blaze' },
    earth: { strongVs: 'volt', weakVs: 'nature' },
    shadow: { strongVs: 'shadow', weakVs: 'light' },
    light: { strongVs: 'shadow', weakVs: 'shadow' },
};

// Rarity stats multipliers
export const RARITY_MULTIPLIERS: Record<CreatureRarity, number> = {
    common: 1.0,
    uncommon: 1.5,
    rare: 2.0,
    epic: 3.0,
    legendary: 5.0,
};

// Rarity spawn chances (percentages)
export const RARITY_SPAWN_RATES: Record<CreatureRarity, number> = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
};

// Base creature stats
export interface CreatureStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
}

// Creature ability
export interface CreatureAbility {
    id: string;
    name: string;
    description: string;
    type: 'basic' | 'special' | 'ultimate';
    damage: number;
    cooldown: number; // seconds
    energyCost: number;
    element?: CreatureElement;
}

// Creature definition (template)
export interface CreatureTemplate {
    id: string;
    name: string;
    element: CreatureElement;
    rarity: CreatureRarity;
    description: string;
    baseStats: CreatureStats;
    abilities: CreatureAbility[];
    evolutionId?: string; // ID of evolved form
    evolutionLevel?: number; // Level required to evolve
    sprite: string; // Asset path or emoji
    model3d?: string; // Unity asset path
}

// Owned creature instance
export interface OwnedCreature {
    instanceId: string;
    templateId: string;
    nickname?: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    currentStats: CreatureStats;
    caughtAt: Date;
    caughtLocation?: { lat: number; lng: number };
    isFavorite: boolean;
    isInTeam: boolean;
    teamSlot?: number; // 1, 2, or 3
}

// Battle team
export interface BattleTeam {
    slot1: OwnedCreature | null;
    slot2: OwnedCreature | null;
    slot3: OwnedCreature | null;
}

// Calculate damage with type effectiveness
export function calculateTypeDamage(
    attackerElement: CreatureElement,
    defenderElement: CreatureElement,
    baseDamage: number
): { damage: number; effectiveness: 'super' | 'normal' | 'weak' } {
    const chart = ELEMENT_CHART[attackerElement];

    if (chart.strongVs === defenderElement) {
        return { damage: Math.floor(baseDamage * 1.5), effectiveness: 'super' };
    } else if (chart.weakVs === defenderElement) {
        return { damage: Math.floor(baseDamage * 0.5), effectiveness: 'weak' };
    }

    return { damage: baseDamage, effectiveness: 'normal' };
}

// Calculate XP needed for level
export function xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Calculate stats at level
export function statsAtLevel(
    baseStats: CreatureStats,
    level: number,
    rarity: CreatureRarity
): CreatureStats {
    const multiplier = RARITY_MULTIPLIERS[rarity];
    const levelBonus = 1 + (level - 1) * 0.1;

    return {
        hp: Math.floor(baseStats.hp * multiplier * levelBonus),
        attack: Math.floor(baseStats.attack * multiplier * levelBonus),
        defense: Math.floor(baseStats.defense * multiplier * levelBonus),
        speed: Math.floor(baseStats.speed * multiplier * levelBonus),
        energy: baseStats.energy, // Energy doesn't scale
    };
}
