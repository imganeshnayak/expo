import axios from 'axios';
import dotenv from 'dotenv';
import UtopianArchetype from '../models/game/UtopianArchetype';
import connectDB from '../config/database';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Testing Utopia Collect API ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo.customer@utopia.app',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        // 2. Get Spawns
        console.log('\n2. Fetching Spawns around Bangalore...');
        const spawnsRes = await axios.get(`${API_URL}/game/spawns`, {
            params: { latitude: 12.9716, longitude: 77.5946 },
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Spawns found: ${spawnsRes.data.count}`);
        if (spawnsRes.data.data.length > 0) {
            console.log('Sample Spawn:', JSON.stringify(spawnsRes.data.data[0], null, 2));
        }

        // 3. Catch a Utopian
        // Need an archetype ID. Let's fetch one from DB directly to be sure.
        await connectDB();
        const archetype = await UtopianArchetype.findOne({ name: 'Bytey' });
        if (!archetype) throw new Error('Bytey not found in DB');

        console.log(`\n3. Catching ${archetype.name} (${archetype._id})...`);
        const catchRes = await axios.post(`${API_URL}/game/catch`, {
            instanceId: 'test-instance-id',
            archetypeId: archetype._id,
            location: { latitude: 12.9716, longitude: 77.5946 }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Catch Result:', catchRes.data.message);
        console.log('New Collection Entry ID:', catchRes.data.data._id);

        // 4. Get Collection
        console.log('\n4. Fetching My Collection...');
        const collectionRes = await axios.get(`${API_URL}/game/collection`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Collection Count: ${collectionRes.data.count}`);
        console.log('Latest Catch:', collectionRes.data.data[0].nickname || collectionRes.data.data[0].archetypeId.name);

        console.log('\n✅ ALL SYSTEMS GREEN');
        process.exit(0);
    } catch (error: any) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

runTest();
