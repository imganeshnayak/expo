const testAuth = async () => {
    const baseUrl = 'http://localhost:5000/api/auth';

    // 1. Register
    console.log('Testing Register...');
    const registerRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test User 2',
            email: `test${Date.now()}@example.com`, // Unique email
            phone: `123${Date.now().toString().slice(-7)}`, // Unique phone
            password: 'password123'
        })
    });
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);

    if (registerRes.status !== 201) return;

    const token = registerData.token;

    // 2. Login
    console.log('\nTesting Login...');
    const loginRes = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: registerData.email,
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);

    // 3. Get Me
    console.log('\nTesting Get Me...');
    const meRes = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const meData = await meRes.json();
    console.log('Get Me Status:', meRes.status);
    console.log('Get Me Response:', meData);

    // 4. Get Wallet (Initial)
    console.log('\nTesting Get Wallet (Initial)...');
    const walletRes = await fetch('http://localhost:5000/api/wallet', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (walletRes.status !== 200) {
        const text = await walletRes.text();
        console.log('Get Wallet Error:', text);
        return;
    }

    const walletData = await walletRes.json();
    console.log('Get Wallet Status:', walletRes.status);
    console.log('Wallet Balance:', walletData.balance);

    // 5. Top Up Wallet
    console.log('\nTesting Top Up Wallet (500)...');
    const topUpRes = await fetch('http://localhost:5000/api/wallet/topup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 500 })
    });
    const topUpData = await topUpRes.json();
    console.log('Top Up Status:', topUpRes.status);
    console.log('New Balance:', topUpData.balance);

    // 6. Withdraw Wallet
    console.log('\nTesting Withdraw Wallet (200)...');
    const withdrawRes = await fetch('http://localhost:5000/api/wallet/withdraw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 200 })
    });
    const withdrawData = await withdrawRes.json();
    console.log('Withdraw Status:', withdrawRes.status);
    console.log('Final Balance:', withdrawData.balance);

    // 7. Create Deal
    console.log('\nTesting Create Deal...');
    const createDealRes = await fetch('http://localhost:5000/api/deals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: '50% Off Pizza',
            description: 'Get half price on all large pizzas',
            category: 'Food',
            type: 'percentage',
            discount: { value: 50 },
            validUntil: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        })
    });
    const createDealData = await createDealRes.json();
    console.log('Create Deal Status:', createDealRes.status);
    console.log('Deal ID:', createDealData._id);

    // 8. Get Deals
    console.log('\nTesting Get Deals...');
    const getDealsRes = await fetch('http://localhost:5000/api/deals', {
        method: 'GET'
    });
    const getDealsData = await getDealsRes.json();
    console.log('Get Deals Status:', getDealsRes.status);
    console.log('Deals Count:', getDealsData.length);

    // 9. ONDC Retail Search (Client Trigger)
    console.log('\nTesting ONDC Retail Search...');
    const searchRes = await fetch('http://localhost:5000/api/ondc/retail/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: 'Pizza',
            location: '12.9716,77.5946'
        })
    });
    const searchData = await searchRes.json();
    console.log('Search Status:', searchRes.status);
    console.log('Search Context:', searchData.context?.action);

    // 10. ONDC on_search (Mock Callback from Magicpin)
    console.log('\nTesting ONDC on_search (Callback)...');
    const onSearchRes = await fetch('http://localhost:5000/api/ondc/retail/on_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            context: {
                domain: 'ONDC:RET11',
                action: 'on_search',
                bpp_id: 'magicpin-bpp',
                message_id: searchData.context?.message_id
            },
            message: {
                catalog: {
                    'bpp/providers': [{
                        descriptor: { name: 'Dominos Pizza' },
                        items: [
                            { descriptor: { name: 'Farmhouse Pizza' }, price: { value: '450' } },
                            { descriptor: { name: 'Peppy Paneer' }, price: { value: '399' } }
                        ]
                    }]
                }
            }
        })
    });
    const onSearchData = await onSearchRes.json();
    console.log('on_search Status:', onSearchRes.status);
    console.log('on_search Ack:', onSearchData.message?.ack?.status);

    // 11. Ride Search (ONDC Mobility)
    console.log('\nTesting Ride Search...');
    const rideSearchRes = await fetch('http://localhost:5000/api/rides/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            pickup: '12.9716,77.5946',
            destination: '12.9279,77.6271'
        })
    });
    const rideSearchData = await rideSearchRes.json();
    console.log('Ride Search Status:', rideSearchRes.status);
    console.log('Ride Search Context:', rideSearchData.context?.action);

    // 12. Book Ride
    console.log('\nTesting Book Ride...');
    const bookRideRes = await fetch('http://localhost:5000/api/rides/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            providerId: 'namma-yatri',
            pickup: '12.9716,77.5946',
            destination: '12.9279,77.6271',
            price: 150
        })
    });
    const bookRideData = await bookRideRes.json();
    console.log('Book Ride Status:', bookRideRes.status);
    console.log('Ride ID:', bookRideData._id);

    // 13. Get Active Ride
    console.log('\nTesting Get Active Ride...');
    const activeRideRes = await fetch('http://localhost:5000/api/rides/active', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const activeRideData = await activeRideRes.json();
    console.log('Active Ride Status:', activeRideRes.status);
    console.log('Ride Status:', activeRideData.status);

    // 14. Create Mission (Admin)
    console.log('\nTesting Create Mission...');
    const createMissionRes = await fetch('http://localhost:5000/api/loyalty/missions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: 'First Ride Bonus',
            description: 'Complete your first ride to earn points',
            type: 'ride_count',
            requirement: 1,
            rewardPoints: 100,
            icon: 'star'
        })
    });
    const createMissionData = await createMissionRes.json();
    console.log('Create Mission Status:', createMissionRes.status);
    console.log('Mission ID:', createMissionData._id);

    // 15. Get Missions
    console.log('\nTesting Get Missions...');
    const getMissionsRes = await fetch('http://localhost:5000/api/loyalty/missions', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const getMissionsData = await getMissionsRes.json();
    console.log('Get Missions Status:', getMissionsRes.status);
    console.log('Missions Count:', getMissionsData.length);

    // 16. Claim Reward
    console.log('\nTesting Claim Reward...');
    const claimRes = await fetch(`http://localhost:5000/api/loyalty/claim/${createMissionData._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const claimData = await claimRes.json();
    console.log('Claim Status:', claimRes.status);
    console.log('New Points:', claimData.points);

    // 17. Get Loyalty Profile
    console.log('\nTesting Get Loyalty Profile...');
    const profileRes = await fetch('http://localhost:5000/api/loyalty', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    console.log('Profile Status:', profileRes.status);
    console.log('Points:', profileData.points);
    console.log('History Count:', profileData.history.length);
};

testAuth();
