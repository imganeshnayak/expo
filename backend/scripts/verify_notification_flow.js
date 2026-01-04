const API_URL = 'http://localhost:5000/api';

async function runVerification() {
    console.log('🚀 Starting Notification Flow Verification...');

    // 1. Register Merchant
    const uniqueId = Date.now();
    const merchantData = {
        email: `test_merchant_${uniqueId}@example.com`,
        password: 'password123',
        businessName: `Test Business ${uniqueId}`,
        name: 'Test Owner',
        phone: '1234567890'
    };

    console.log(`\n1. Registering Merchant: ${merchantData.email}`);
    let response = await fetch(`${API_URL}/merchant/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merchantData)
    });

    if (!response.ok) {
        console.error('❌ Registration failed:', await response.text());
        return;
    }
    const authData = await response.json();
    const token = authData.token;
    console.log('✅ Merchant Registered. Token received.');

    // 2. Create Campaign (Deal)
    const campaignData = {
        name: `Flash Sale ${uniqueId}`,
        type: 'discount',
        category: 'acquisition',
        status: 'active', // Important for visibility
        title: `Flash Sale ${uniqueId}`,
        description: '50% off everything!',
        consumerCategory: 'Retail',
        pricing: {
            originalPrice: 100,
            discountedPrice: 50
        },
        offer: {
            discountPercent: 50
        },
        images: ['https://example.com/image.jpg'],
        termsAndConditions: ['No refunds'],
        maxRedemptions: 100
    };

    console.log(`\n2. Creating Campaign: ${campaignData.title}`);
    response = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
    });

    if (!response.ok) {
        console.error('❌ Campaign creation failed:', await response.text());
        return;
    }
    const campaign = (await response.json()).campaign;
    console.log('✅ Campaign Created:', campaign._id);

    // 3. Verify Deal Visibility (Public Endpoint)
    console.log('\n3. Verifying Deal Visibility (Customer App View)...');
    response = await fetch(`${API_URL}/deals`);
    if (!response.ok) {
        console.error('❌ Failed to fetch deals:', await response.text());
        return;
    }
    const deals = await response.json();
    const foundDeal = deals.find(d => d._id === campaign._id);

    if (foundDeal) {
        console.log('✅ Deal found in public feed!');
        console.log(`   - Title: ${foundDeal.title}`);
        console.log(`   - Price: ${foundDeal.discountedPrice} (was ${foundDeal.originalPrice})`);
    } else {
        console.error('❌ Deal NOT found in public feed.');
    }

    // 4. Send Push Notification
    const pushData = {
        title: `New Deal: ${campaignData.title}`,
        message: 'Check out our latest offer!',
        audience: 'all'
    };

    console.log(`\n4. Sending Push Notification: "${pushData.title}"`);
    // FIXED URL: /api/push-notifications (was /api/business/push-notifications)
    response = await fetch(`${API_URL}/push-notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pushData)
    });

    if (!response.ok) {
        console.error(`❌ Failed to send push notification: ${response.status} ${response.statusText}`);
        console.error(await response.text());
        return;
    }
    const pushResult = await response.json();
    console.log('✅ Push Notification Recorded:', pushResult.notification.status);

    // 5. Verify Push History
    console.log('\n5. Verifying Push History...');
    response = await fetch(`${API_URL}/push-notifications`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error(`❌ Failed to fetch push history: ${response.status} ${response.statusText}`);
        console.error(await response.text());
        return;
    }
    const history = await response.json();
    const foundPush = history.notifications.find(n => n.title === pushData.title);

    if (foundPush) {
        console.log('✅ Push Notification found in history!');
        console.log(`   - Status: ${foundPush.status}`);
        console.log(`   - Sent Count: ${foundPush.sentCount}`);
    } else {
        console.error('❌ Push Notification NOT found in history.');
    }

    console.log('\n✨ Verification Complete!');
}

runVerification().catch(console.error);
