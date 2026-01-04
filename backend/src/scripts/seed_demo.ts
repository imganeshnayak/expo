import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import User from '../models/User';
import Merchant from '../models/Merchant';
import MerchantUser from '../models/business/MerchantUser';
import Campaign from '../models/business/Campaign';
import Group from '../models/Group';
import GroupChat from '../models/GroupChat';

dotenv.config();

const seedDemoData = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // --- 1. Business Setup ---
        console.log('Creating Business Account...');

        // Check if exists
        let merchantUser = await MerchantUser.findOne({ email: 'demo.business@utopia.app' });
        if (merchantUser) {
            console.log('Business user already exists, resetting...');
            // Optional: Delete existing data to ensure fresh state
            // await MerchantUser.deleteOne({ _id: merchantUser._id });
            // await Merchant.deleteOne({ _id: merchantUser.merchantId });
            // ... but for safety/speed, let's just reuse or update
        }

        // Create Merchant Profile
        const merchant = await Merchant.create({
            name: 'Utopia Cafe',
            description: 'The best coffee in the metaverse.',
            category: ['Food & Beverage', 'Cafe'],
            logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop',
            images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop'],
            contact: {
                email: 'contact@utopiacafe.com',
                phone: '+91 98765 43210',
                website: 'https://utopiacafe.com'
            },
            location: {
                address: '123 Metaverse Ave, Cyber City',
                coordinates: {
                    latitude: 12.9716,
                    longitude: 77.5946
                }
            },
            rating: { average: 4.8, count: 120 },
            isVerified: true,
            isActive: true
        });

        // Create Merchant User
        if (!merchantUser) {
            merchantUser = await MerchantUser.create({
                merchantId: merchant._id,
                email: 'demo.business@utopia.app',
                password: 'password123',
                role: 'owner',
                permissions: [],
                profile: {
                    name: 'Business Owner',
                    phone: '+91 98765 43210'
                },
                settings: {
                    notifications: true,
                    emailNotifications: true,
                    darkMode: true,
                    language: 'en',
                    timezone: 'IST'
                }
            } as any) as any;
        }

        // Create Campaign (Deal)
        const campaign = await Campaign.create({
            merchantId: merchant._id,
            name: '50% Off Latte',
            type: 'discount',
            category: 'acquisition',
            status: 'active',
            budget: { total: 1000, spent: 0 },
            targeting: { audience: 'all', segments: [] },
            offer: { discountPercent: 50 },
            performance: { impressions: 100, conversions: 10, revenue: 500, roi: 2, costPerAcquisition: 5, clickThroughRate: 0.1 },
            // Frontend fields
            title: '50% Off Any Latte',
            description: 'Get half off on our signature lattes. Valid for dine-in only.',
            consumerCategory: 'Food & Beverage',
            images: ['https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop'],
            termsAndConditions: ['Valid only on weekdays', 'One per customer'],
            pricing: { originalPrice: 300, discountedPrice: 150 },
            maxRedemptions: 100
        } as any) as any;

        // --- 2. Customer Setup ---
        console.log('Creating Customer Account...');

        let user = await User.findOne({ email: 'demo.customer@utopia.app' });
        if (!user) {
            user = await User.create({
                email: 'demo.customer@utopia.app',
                phone: '+91 99999 88888',
                password: 'password123',
                profile: {
                    name: 'Demo User',
                    avatar: 'https://i.pravatar.cc/150?u=demo',
                    location: {
                        address: 'Cyber City',
                        coordinates: { latitude: 12.9716, longitude: 77.5946 }
                    },
                    preferences: { notifications: true, locationServices: true, language: 'en' },
                    archetype: 'socialite'
                },
                loyaltyPoints: 500,
                gamification: {
                    xp: { current: 1200, lifetime: 1200 },
                    rank: { league: 'Silver', tier: 2, displayName: 'Silver II' },
                    streak: { current: 5, lastActiveDate: new Date() },
                    unlockedFeatures: [],
                    skillTree: new Map(),
                    pendingRewards: []
                },
                claimedDeals: [
                    {
                        dealId: campaign._id,
                        claimedAt: new Date(),
                        status: 'pending',
                        redemptionCode: 'UTOPIA-50',
                        savings: 150
                    }
                ]
            } as any) as any;
        } else {
            // Update existing user to ensure they have the deal and archetype
            if (user.profile) {
                user.profile.archetype = 'socialite';
            }
            // Check if deal already claimed
            const hasDeal = user.claimedDeals.some(d => d.dealId.toString() === campaign._id.toString());
            if (!hasDeal) {
                user.claimedDeals.push({
                    dealId: campaign._id,
                    claimedAt: new Date(),
                    status: 'pending',
                    redemptionCode: 'UTOPIA-50',
                    savings: 150
                });
            }
            await user.save();
        }

        if (!user) throw new Error('Failed to create or find user');

        // --- 3. Group Setup ---
        console.log('Creating Group...');

        const group = await Group.create({
            name: 'Coffee Squad ☕',
            emoji: '☕',
            description: 'For the love of caffeine',
            purpose: 'hanging_out',
            createdBy: user._id,
            members: [
                { userId: user._id, role: 'admin', joinedAt: new Date(), contribution: 100 }
            ],
            stats: { totalSavings: 500, missionsCompleted: 2, dealsShared: 5 }
        });

        // Add some chat messages
        await GroupChat.create({
            groupId: group._id,
            senderId: user._id,
            message: 'Anyone up for coffee at Utopia Cafe?',
            type: 'text',
            readBy: [user._id]
        });

        await GroupChat.create({
            groupId: group._id,
            senderId: user._id,
            message: 'I just claimed a 50% off deal there!',
            type: 'deal_share',
            metadata: { dealId: campaign._id, title: campaign.title },
            readBy: [user._id]
        });

        console.log('Customer Setup Complete.');
        console.log('User ID:', user._id);
        console.log('Group ID:', group._id);

        console.log('\n---------------------------------------------------');
        console.log('✅ DEMO DATA SEEDED SUCCESSFULLY');
        console.log('---------------------------------------------------');
        console.log('BUSINESS APP CREDENTIALS:');
        console.log('Email: demo.business@utopia.app');
        console.log('Password: password123');
        console.log('---------------------------------------------------');
        console.log('CUSTOMER APP CREDENTIALS:');
        console.log('Email: demo.customer@utopia.app');
        console.log('Password: password123');
        console.log('---------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDemoData();
