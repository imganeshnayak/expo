import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import MerchantUser from '../models/business/MerchantUser';
import Merchant from '../models/Merchant';

dotenv.config();

const fixMerchantData = async () => {
    try {
        await connectDB();

        // Find all merchant users
        const merchantUsers = await MerchantUser.find();
        console.log(`Found ${merchantUsers.length} merchant users`);

        for (const user of merchantUsers) {
            console.log(`\nChecking user: ${user.email}`);

            // Check if merchant exists
            const merchant = await Merchant.findById(user.merchantId);

            if (!merchant) {
                console.log(`  ❌ Merchant not found for user ${user.email}`);
                console.log(`  Creating merchant...`);

                // Create missing merchant
                const newMerchant = await Merchant.create({
                    name: user.profile?.name || 'Business',
                    contact: {
                        email: user.email,
                        phone: user.profile?.phone || ''
                    },
                    isVerified: false,
                    isActive: true,
                });

                // Update user's merchantId
                user.merchantId = newMerchant._id as any;
                await user.save();

                console.log(`  ✅ Created merchant: ${newMerchant.name} (${newMerchant._id})`);
            } else {
                console.log(`  ✅ Merchant exists: ${merchant.name}`);
            }
        }

        console.log('\n✅ Merchant data check complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixMerchantData();
