/**
 * Starter Creature Roster
 * Initial creatures available in Oops
 */

import { CreatureTemplate } from '@/types/creature';

export const CREATURE_ROSTER: CreatureTemplate[] = [
    // 🔥 BLAZE CREATURES
    {
        id: 'ember_pup',
        name: 'Ember Pup',
        element: 'blaze',
        rarity: 'common',
        description: 'A playful fire spirit that loves to chase its own tail of flames.',
        baseStats: { hp: 45, attack: 12, defense: 8, speed: 10, energy: 100 },
        abilities: [
            { id: 'spark_bite', name: 'Spark Bite', description: 'A fiery nibble', type: 'basic', damage: 15, cooldown: 0, energyCost: 0 },
            { id: 'flame_burst', name: 'Flame Burst', description: 'Erupts in flames', type: 'special', damage: 30, cooldown: 5, energyCost: 25, element: 'blaze' },
            { id: 'inferno_howl', name: 'Inferno Howl', description: 'Devastating fire attack', type: 'ultimate', damage: 60, cooldown: 15, energyCost: 50, element: 'blaze' },
        ],
        evolutionId: 'blaze_hound',
        evolutionLevel: 15,
        sprite: '🔥🐕',
    },
    {
        id: 'blaze_hound',
        name: 'Blaze Hound',
        element: 'blaze',
        rarity: 'rare',
        description: 'A majestic fire wolf that guards volcanic regions.',
        baseStats: { hp: 85, attack: 22, defense: 15, speed: 18, energy: 100 },
        abilities: [
            { id: 'fire_fang', name: 'Fire Fang', description: 'Burning bite attack', type: 'basic', damage: 22, cooldown: 0, energyCost: 0 },
            { id: 'lava_rush', name: 'Lava Rush', description: 'Charges with molten fury', type: 'special', damage: 45, cooldown: 6, energyCost: 30, element: 'blaze' },
            { id: 'volcano_blast', name: 'Volcano Blast', description: 'Eruption of pure fire', type: 'ultimate', damage: 90, cooldown: 18, energyCost: 60, element: 'blaze' },
        ],
        sprite: '🔥🐺',
    },

    // 💧 AQUA CREATURES
    {
        id: 'bubble_fish',
        name: 'Bubble Fish',
        element: 'aqua',
        rarity: 'common',
        description: 'A cheerful fish that blows magical bubbles.',
        baseStats: { hp: 40, attack: 10, defense: 10, speed: 12, energy: 100 },
        abilities: [
            { id: 'splash', name: 'Splash', description: 'A wet slap', type: 'basic', damage: 12, cooldown: 0, energyCost: 0 },
            { id: 'water_jet', name: 'Water Jet', description: 'High pressure spray', type: 'special', damage: 28, cooldown: 5, energyCost: 25, element: 'aqua' },
            { id: 'tsunami_wave', name: 'Tsunami Wave', description: 'Massive water attack', type: 'ultimate', damage: 55, cooldown: 15, energyCost: 50, element: 'aqua' },
        ],
        evolutionId: 'tide_serpent',
        evolutionLevel: 15,
        sprite: '💧🐟',
    },
    {
        id: 'tide_serpent',
        name: 'Tide Serpent',
        element: 'aqua',
        rarity: 'rare',
        description: 'A powerful sea dragon that commands the tides.',
        baseStats: { hp: 80, attack: 20, defense: 18, speed: 16, energy: 100 },
        abilities: [
            { id: 'aqua_strike', name: 'Aqua Strike', description: 'Swift water attack', type: 'basic', damage: 20, cooldown: 0, energyCost: 0 },
            { id: 'whirlpool', name: 'Whirlpool', description: 'Traps enemy in vortex', type: 'special', damage: 42, cooldown: 6, energyCost: 30, element: 'aqua' },
            { id: 'ocean_fury', name: 'Ocean Fury', description: 'Wrath of the sea', type: 'ultimate', damage: 85, cooldown: 18, energyCost: 60, element: 'aqua' },
        ],
        sprite: '💧🐉',
    },

    // ⚡ VOLT CREATURES
    {
        id: 'spark_mouse',
        name: 'Spark Mouse',
        element: 'volt',
        rarity: 'common',
        description: 'A tiny mouse that generates static electricity.',
        baseStats: { hp: 35, attack: 14, defense: 6, speed: 15, energy: 100 },
        abilities: [
            { id: 'zap', name: 'Zap', description: 'Quick electric shock', type: 'basic', damage: 14, cooldown: 0, energyCost: 0 },
            { id: 'thunder_bolt', name: 'Thunder Bolt', description: 'Lightning strike', type: 'special', damage: 32, cooldown: 5, energyCost: 25, element: 'volt' },
            { id: 'storm_surge', name: 'Storm Surge', description: 'Electric tempest', type: 'ultimate', damage: 58, cooldown: 15, energyCost: 50, element: 'volt' },
        ],
        evolutionId: 'thunder_fox',
        evolutionLevel: 15,
        sprite: '⚡🐭',
    },

    // 🌿 NATURE CREATURES
    {
        id: 'leaf_sprite',
        name: 'Leaf Sprite',
        element: 'nature',
        rarity: 'common',
        description: 'A forest spirit born from fallen leaves.',
        baseStats: { hp: 50, attack: 8, defense: 12, speed: 8, energy: 100 },
        abilities: [
            { id: 'vine_whip', name: 'Vine Whip', description: 'Lashes with vines', type: 'basic', damage: 12, cooldown: 0, energyCost: 0 },
            { id: 'thorn_burst', name: 'Thorn Burst', description: 'Explosive thorns', type: 'special', damage: 26, cooldown: 5, energyCost: 25, element: 'nature' },
            { id: 'forest_wrath', name: 'Forest Wrath', description: 'Nature\'s revenge', type: 'ultimate', damage: 52, cooldown: 15, energyCost: 50, element: 'nature' },
        ],
        evolutionId: 'ancient_treant',
        evolutionLevel: 20,
        sprite: '🌿🧚',
    },

    // 🪨 EARTH CREATURES
    {
        id: 'rock_crab',
        name: 'Rock Crab',
        element: 'earth',
        rarity: 'common',
        description: 'A crab with a shell made of solid stone.',
        baseStats: { hp: 55, attack: 10, defense: 15, speed: 5, energy: 100 },
        abilities: [
            { id: 'rock_punch', name: 'Rock Punch', description: 'Stone-hard strike', type: 'basic', damage: 14, cooldown: 0, energyCost: 0 },
            { id: 'boulder_toss', name: 'Boulder Toss', description: 'Hurls a massive rock', type: 'special', damage: 30, cooldown: 6, energyCost: 25, element: 'earth' },
            { id: 'earthquake', name: 'Earthquake', description: 'Ground-shaking attack', type: 'ultimate', damage: 60, cooldown: 16, energyCost: 55, element: 'earth' },
        ],
        sprite: '🪨🦀',
    },

    // 👻 SHADOW CREATURES
    {
        id: 'shade_wisp',
        name: 'Shade Wisp',
        element: 'shadow',
        rarity: 'uncommon',
        description: 'A mysterious spirit from the realm of shadows.',
        baseStats: { hp: 38, attack: 16, defense: 8, speed: 14, energy: 100 },
        abilities: [
            { id: 'shadow_touch', name: 'Shadow Touch', description: 'Chilling contact', type: 'basic', damage: 16, cooldown: 0, energyCost: 0 },
            { id: 'dark_pulse', name: 'Dark Pulse', description: 'Wave of darkness', type: 'special', damage: 35, cooldown: 5, energyCost: 28, element: 'shadow' },
            { id: 'void_consume', name: 'Void Consume', description: 'Devours with shadow', type: 'ultimate', damage: 65, cooldown: 16, energyCost: 55, element: 'shadow' },
        ],
        sprite: '👻✨',
    },

    // ✨ LIGHT CREATURES
    {
        id: 'glow_moth',
        name: 'Glow Moth',
        element: 'light',
        rarity: 'uncommon',
        description: 'A radiant moth that spreads light wherever it flies.',
        baseStats: { hp: 35, attack: 14, defense: 7, speed: 16, energy: 100 },
        abilities: [
            { id: 'light_beam', name: 'Light Beam', description: 'Focused ray of light', type: 'basic', damage: 15, cooldown: 0, energyCost: 0 },
            { id: 'prism_flash', name: 'Prism Flash', description: 'Blinding light burst', type: 'special', damage: 34, cooldown: 5, energyCost: 28, element: 'light' },
            { id: 'divine_radiance', name: 'Divine Radiance', description: 'Holy light explosion', type: 'ultimate', damage: 62, cooldown: 16, energyCost: 55, element: 'light' },
        ],
        sprite: '✨🦋',
    },

    // LEGENDARY
    {
        id: 'phoenix_lord',
        name: 'Phoenix Lord',
        element: 'blaze',
        rarity: 'legendary',
        description: 'The immortal king of fire, reborn from ashes.',
        baseStats: { hp: 120, attack: 35, defense: 25, speed: 28, energy: 150 },
        abilities: [
            { id: 'sacred_flame', name: 'Sacred Flame', description: 'Divine fire attack', type: 'basic', damage: 30, cooldown: 0, energyCost: 0 },
            { id: 'rebirth_blaze', name: 'Rebirth Blaze', description: 'Heals while attacking', type: 'special', damage: 55, cooldown: 8, energyCost: 40, element: 'blaze' },
            { id: 'eternal_inferno', name: 'Eternal Inferno', description: 'Apocalyptic flames', type: 'ultimate', damage: 120, cooldown: 25, energyCost: 80, element: 'blaze' },
        ],
        sprite: '🔥🦅',
    },
];

// Get creature by ID
export function getCreatureById(id: string): CreatureTemplate | undefined {
    return CREATURE_ROSTER.find(c => c.id === id);
}

// Get creatures by element
export function getCreaturesByElement(element: string): CreatureTemplate[] {
    return CREATURE_ROSTER.filter(c => c.element === element);
}

// Get creatures by rarity
export function getCreaturesByRarity(rarity: string): CreatureTemplate[] {
    return CREATURE_ROSTER.filter(c => c.rarity === rarity);
}

// Get random creature for spawning (weighted by rarity)
export function getRandomCreatureForSpawn(): CreatureTemplate {
    const rand = Math.random() * 100;
    let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

    if (rand < 1) rarity = 'legendary';
    else if (rand < 5) rarity = 'epic';
    else if (rand < 20) rarity = 'rare';
    else if (rand < 50) rarity = 'uncommon';
    else rarity = 'common';

    const candidates = getCreaturesByRarity(rarity);
    return candidates[Math.floor(Math.random() * candidates.length)] || CREATURE_ROSTER[0];
}
