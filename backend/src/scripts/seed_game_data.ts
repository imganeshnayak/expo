import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import UtopianArchetype from '../models/game/UtopianArchetype';

dotenv.config();

const UTOPIANS = [
    // COMMON (55%)
    {
        name: 'Bytey',
        rarity: 'Common',
        baseStats: { power: 20, charm: 30, chaos: 10 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/bytey.png',
            color: '#4CAF50',
            icon: '👾'
        },
        lore: {
            backstory: 'Spawned accidentally from a forgotten line of code.',
            personality: 'Curious, easily distracted'
        }
    },
    {
        name: 'DustBunny',
        rarity: 'Common',
        baseStats: { power: 15, charm: 40, chaos: 20 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/dustbunny.png',
            color: '#9E9E9E',
            icon: '🐰'
        },
        lore: {
            backstory: 'Apex predator of the underside of your bed.',
            personality: 'Sneaky'
        }
    },
    {
        name: 'Caff-Fiend',
        rarity: 'Common',
        baseStats: { power: 40, charm: 10, chaos: 40 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/cafffiend.png',
            color: '#795548',
            icon: '☕'
        },
        lore: {
            backstory: 'Vibrates constantly. Cannot sleep, must sip.',
            personality: 'Jittery'
        }
    },
    {
        name: 'Glitch',
        rarity: 'Common',
        baseStats: { power: 25, charm: 15, chaos: 50 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/glitch.png',
            color: '#00BCD4',
            icon: '🟦'
        },
        lore: {
            backstory: 'It’s not a bug, it’s a feature.',
            personality: 'Unpredictable'
        }
    },
    {
        name: 'Pigeon.png',
        rarity: 'Common',
        baseStats: { power: 10, charm: 20, chaos: 30 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/pigeon.png',
            color: '#607D8B',
            icon: '🐦'
        },
        lore: {
            backstory: 'Loaded in 144p. Staying that way.',
            personality: 'Low-res'
        }
    },
    {
        name: 'SockMissing',
        rarity: 'Common',
        baseStats: { power: 15, charm: 15, chaos: 60 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/sock.png',
            color: '#FF9800',
            icon: '🧦'
        },
        lore: {
            backstory: 'The reason you have cold feet.',
            personality: 'Elusive'
        }
    },
    {
        name: 'TrafficCone',
        rarity: 'Common',
        baseStats: { power: 50, charm: 5, chaos: 5 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/cone.png',
            color: '#FF5722',
            icon: '🚧'
        },
        lore: {
            backstory: 'Protecting absolutely nothing since 2024.',
            personality: 'Stoic'
        }
    },
    {
        name: 'EmptyBox',
        rarity: 'Common',
        baseStats: { power: 5, charm: 50, chaos: 10 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/box.png',
            color: '#8D6E63',
            icon: '📦'
        },
        lore: {
            backstory: 'Cats love him. Humans ignore him.',
            personality: 'Hollow'
        }
    },

    // RARE (25%)
    {
        name: 'Snacklin',
        rarity: 'Rare',
        baseStats: { power: 30, charm: 60, chaos: 20 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/snacklin.png',
            color: '#FFC107',
            icon: '🍔'
        },
        lore: {
            backstory: 'Only appears when you walk after eating.',
            personality: 'Lazy foodie'
        }
    },
    {
        name: 'WifiSeeker',
        rarity: 'Rare',
        baseStats: { power: 20, charm: 20, chaos: 70 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/wifi.png',
            color: '#2196F3',
            icon: '📶'
        },
        lore: {
            backstory: 'Panic attacks when below 2 bars.',
            personality: 'Anxious'
        }
    },
    {
        name: 'SwoleDoge',
        rarity: 'Rare',
        baseStats: { power: 80, charm: 40, chaos: 10 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/swoledoge.png',
            color: '#FFEB3B',
            icon: '🐕'
        },
        lore: {
            backstory: 'Skipped leg day, but look at those delts.',
            personality: 'Gym bro'
        }
    },
    {
        name: 'PlantMom',
        rarity: 'Rare',
        baseStats: { power: 40, charm: 70, chaos: 10 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/plant.png',
            color: '#8BC34A',
            icon: '🪴'
        },
        lore: {
            backstory: 'Judges your hydration levels silently.',
            personality: 'Nurturing'
        }
    },
    {
        name: 'VinylHipster',
        rarity: 'Rare',
        baseStats: { power: 30, charm: 50, chaos: 30 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/hipster.png',
            color: '#3F51B5',
            icon: '👓'
        },
        lore: {
            backstory: 'You probably haven\'t heard of him.',
            personality: 'Pretentious'
        }
    },
    {
        name: 'CryptoBro',
        rarity: 'Rare',
        baseStats: { power: 60, charm: 10, chaos: 80 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/crypto.png',
            color: '#FF9800',
            icon: '📉'
        },
        lore: {
            backstory: 'Going to the moon! (Actually crashed).',
            personality: 'Delusional'
        }
    },

    // EPIC (12%)
    {
        name: 'Ghosted',
        rarity: 'Epic',
        baseStats: { power: 10, charm: 80, chaos: 60 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/ghosted.png',
            color: '#E0E0E0',
            icon: '👻'
        },
        lore: {
            backstory: 'Seen once. Never replies.',
            personality: 'Emotionally unavailable'
        }
    },
    {
        name: 'VibeCheck',
        rarity: 'Epic',
        baseStats: { power: 70, charm: 70, chaos: 30 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/vibe.png',
            color: '#9C27B0',
            icon: '👁️'
        },
        lore: {
            backstory: 'Knows exactly what you did last summer.',
            personality: 'Omniscient'
        }
    },
    {
        name: 'CloudStorage',
        rarity: 'Epic',
        baseStats: { power: 40, charm: 60, chaos: 50 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/cloud.png',
            color: '#03A9F4',
            icon: '☁️'
        },
        lore: {
            backstory: 'Holding your embarrassing photos hostage.',
            personality: 'Fluffy but dangerous'
        }
    },
    {
        name: 'Karen',
        rarity: 'Epic',
        baseStats: { power: 90, charm: 0, chaos: 90 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/karen.png',
            color: '#F44336',
            icon: '👱‍♀️'
        },
        lore: {
            backstory: 'Would like to speak to the manager of this game.',
            personality: 'Entitled'
        }
    },

    // MYTHIC (6%)
    {
        name: 'TouchGrass',
        rarity: 'Mythic',
        baseStats: { power: 85, charm: 85, chaos: 10 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/grass.png',
            color: '#009688',
            icon: '🌿'
        },
        lore: {
            backstory: 'Appears when you haven\'t opened Utopia in hours.',
            personality: 'Aggressively motivational'
        }
    },
    {
        name: 'ZeroInbox',
        rarity: 'Mythic',
        baseStats: { power: 100, charm: 50, chaos: 0 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/inbox.png',
            color: '#2196F3',
            icon: '📫'
        },
        lore: {
            backstory: 'A myth. Legend says no one has ever seen him.',
            personality: 'Organized'
        }
    },

    // LEGENDARY (2%)
    {
        name: 'MainChar',
        rarity: 'Legendary',
        baseStats: { power: 95, charm: 100, chaos: 20 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/mainchar.png',
            color: '#FFD700',
            icon: '✨'
        },
        lore: {
            backstory: 'Some people just get everything.',
            personality: 'Unfairly lucky'
        }
    },
    {
        name: 'TheAlgorithm',
        rarity: 'Legendary',
        baseStats: { power: 99, charm: 10, chaos: 99 },
        visuals: {
            spriteUrl: 'https://utopia-assets.s3.ap-south-1.amazonaws.com/sprites/algo.png',
            color: '#000000',
            icon: '♾️'
        },
        lore: {
            backstory: 'Decides your fate based on your watch time.',
            personality: 'Cold'
        },
        spawnConditions: { timeOfDay: 'Any' }
    }
];

// Helper to add default spawnConditions if missing (since I am lazy to type it 22 times in the array above in this Replace call)
// actually I'll just map it before inserting.

const seedGameData = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        console.log('Seeding Utopian Archetypes...');

        // Map to add defaults
        const utopiansWithDefaults = UTOPIANS.map(u => ({
            ...u,
            spawnConditions: { timeOfDay: 'Any' }
        }));

        // Clear existing
        await UtopianArchetype.deleteMany({});
        console.log('Cleared existing archetypes.');

        // Insert new
        const docs = await UtopianArchetype.insertMany(utopiansWithDefaults);
        console.log(`Successfully seeded ${docs.length} Utopian Archetypes.`);

        process.exit(0);
    } catch (error: any) {
        console.error('Error seeding game data:');
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error [${key}]: ${error.errors[key].message}`);
                console.error(`Value: ${error.errors[key].value}`);
            });
        }
        console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

seedGameData();
