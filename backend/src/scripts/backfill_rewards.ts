import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import User from '../models/User';
import { queueXP } from '../services/GamificationService';

dotenv.config();

const backfillRewards = async () => {
    try {
        await connectDB();

        // Get all users
        const users = await User.find();
        console.log(`Found ${users.length} users to check.`);

        for (const user of users) {
            console.log(`Checking user: ${user.email} (${user._id})`);

            // Initialize gamification if missing
            if (!user.gamification) {
                user.gamification = {
                    xp: { current: 0, lifetime: 0 },
                    rank: { league: 'Bronze', tier: 1, displayName: 'Bronze I' },
                    streak: { current: 0, lastActiveDate: new Date() },
                    unlockedFeatures: [],
                    skillTree: new Map(),
                    pendingRewards: [],
                };
                await user.save();
            }

            const pendingRewards = user.gamification.pendingRewards || [];

            // Check for Signup Reward
            const hasSignupReward = pendingRewards.some(r => r.source === 'SIGNUP');
            // Also check if they already have XP (might have been added directly before)
            // But user specifically said they didn't claim it.
            // For safety, if XP is 0, we definitely add it.
            const isNewUser = user.gamification.xp.lifetime === 0;

            if (!hasSignupReward && isNewUser) {
                console.log(`  - Queuing Signup Reward`);
                await queueXP(user._id.toString(), 50, 'SIGNUP', 'Welcome Bonus');
            }

            // Check for Daily Check-in Reward
            // Since we don't have a real check-in history yet, we'll just give them one "Welcome Check-in"
            const hasCheckinReward = pendingRewards.some(r => r.source === 'DAILY_CHECKIN');

            if (!hasCheckinReward) {
                console.log(`  - Queuing Daily Check-in Reward`);
                await queueXP(user._id.toString(), 10, 'DAILY_CHECKIN', 'Daily Check-in');
            }
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

backfillRewards();
