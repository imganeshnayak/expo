const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uma-business');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define schemas (simplified)
        const MerchantUserSchema = new mongoose.Schema({}, { strict: false });
        const MerchantUser = mongoose.model('MerchantUser', MerchantUserSchema, 'merchantusers');

        const MerchantSchema = new mongoose.Schema({}, { strict: false });
        const Merchant = mongoose.model('Merchant', MerchantSchema, 'merchants');

        // Count documents
        const userCount = await MerchantUser.countDocuments();
        const merchantCount = await Merchant.countDocuments();

        console.log(`\n📊 Database Status:`);
        console.log(`- Merchant Users: ${userCount}`);
        console.log(`- Merchants: ${merchantCount}`);

        if (userCount > 0) {
            console.log('\n👥 Recent Users:');
            const users = await MerchantUser.find().sort({ createdAt: -1 }).limit(5);
            users.forEach(u => {
                console.log(`- ${u.email} (Role: ${u.role})`);
            });
        } else {
            console.log('\n⚠️ No users found in database!');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
