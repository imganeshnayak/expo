# UMA Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UMA ECOSYSTEM                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐              ┌──────────────────────────┐
│   RIDER/CONSUMER APP     │              │   BUSINESS/MERCHANT APP  │
│      (frontend/)         │              │     (business-app/)      │
├──────────────────────────┤              ├──────────────────────────┤
│                          │              │                          │
│  Tabs:                   │              │  Tabs:                   │
│  ├─ Home 🏠              │              │  ├─ Analytics 📊         │
│  ├─ Categories 🏷️        │              │  ├─ Campaigns 📢         │
│  ├─ Missions 🎯          │              │  ├─ CRM 👥               │
│  ├─ QR Scanner 📱        │              │  └─ Profile 👤           │
│  └─ Profile 👤           │              │                          │
│                          │              │  Screens:                │
│  Features:               │              │  ├─ Customer Detail 👤   │
│  ├─ Ride Booking 🚗      │              │  ├─ Revenue Reports 💰   │
│  ├─ Wallet 💳            │              │  ├─ Campaign Creator ✨  │
│  ├─ Loyalty Cards 🎁     │              │  └─ Profile Mgmt ⚙️      │
│  └─ Deal Scanner 🔍      │              │                          │
│                          │              │  Sample Data:            │
│  Stores:                 │              │  ├─ 50 Customers         │
│  ├─ loyaltyStore         │              │  ├─ 4 Campaigns          │
│  ├─ missionStore         │              │  ├─ 4 Segments           │
│  ├─ rideStore            │              │  └─ AI Recommendations   │
│  └─ walletStore          │              │                          │
└────────────┬─────────────┘              └────────────┬─────────────┘
             │                                         │
             │                                         │
             │    ┌───────────────────────────┐       │
             │    │   SHARED INTEGRATION      │       │
             │    │        LAYER              │       │
             │    ├───────────────────────────┤       │
             │    │                           │       │
             │    │  📄 types.ts              │       │
             │    │  ├─ User                  │       │
             │    │  ├─ Merchant              │       │
             │    │  ├─ Deal                  │       │
             │    │  ├─ StampCard             │       │
             │    │  ├─ Transaction           │       │
             │    │  ├─ Campaign              │       │
             │    │  ├─ CustomerProfile       │       │
             └────┤  └─ BusinessAnalytics     ├───────┘
                  │                           │
                  │  🌐 api.ts                │
                  │  ├─ login()               │
                  │  ├─ getUserProfile()      │
                  │  ├─ getMerchantProfile()  │
                  │  ├─ getDeals()            │
                  │  ├─ getStampCards()       │
                  │  └─ createTransaction()   │
                  │                           │
                  │  🔗 bridge.ts             │
                  │  ├─ EventEmitter          │
                  │  ├─ BridgeEvent enum      │
                  │  ├─ emit() / subscribe()  │
                  │  ├─ Sync Queue            │
                  │  └─ Helper Functions:     │
                  │     ├─ notifyCampaign...  │
                  │     ├─ notifyStampEarned  │
                  │     ├─ notifyDealPubl...  │
                  │     └─ subscribeTo...     │
                  └─────────────┬─────────────┘
                                │
                                │
                   ┌────────────▼────────────┐
                   │   BACKEND API           │
                   │   (Supabase)            │
                   ├─────────────────────────┤
                   │                         │
                   │  Endpoints:             │
                   │  ├─ /auth/login         │
                   │  ├─ /users/:id          │
                   │  ├─ /merchants/:id      │
                   │  ├─ /deals              │
                   │  ├─ /stamps             │
                   │  ├─ /transactions       │
                   │  ├─ /campaigns          │
                   │  └─ /bridge/sync        │
                   │                         │
                   │  Database:              │
                   │  ├─ users               │
                   │  ├─ merchants           │
                   │  ├─ deals               │
                   │  ├─ stamp_cards         │
                   │  ├─ transactions        │
                   │  ├─ campaigns           │
                   │  └─ customer_profiles   │
                   └─────────────────────────┘
```

---

## 🔄 Event Flow Examples

### Example 1: Merchant Creates Campaign

```
┌─────────────────────┐
│  Business App       │
│  (Campaigns Screen) │
└──────────┬──────────┘
           │
           │ 1. Merchant creates campaign
           ▼
    ┌──────────────┐
    │ campaignStore│
    └──────┬───────┘
           │ 2. Save to store
           ▼
    ┌──────────────┐
    │   api.ts     │
    │ createCampaign()
    └──────┬───────┘
           │ 3. POST /campaigns
           ▼
    ┌──────────────┐
    │   Backend    │
    │   Database   │
    └──────┬───────┘
           │ 4. Campaign saved
           ▼
    ┌──────────────┐
    │  bridge.ts   │
    │ notifyCampaignCreated()
    └──────┬───────┘
           │ 5. Emit event
           ▼
    ┌──────────────┐
    │  Rider App   │
    │ (subscribeToCampaignUpdates)
    └──────┬───────┘
           │ 6. Receive event
           ▼
    ┌──────────────┐
    │  Home Screen │
    │ Shows new deal
    └──────────────┘
```

### Example 2: User Earns Stamp

```
┌─────────────────────┐
│   Rider App         │
│   (QR Scanner)      │
└──────────┬──────────┘
           │
           │ 1. User scans QR code
           ▼
    ┌──────────────┐
    │ loyaltyStore │
    └──────┬───────┘
           │ 2. Update stamp count
           ▼
    ┌──────────────┐
    │   api.ts     │
    │ earnStamp()  │
    └──────┬───────┘
           │ 3. POST /stamps/earn
           ▼
    ┌──────────────┐
    │   Backend    │
    │   Database   │
    └──────┬───────┘
           │ 4. Stamp saved
           ▼
    ┌──────────────┐
    │  bridge.ts   │
    │ notifyStampEarned()
    └──────┬───────┘
           │ 5. Emit event
           ▼
    ┌──────────────┐
    │ Business App │
    │ (subscribeToCustomerActivity)
    └──────┬───────┘
           │ 6. Receive event
           ▼
    ┌──────────────┐
    │  CRM Screen  │
    │ Updates customer profile
    └──────────────┘
```

---

## 📱 Navigation Flow

### Rider App Navigation:

```
Home (index.tsx)
├─ Tap Deal → scanner.tsx (QR Scanner)
│  └─ Scan Success → loyalty.tsx (Stamp Card)
├─ Tap Ride → ride-booking.tsx
│  ├─ Confirm → booking-confirmation.tsx
│  ├─ Track → ride-status.tsx
│  └─ Complete → ride-complete.tsx
└─ Tap Mission → missions.tsx
   └─ Complete → Reward Earned

Tabs:
├─ Home 🏠
├─ Categories 🏷️
├─ Missions 🎯
├─ QR Scanner 📱
└─ Profile 👤
```

### Business App Navigation:

```
Analytics (analytics.tsx)
├─ Tab: Overview
├─ Tab: Customers
├─ Tab: Campaigns
└─ Tab: Competitive

Campaigns (campaigns.tsx)
├─ Tap Campaign → View Details
├─ Create Campaign → campaign-creator.tsx
└─ Filter by Status

CRM (crm.tsx)
├─ Tab: Customers
│  └─ Tap Customer → customer-detail.tsx
│     ├─ View Profile
│     ├─ View History
│     └─ Send Message
├─ Tab: Segments
├─ Tab: Communications
└─ Tab: Workflows

Profile (profile.tsx)
├─ Business Info
├─ Settings
└─ Logout

Tabs:
├─ Analytics 📊
├─ Campaigns 📢
├─ CRM 👥
└─ Profile 👤
```

---

## 🗂️ Data Models

### User Model
```typescript
interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Merchant Model
```typescript
interface Merchant {
  id: string;
  name: string;
  businessType: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  rating: number;
  reviewCount: number;
}
```

### Deal Model
```typescript
interface Deal {
  id: string;
  merchantId: string;
  title: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: number;
  validUntil: number;
  status: 'active' | 'expired' | 'paused';
}
```

### StampCard Model
```typescript
interface StampCard {
  id: string;
  merchantId: string;
  userId: string;
  stampsRequired: number;
  stampsCollected: number;
  reward: string;
  status: 'active' | 'completed' | 'redeemed';
}
```

### Campaign Model
```typescript
interface Campaign {
  id: string;
  merchantId: string;
  name: string;
  type: 'discount' | 'loyalty' | 'seasonal' | 'new_customer';
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  budget: { total: number; spent: number };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
}
```

### CustomerProfile Model (CRM)
```typescript
interface CustomerProfile {
  id: string;
  userId: string;
  merchantId: string;
  segment: 'vip' | 'regular' | 'new' | 'at_risk';
  lifetimeValue: number;
  visitCount: number;
  stampCards: { active: StampCard[]; completed: StampCard[] };
  preferences: { timeOfDay: string; dayOfWeek: string[] };
}
```

---

## 🔐 Security Considerations

### API Client (api.ts)
```typescript
// All requests include:
- Authorization header with JWT token
- HTTPS only (enforced by EXPO_PUBLIC_API_URL)
- Request timeout (30 seconds)
- Error handling with sanitized messages
```

### Bridge (bridge.ts)
```typescript
// Events are:
- Validated before emission
- Logged for audit trail
- Synced to backend for persistence
- Rate-limited to prevent spam
```

### Environment Variables
```bash
# .env file (not committed to git)
EXPO_PUBLIC_API_URL=https://api.uma.com
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🚀 Performance Optimizations

### Rider App
- Lazy loading for heavy screens
- Image caching for deals/merchants
- Optimistic UI updates
- Background sync for offline support

### Business App
- Paginated customer lists (50 at a time)
- Virtualized lists for large datasets
- Cached analytics data (5-minute TTL)
- Debounced search inputs

### Shared Layer
- Request batching in API client
- Event queue throttling (max 10 events/second)
- Memoized type guards
- Singleton pattern for bridge instance

---

## 📊 Monitoring & Analytics

### Metrics to Track

**Rider App:**
- Daily active users
- Deals scanned
- Stamps earned
- Rides completed
- Missions completed

**Business App:**
- Campaigns created
- Customer engagement rate
- CRM activity (messages sent, customers viewed)
- Analytics dashboard usage

**Shared Layer:**
- API request latency
- Bridge event throughput
- Error rates
- Cache hit rates

---

**Last Updated**: December 2024  
**Architecture Version**: 2.0  
**Status**: ✅ Production Ready
