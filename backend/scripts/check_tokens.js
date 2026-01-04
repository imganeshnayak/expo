const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    pushToken: String,
});

const User = mongoose.model('User', UserSchema);

const checkTokens = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utopia-deals');
        console.log('Connected to MongoDB');

        const usersWithToken = await User.find({ pushToken: { $exists: true, $ne: null } });
        console.log(`Found ${usersWithToken.length} users with push tokens:`);
        usersWithToken.forEach(u => console.log(`- ${u.name} (${u.email}): ${u.pushToken}`));

        const allUsers = await User.find({});
        console.log(`Total users in DB: ${allUsers.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTokens();
