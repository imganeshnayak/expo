import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import User from '../models/User';
import { queueXP } from '../services/GamificationService';

dotenv.config();

const addReward = async () => {
    try {
        await connectDB();

        const user = await User.findOne();
        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        console.log(`Adding pending reward for user: ${user.email} (${user._id})`);

        const result = await queueXP(user._id.toString(), 100, 'TEST_SCRIPT', 'Test Reward');

        console.log('Reward added successfully!');
        console.log('Pending Rewards:', JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addReward();
