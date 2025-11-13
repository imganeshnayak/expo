# Backend Integration Guide

This guide explains how to integrate the UMA dual-app system with your backend API.

---

## 📋 Prerequisites

- Backend API server running (Node.js/Express, Django, Rails, etc.)
- Database configured (PostgreSQL, MongoDB, MySQL, etc.)
- Authentication system implemented (JWT recommended)
- HTTPS enabled for production

---

## 🔗 API Endpoints Required

### Authentication Endpoints

#### POST `/auth/login`
```json
Request:
{
  "phone": "+1234567890",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST `/auth/register`
```json
Request:
{
  "phone": "+1234567890",
  "password": "password123",
  "name": "John Doe",
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "data": {
    "token": "...",
    "user": { ... }
  }
}
```

---

### User Endpoints

#### GET `/users/:id`
```json
Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "user123",
    "phone": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "createdAt": 1699900800000,
    "updatedAt": 1699900800000
  }
}
```

#### PUT `/users/:id`
```json
Request:
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

---

### Merchant Endpoints

#### GET `/merchants/:id`
```json
Response:
{
  "success": true,
  "data": {
    "id": "merch123",
    "name": "Joe's Coffee Shop",
    "businessType": "Café",
    "address": "123 Main St",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "rating": 4.5,
    "reviewCount": 234
  }
}
```

#### GET `/merchants?category=:category&location=:location`
```json
Response:
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

---

### Deal Endpoints

#### GET `/deals?merchantId=:merchantId`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "deal123",
      "merchantId": "merch456",
      "merchantName": "Joe's Coffee Shop",
      "title": "20% Off Coffee",
      "description": "Get 20% off any coffee drink",
      "discount": 20,
      "discountType": "percentage",
      "category": "Food & Drink",
      "validFrom": 1699900800000,
      "validUntil": 1702492800000,
      "status": "active",
      "maxRedemptions": 100,
      "currentRedemptions": 45
    }
  ]
}
```

#### POST `/deals/:id/claim`
```json
Request:
{
  "userId": "user123"
}

Response:
{
  "success": true,
  "data": {
    "dealId": "deal123",
    "userId": "user123",
    "claimedAt": 1699900800000,
    "expiresAt": 1702492800000
  }
}
```

---

### Stamp Card Endpoints

#### GET `/stamps?userId=:userId`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "stamp123",
      "merchantId": "merch456",
      "merchantName": "Joe's Coffee Shop",
      "userId": "user123",
      "stampsRequired": 10,
      "stampsCollected": 7,
      "reward": "Free Coffee",
      "status": "active",
      "expiresAt": 1702492800000,
      "createdAt": 1699900800000
    }
  ]
}
```

#### POST `/stamps/:id/earn`
```json
Request:
{
  "userId": "user123",
  "merchantId": "merch456"
}

Response:
{
  "success": true,
  "data": {
    "stampCardId": "stamp123",
    "stampsCollected": 8,
    "stampsRequired": 10,
    "isComplete": false
  }
}
```

#### POST `/stamps/:id/redeem`
```json
Request:
{
  "userId": "user123"
}

Response:
{
  "success": true,
  "data": {
    "stampCardId": "stamp123",
    "redeemedAt": 1699900800000,
    "reward": "Free Coffee"
  }
}
```

---

### Transaction Endpoints

#### GET `/transactions?userId=:userId`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "txn123",
      "userId": "user123",
      "merchantId": "merch456",
      "merchantName": "Joe's Coffee Shop",
      "type": "deal_used",
      "amount": 5.99,
      "description": "Used 20% off coffee deal",
      "timestamp": 1699900800000
    }
  ]
}
```

#### POST `/transactions`
```json
Request:
{
  "userId": "user123",
  "merchantId": "merch456",
  "type": "stamp_earned",
  "amount": 0,
  "description": "Earned stamp at Joe's Coffee Shop",
  "metadata": {
    "stampCardId": "stamp123"
  }
}

Response:
{
  "success": true,
  "data": { ... }
}
```

---

### Campaign Endpoints (Business App)

#### GET `/campaigns?merchantId=:merchantId`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "camp123",
      "merchantId": "merch456",
      "name": "Summer Promotion",
      "type": "seasonal",
      "status": "active",
      "budget": {
        "total": 5000,
        "spent": 2345,
        "dailyLimit": 200
      },
      "performance": {
        "impressions": 15234,
        "clicks": 1234,
        "conversions": 234,
        "revenue": 3456,
        "roi": 147.5
      },
      "schedule": {
        "startDate": 1699900800000,
        "endDate": 1702492800000
      }
    }
  ]
}
```

#### POST `/campaigns`
```json
Request:
{
  "merchantId": "merch456",
  "name": "Summer Promotion",
  "type": "seasonal",
  "targetAudience": {
    "segmentIds": ["seg1", "seg2"],
    "location": "San Francisco"
  },
  "budget": {
    "total": 5000,
    "dailyLimit": 200
  },
  "schedule": {
    "startDate": 1699900800000,
    "endDate": 1702492800000
  }
}

Response:
{
  "success": true,
  "data": { ... }
}
```

---

### CRM Endpoints (Business App)

#### GET `/crm/customers?merchantId=:merchantId`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "cust123",
      "userId": "user123",
      "merchantId": "merch456",
      "phone": "+1234567890",
      "name": "John Doe",
      "segment": "vip",
      "lifetimeValue": 1234.56,
      "averageSpend": 45.67,
      "visitCount": 27,
      "firstVisit": 1699000000000,
      "lastVisit": 1699900800000,
      "stampCards": {
        "active": [ ... ],
        "completed": [ ... ]
      }
    }
  ]
}
```

#### GET `/crm/customers/:id`
```json
Response:
{
  "success": true,
  "data": {
    "id": "cust123",
    "userId": "user123",
    "merchantId": "merch456",
    "phone": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "segment": "vip",
    "lifetimeValue": 1234.56,
    "averageSpend": 45.67,
    "visitCount": 27,
    "firstVisit": 1699000000000,
    "lastVisit": 1699900800000,
    "favoriteItems": ["Latte", "Croissant"],
    "preferences": {
      "timeOfDay": "morning",
      "dayOfWeek": ["Monday", "Wednesday", "Friday"]
    },
    "communication": {
      "pushEnabled": true,
      "smsEnabled": false,
      "lastContact": 1699800000000
    },
    "tags": ["frequent", "high-value"]
  }
}
```

---

### Analytics Endpoints (Business App)

#### GET `/analytics?merchantId=:merchantId&period=:period`
```json
Response:
{
  "success": true,
  "data": {
    "merchantId": "merch456",
    "period": "month",
    "overview": {
      "totalCustomers": 1247,
      "newCustomers": 324,
      "returningCustomers": 923,
      "totalRevenue": 156789,
      "averageOrderValue": 42.34,
      "customersTrend": 12.5,
      "revenueTrend": 8.7
    },
    "customerInsights": { ... },
    "campaignPerformance": { ... },
    "competitiveIntelligence": { ... }
  }
}
```

---

### Bridge Sync Endpoint

#### POST `/bridge/sync`
```json
Request:
{
  "event": "CAMPAIGN_CREATED",
  "data": {
    "campaignId": "camp123",
    "merchantId": "merch456",
    "dealIds": ["deal1", "deal2"],
    "targetSegment": "vip"
  },
  "timestamp": 1699900800000
}

Response:
{
  "success": true,
  "message": "Event synced successfully"
}
```

---

## 🔐 Authentication

### JWT Token Flow

1. **User Login:**
   - User enters phone/password
   - App calls `POST /auth/login`
   - Backend returns JWT token
   - App stores token in AsyncStorage

2. **Authenticated Requests:**
   ```typescript
   // In shared/api.ts
   const token = await AsyncStorage.getItem('authToken');
   const response = await fetch(url, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

3. **Token Refresh:**
   ```typescript
   // POST /auth/refresh
   {
     "refreshToken": "..."
   }
   ```

---

## 🔄 Bridge Event Flow

### Backend Implementation

```javascript
// Express.js example
app.post('/bridge/sync', async (req, res) => {
  const { event, data, timestamp } = req.body;
  
  // Log event for audit
  await EventLog.create({ event, data, timestamp });
  
  // Process event based on type
  switch (event) {
    case 'CAMPAIGN_CREATED':
      // Notify relevant users via push notifications
      await notifyTargetedUsers(data);
      break;
      
    case 'CUSTOMER_STAMP_EARNED':
      // Update customer profile
      await updateCustomerProfile(data);
      break;
      
    // ... other events
  }
  
  res.json({ success: true, message: 'Event synced' });
});
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  avatar TEXT,
  created_at BIGINT,
  updated_at BIGINT
);
```

### Merchants Table
```sql
CREATE TABLE merchants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  review_count INT,
  created_at BIGINT,
  updated_at BIGINT
);
```

### Deals Table
```sql
CREATE TABLE deals (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount INT,
  discount_type VARCHAR(20),
  category VARCHAR(100),
  valid_from BIGINT,
  valid_until BIGINT,
  max_redemptions INT,
  current_redemptions INT DEFAULT 0,
  status VARCHAR(20),
  created_at BIGINT
);
```

### Stamp Cards Table
```sql
CREATE TABLE stamp_cards (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id),
  user_id VARCHAR(255) REFERENCES users(id),
  stamps_required INT,
  stamps_collected INT DEFAULT 0,
  reward VARCHAR(255),
  status VARCHAR(20),
  expires_at BIGINT,
  created_at BIGINT,
  completed_at BIGINT,
  redeemed_at BIGINT
);
```

### Campaigns Table
```sql
CREATE TABLE campaigns (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20),
  budget_total DECIMAL(10, 2),
  budget_spent DECIMAL(10, 2) DEFAULT 0,
  start_date BIGINT,
  end_date BIGINT,
  created_at BIGINT,
  updated_at BIGINT
);
```

---

## 🚀 Integration Steps

### Step 1: Set Environment Variables

**Frontend (.env):**
```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Business App (.env):**
```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 2: Update API Client

The `shared/api.ts` file is already configured. Just ensure your backend URLs match:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

### Step 3: Implement Authentication

```typescript
// In your login component
import { api } from '../../shared/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  const response = await api.login(phone, password);
  if (response.success && response.data) {
    await AsyncStorage.setItem('authToken', response.data.token);
    // Navigate to home
  }
};
```

### Step 4: Test Endpoints

Use Postman or curl to test each endpoint:

```bash
# Test login
curl -X POST https://api.yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "test123"}'

# Test get user (with token)
curl -X GET https://api.yourdomain.com/users/user123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Backend Examples

### Node.js/Express Example

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  
  // Verify credentials
  const user = await User.findByPhone(phone);
  if (!user || !await user.verifyPassword(password)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  
  res.json({
    success: true,
    data: { token, user }
  });
});

// Protected route middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Get user profile
app.get('/users/:id', authenticate, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ success: true, data: user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## ✅ Testing Checklist

- [ ] Authentication endpoints work
- [ ] User CRUD operations work
- [ ] Merchant endpoints return data
- [ ] Deal creation and claiming work
- [ ] Stamp card earn/redeem work
- [ ] Campaign endpoints work (Business App)
- [ ] CRM endpoints work (Business App)
- [ ] Analytics endpoints work (Business App)
- [ ] Bridge sync endpoint works
- [ ] JWT authentication works
- [ ] Error handling returns proper messages
- [ ] HTTPS enabled in production

---

## 🐛 Common Issues

### CORS Errors
```javascript
// Add CORS middleware
const cors = require('cors');
app.use(cors({
  origin: '*', // Configure properly for production
  credentials: true
}));
```

### Token Expiration
```typescript
// In api.ts, add token refresh logic
if (response.status === 401) {
  // Refresh token
  const newToken = await refreshToken();
  // Retry request
}
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

**Integration Status**: Ready for implementation  
**Documentation Version**: 1.0  
**Last Updated**: November 2025
