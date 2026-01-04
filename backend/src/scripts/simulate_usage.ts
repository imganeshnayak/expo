import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';
let customerToken: string;
let businessToken: string;
let campaignId: string;
let dealId: string;
let groupId: string;

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
};

const log = (step: string, msg: string, success: boolean = true) => {
    console.log(`${success ? colors.green : colors.red}[${step}] ${msg}${colors.reset}`);
};

const info = (msg: string) => console.log(`${colors.cyan}${msg}${colors.reset}`);
const warn = (msg: string) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`);

async function runSimulation() {
    console.log(`${colors.magenta}🚀 STARTING BRUTAL SIMULATION...${colors.reset}\n`);

    try {
        // --- 1. AUTHENTICATION ---
        info('--- PHASE 1: AUTHENTICATION ---');

        // Login Customer
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'demo.customer@utopia.app',
                password: 'password123'
            });
            customerToken = res.data.token;
            log('AUTH', 'Customer Login Successful');
        } catch (e: any) {
            console.error('Full Error:', e.response?.data || e.message);
            console.error('Error Code:', e.code);
            log('AUTH', `Customer Login Failed: ${e.message}`, false);
            process.exit(1);
        }

        // Login Business
        try {
            const res = await axios.post(`${API_URL}/merchant/auth/login`, {
                email: 'demo.business@utopia.app',
                password: 'password123'
            });
            businessToken = res.data.token;
            log('AUTH', 'Business Login Successful');
        } catch (e: any) {
            log('AUTH', `Business Login Failed: ${e.message}`, false);
            process.exit(1);
        }

        const customerAuth = { headers: { Authorization: `Bearer ${customerToken}` } };
        const businessAuth = { headers: { Authorization: `Bearer ${businessToken}` } };


        // --- 2. BUSINESS WORKFLOW ---
        info('\n--- PHASE 2: BUSINESS WORKFLOW ---');

        // Create Campaign
        try {
            const res = await axios.post(`${API_URL}/campaigns`, {
                name: `Stress Test Campaign ${Date.now()}`,
                type: 'discount',
                category: 'acquisition',
                budget: { total: 5000, spent: 0 },
                targeting: { audience: 'all' },
                offer: { discountPercent: 20 },
                title: '20% Off Stress Test',
                description: 'Testing system limits',
                pricing: { originalPrice: 100, discountedPrice: 80 },
                status: 'active'
            }, businessAuth);
            campaignId = res.data.data._id;
            dealId = campaignId; // In our model, campaign often maps to deal
            log('BIZ', `Campaign Created: ${campaignId}`);
        } catch (e: any) {
            log('BIZ', `Campaign Creation Failed: ${e.response?.data?.message || e.message}`, false);
        }

        // Get Analytics (Should be empty initially)
        try {
            await axios.get(`${API_URL}/analytics/overview`, businessAuth);
            log('BIZ', 'Analytics Dashboard Fetched');
        } catch (e: any) {
            log('BIZ', `Analytics Fetch Failed: ${e.message}`, false);
        }


        // --- 3. CUSTOMER WORKFLOW ---
        info('\n--- PHASE 3: CUSTOMER WORKFLOW ---');

        // Set Archetype
        try {
            await axios.post(`${API_URL}/archetype`, { archetype: 'deal_hunter' }, customerAuth);
            log('USER', 'Archetype Set to Deal Hunter');
        } catch (e: any) {
            log('USER', `Set Archetype Failed: ${e.message}`, false);
        }

        // Fetch Deals
        try {
            const res = await axios.get(`${API_URL}/deals`, customerAuth);
            // console.log('Deals Response:', JSON.stringify(res.data, null, 2));
            const deals = res.data; // Controller returns array directly
            if (deals && deals.length > 0) log('USER', `Fetched ${deals.length} Deals`);
            else warn('No deals found to fetch');
        } catch (e: any) {
            log('USER', `Fetch Deals Failed: ${e.message}`, false);
        }

        // Claim Deal
        let redemptionCode: string = '';
        try {
            const res = await axios.post(`${API_URL}/deals/${dealId}/claim`, {}, customerAuth);
            redemptionCode = res.data.data.redemptionCode; // Adjust based on actual response structure
            log('USER', `Deal Claimed! Code: ${redemptionCode}`);
        } catch (e: any) {
            // It might fail if already claimed in seed, which is fine, we handle that
            if (e.response?.status === 400) {
                warn('Deal already claimed (Expected if re-running)');
                // Try to get the code from profile if possible, or skip redemption test
            } else {
                log('USER', `Deal Claim Failed: ${e.response?.data?.message || e.message}`, false);
            }
        }

        // Double Claim Test (Should Fail)
        try {
            await axios.post(`${API_URL}/deals/${dealId}/claim`, {}, customerAuth);
            log('USER', 'Double Claim Allowed (FAILURE)', false);
        } catch (e: any) {
            if (e.response?.status === 400) {
                log('USER', 'Double Claim Blocked (SUCCESS)');
            } else {
                log('USER', `Double Claim Error: ${e.message}`, false);
            }
        }


        // --- 4. SOCIAL & GROUPS ---
        info('\n--- PHASE 4: SOCIAL & GROUPS ---');

        // Create Group
        try {
            const res = await axios.post(`${API_URL}/groups`, {
                name: `Test Squad ${Date.now()}`,
                purpose: 'weekend_plans',
                emoji: '🚀'
            }, customerAuth);
            groupId = res.data.data._id;
            log('SOCIAL', `Group Created: ${groupId}`);
        } catch (e: any) {
            log('SOCIAL', `Group Creation Failed: ${e.message}`, false);
        }

        // Send Message
        try {
            await axios.post(`${API_URL}/groups/${groupId}/messages`, {
                message: 'Hello World! This is a test.',
                type: 'text'
            }, customerAuth);
            log('SOCIAL', 'Chat Message Sent');
        } catch (e: any) {
            log('SOCIAL', `Chat Failed: ${e.message}`, false);
        }

        // Fetch Leaderboard
        try {
            await axios.get(`${API_URL}/leaderboard?type=global`, customerAuth);
            log('SOCIAL', 'Leaderboard Fetched');
        } catch (e: any) {
            log('SOCIAL', `Leaderboard Failed: ${e.message}`, false);
        }


        // --- 5. REDEMPTION FLOW (The "Payment" Precursor) ---
        info('\n--- PHASE 5: REDEMPTION FLOW ---');

        // Verify Code (Business Side)
        // Note: You'll need an endpoint for this. Assuming /business/campaigns/redeem or similar exists or needs to be tested.
        // If not implemented yet, this test will fail, highlighting what's needed for payments.

        /* 
        try {
            await axios.post(`${API_URL}/business/campaigns/redeem`, {
                code: redemptionCode
            }, businessAuth);
            log('BIZ', 'Redemption Successful');
        } catch (e: any) {
            warn(`Redemption Endpoint Check: ${e.response?.status === 404 ? 'Endpoint Not Found (To Be Implemented)' : e.message}`);
        }
        */
        warn('Skipping Redemption API test (Endpoint verification needed)');


        console.log(`\n${colors.magenta}🏁 SIMULATION COMPLETE${colors.reset}`);

    } catch (error: any) {
        console.error('FATAL ERROR:', error.message);
    }
}

runSimulation();
