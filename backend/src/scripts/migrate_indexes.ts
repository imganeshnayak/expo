/**
 * Database Migration: Add Performance Indexes
 * Run with: npx ts-node src/scripts/migrate_indexes.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface IndexDefinition {
    key: Record<string, 1 | -1 | '2dsphere'>;
    name: string;
    expireAfterSeconds?: number;
}

interface CollectionIndexes {
    collection: string;
    indexes: IndexDefinition[];
}

const INDEXES: CollectionIndexes[] = [
    // User model - already has unique indexes, add query optimization
    {
        collection: 'users',
        indexes: [
            { key: { 'gamification.xp.lifetime': -1 }, name: 'idx_xp_lifetime' },
            { key: { 'gamification.rank.league': 1 }, name: 'idx_rank_league' },
            { key: { createdAt: -1 }, name: 'idx_created_at' },
            { key: { isActive: 1, createdAt: -1 }, name: 'idx_active_users' },
        ],
    },
    // Campaigns/Deals
    {
        collection: 'campaigns',
        indexes: [
            { key: { isActive: 1, expiresAt: 1 }, name: 'idx_active_campaigns' },
            { key: { merchantId: 1, isActive: 1 }, name: 'idx_merchant_campaigns' },
            { key: { category: 1, isActive: 1 }, name: 'idx_category' },
        ],
    },
    // Game spawns
    {
        collection: 'gamespawns',
        indexes: [
            { key: { location: '2dsphere' }, name: 'idx_spawn_location' },
            { key: { expiresAt: 1 }, name: 'idx_spawn_expiry', expireAfterSeconds: 0 },
            { key: { rarity: 1, isActive: 1 }, name: 'idx_spawn_rarity' },
        ],
    },
    // User collections
    {
        collection: 'usercollections',
        indexes: [
            { key: { userId: 1, caughtAt: -1 }, name: 'idx_user_collection' },
            { key: { userId: 1, creatureType: 1 }, name: 'idx_user_creature' },
        ],
    },
];

async function migrate() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/utopia';

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }

    for (const { collection, indexes } of INDEXES) {
        console.log(`📦 Processing collection: ${collection}`);

        try {
            const coll = db.collection(collection);

            for (const index of indexes) {
                try {
                    const options: { name: string; expireAfterSeconds?: number } = { name: index.name };
                    if (index.expireAfterSeconds !== undefined) {
                        options.expireAfterSeconds = index.expireAfterSeconds;
                    }
                    await coll.createIndex(index.key, options);
                    console.log(`  ✅ Created index: ${index.name}`);
                } catch (err: any) {
                    if (err.code === 85) {
                        console.log(`  ⏭️  Index already exists: ${index.name}`);
                    } else {
                        console.log(`  ❌ Failed: ${index.name} - ${err.message}`);
                    }
                }
            }
        } catch (err: any) {
            console.log(`  ⚠️  Collection may not exist yet: ${collection}`);
        }

        console.log('');
    }

    console.log('🎉 Migration complete!\n');
    await mongoose.disconnect();
}

migrate().catch(console.error);
