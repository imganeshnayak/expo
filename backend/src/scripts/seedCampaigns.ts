import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Merchant from '../models/Merchant';
import Campaign from '../models/business/Campaign';

dotenv.config();

const seedCampaigns = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uma');
        console.log('MongoDB Connected');

        // Clear existing data
        await Merchant.deleteMany({});
        await Campaign.deleteMany({});

        console.log('Cleared existing merchants and campaigns');

        // Create Merchants
        const merchants = await Merchant.create([
            {
                name: 'Burger King',
                description: 'Home of the Whopper',
                category: ['Food', 'Fast Food'],
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png',
                contact: { email: 'bk@example.com', phone: '1234567890' },
                location: { address: 'Koramangala, Bangalore', coordinates: { latitude: 12.9352, longitude: 77.6245 } },
                rating: { average: 4.5, count: 1200 },
                isActive: true,
                isVerified: true
            },
            {
                name: 'Starbucks',
                description: 'Inspiring and nurturing the human spirit',
                category: ['Cafe', 'Coffee'],
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
                contact: { email: 'starbucks@example.com', phone: '0987654321' },
                location: { address: 'Indiranagar, Bangalore', coordinates: { latitude: 12.9719, longitude: 77.6412 } },
                rating: { average: 4.8, count: 2500 },
                isActive: true,
                isVerified: true
            },
            {
                name: 'Nike Store',
                description: 'Just Do It',
                category: ['Shopping', 'Sports'],
                logo: 'https://c.static-nike.com/a/images/w_1920,c_limit/bzl2wmsfh7kgdkufrrjq/nike-logo.jpg',
                contact: { email: 'nike@example.com', phone: '1122334455' },
                location: { address: 'Brigade Road, Bangalore', coordinates: { latitude: 12.9716, longitude: 77.5946 } },
                rating: { average: 4.6, count: 800 },
                isActive: true,
                isVerified: true
            }
        ]);

        console.log(`Created ${merchants.length} merchants`);

        // Create Campaigns (Deals)
        const campaigns = await Campaign.create([
            {
                merchantId: merchants[0]._id,
                name: 'Whopper Wednesday',
                title: 'Whopper Wednesday Special',
                description: 'Get a Whopper for just ₹99! Valid only on Wednesdays.',
                type: 'discount',
                category: 'acquisition',
                consumerCategory: 'Food',
                status: 'active',
                budget: { total: 50000, spent: 1200 },
                targeting: {
                    audience: 'all',
                    timing: 'always',
                    schedule: {
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                    }
                },
                offer: { discountPercent: 40 },
                pricing: {
                    originalPrice: 199,
                    discountedPrice: 99
                },
                images: ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=1472&q=80'],
                termsAndConditions: ['Valid only on Wednesdays', 'Dine-in and Takeaway only'],
                maxRedemptions: 500,
                performance: { conversions: 45 }
            },
            {
                merchantId: merchants[0]._id,
                name: 'Family Meal Deal',
                title: 'Family Feast Combo',
                description: '2 Whoppers + 2 Medium Fries + 2 Cokes',
                type: 'combo',
                category: 'retention',
                consumerCategory: 'Food',
                status: 'active',
                budget: { total: 100000, spent: 5000 },
                targeting: {
                    audience: 'all',
                    timing: 'always',
                    schedule: {
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                    }
                },
                offer: { discountPercent: 30 },
                pricing: {
                    originalPrice: 650,
                    discountedPrice: 450
                },
                images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80'],
                termsAndConditions: ['Cannot be combined with other offers'],
                maxRedemptions: 200,
                performance: { conversions: 12 }
            },
            {
                merchantId: merchants[1]._id,
                name: 'Morning Coffee Brew',
                title: 'Morning Brew 50% Off',
                description: 'Start your day right with 50% off on all Cappuccinos before 11 AM.',
                type: 'discount',
                category: 'loyalty',
                consumerCategory: 'Cafe',
                status: 'active',
                budget: { total: 20000, spent: 800 },
                targeting: {
                    audience: 'returning',
                    timing: 'schedule',
                    schedule: {
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                    }
                },
                offer: { discountPercent: 50 },
                pricing: {
                    originalPrice: 350,
                    discountedPrice: 175
                },
                images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'],
                termsAndConditions: ['Valid until 11 AM', 'One per customer'],
                maxRedemptions: 1000,
                performance: { conversions: 150 }
            },
            {
                merchantId: merchants[2]._id,
                name: 'Summer Sale',
                title: 'Flat 30% Off Running Shoes',
                description: 'Get 30% off on the new Air Zoom collection.',
                type: 'discount',
                category: 'acquisition',
                consumerCategory: 'Shopping',
                status: 'active',
                budget: { total: 500000, spent: 25000 },
                targeting: {
                    audience: 'all',
                    timing: 'always',
                    schedule: {
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
                    }
                },
                offer: { discountPercent: 30 },
                pricing: {
                    originalPrice: 12000,
                    discountedPrice: 8400
                },
                images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'],
                termsAndConditions: ['Selected models only'],
                maxRedemptions: 100,
                performance: { conversions: 20 }
            }
        ]);

        console.log(`Created ${campaigns.length} campaigns`);
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedCampaigns();
