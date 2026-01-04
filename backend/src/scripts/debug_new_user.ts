
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { queueXP } from '../services/GamificationService';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const email = `debug_${Date.now()}@example.com`;
        const phone = `+1${Date.now()}`;

        console.log('Creating user...');
        const user = await User.create({
            email,
            phone,
            password: 'password123',
            profile: {
                name: 'Debug User',
                preferences: {
                    notifications: true,
                    locationServices: false,
                    language: 'en',
                },
            },
        });

        console.log('User created.');
        console.log('Initial Gamification State:', JSON.stringify(user.gamification, null, 2));

        console.log('Queueing Signup XP...');
        await queueXP(user._id.toString(), 50, 'SIGNUP', 'Welcome Bonus');

        console.log('Adding 3000 XP to test promotion to Bronze II...');
        await queueXP(user._id.toString(), 3000, 'TEST_PROMOTION', 'Testing Rank Up');

        const updatedUser = await User.findById(user._id);
        console.log('Updated Gamification State:', JSON.stringify(updatedUser?.gamification, null, 2));

        console.log('Target Rank: Bronze II');
        console.log('Actual Rank:', updatedUser?.gamification.rank.displayName);

        console.log('Cleaning up...');
        await User.deleteOne({ _id: user._id });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
