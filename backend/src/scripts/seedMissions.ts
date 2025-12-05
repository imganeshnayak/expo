import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mission from '../models/Mission';

dotenv.config();

const sampleMissions = [
    {
        title: '🎮 Friday Night Thrills',
        description: 'Complete the ultimate evening entertainment experience',
        type: 'visit',
        requirement: 3,
        rewardPoints: 300,
        xpReward: 150,
        frequency: 'weekly',
        icon: 'Gamepad2',
        category: 'entertainment',
        categoryColor: '#9B59B6',
        difficulty: 'medium',
        timeEstimate: '3-4 hours',
        estimatedSavings: 200,
        steps: [
            {
                id: 'step1',
                type: 'ride',
                instructions: 'Book a ride to gaming zone',
                completed: false,
                actionRequired: true,
                deepLink: '/ride-booking',
            },
            {
                id: 'step2',
                type: 'visit',
                merchantId: 'gaming-zone-001',
                instructions: 'Play 1 hour at gaming zone',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step3',
                type: 'deal',
                dealId: 'restaurant-dinner-001',
                instructions: 'Enjoy dinner at nearby restaurant',
                completed: false,
                actionRequired: true,
                deepLink: '/',
            },
        ],
    },
    {
        title: '🗺️ Weekend Explorer',
        description: 'Discover different experiences across the city',
        type: 'visit',
        requirement: 4,
        rewardPoints: 250,
        xpReward: 100,
        frequency: 'weekly',
        icon: 'Compass',
        category: 'adventure',
        categoryColor: '#E74C3C',
        difficulty: 'easy',
        timeEstimate: '2-3 hours',
        estimatedSavings: 150,
        steps: [
            {
                id: 'step1',
                type: 'visit',
                instructions: 'Visit a food establishment',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step2',
                type: 'visit',
                instructions: 'Visit a wellness center',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step3',
                type: 'visit',
                instructions: 'Visit a shopping store',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step4',
                type: 'ride',
                instructions: 'Complete 1 ride booking',
                completed: false,
                actionRequired: true,
                deepLink: '/ride-booking',
            },
        ],
    },
    {
        title: '☕ Coffee Connoisseur',
        description: 'Experience the best coffee spots in town',
        type: 'scan',
        requirement: 3,
        rewardPoints: 200,
        xpReward: 80,
        frequency: 'weekly',
        icon: 'Coffee',
        category: 'food',
        categoryColor: '#F39C12',
        difficulty: 'easy',
        timeEstimate: '2-3 hours',
        estimatedSavings: 100,
        steps: [
            {
                id: 'step1',
                type: 'scan',
                merchantId: 'starbucks-001',
                instructions: 'Visit Starbucks and scan QR',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step2',
                type: 'scan',
                merchantId: 'local-cafe-001',
                instructions: 'Try a local cafe',
                completed: false,
                actionRequired: true,
            },
            {
                id: 'step3',
                type: 'scan',
                merchantId: 'artisan-coffee-001',
                instructions: 'Visit artisan coffee shop',
                completed: false,
                actionRequired: true,
            },
        ],
    },
];

const seedMissions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uma_db');
        console.log('MongoDB Connected');

        await Mission.deleteMany({});
        console.log('Cleared existing missions');

        await Mission.insertMany(sampleMissions);
        console.log('Seeded missions');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedMissions();
