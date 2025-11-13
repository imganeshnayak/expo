# UMA Ecosystem - Dual App Architecture

This repository contains two separate Expo applications that form the **UMA (Urban Mobility & Amenities)** ecosystem:

## 📱 Applications

### 1. **Rider/Consumer App** (`frontend/`)
The consumer-facing application for end users.

**Features:**
- Ride booking and tracking
- QR code scanning for deals/loyalty
- Wallet management
- Loyalty stamp cards
- Mission/gamification system
- Category browsing
- Profile management

**Tech Stack:**
- Expo Router v6.0.8 (file-based routing)
- React Native 0.81.4
- TypeScript 5.9.2
- Zustand 5.0.8 (state management)
- Supabase (backend)

**Run the app:**
```bash
cd frontend
npm install
npx expo start
```

---

### 2. **Business/Merchant App** (`business-app/`)
The merchant-facing application for business owners.

**Features:**
- Business Analytics Dashboard (revenue, customers, ROI)
- Campaign Management (create, track, optimize campaigns)
- CRM System (customer profiles, segments, communications)
- Customer 360° View (detailed customer insights)
- AI-powered recommendations
- Revenue reports

**Tech Stack:**
- Expo Router v6.0.8
- React Native 0.81.4
- TypeScript 5.9.2
- Zustand 5.0.8
- Shared API client

**Run the app:**
```bash
cd business-app
npm install
npx expo start
```

---

## 🔗 Shared Integration Layer (`shared/`)

Both apps share common utilities and integration code:

### **1. API Client** (`shared/api.ts`)
Centralized API client for backend communication.

**Usage:**
```typescript
import { api } from '../../shared/api';

// Login
const response = await api.login(phone, password);

// Get user profile
const user = await api.getUserProfile(userId);

// Get merchant deals
const deals = await api.getDeals(merchantId);
```

### **2. Bridge** (`shared/bridge.ts`)
Event-driven communication layer for cross-app data synchronization.

**Events:**
- `CAMPAIGN_CREATED` - Merchant creates campaign → Rider app receives new deals
- `CUSTOMER_STAMP_EARNED` - User earns stamp → Business app updates CRM
- `DEAL_PUBLISHED` - Merchant publishes deal → Rider app shows in feed
- `DEAL_CLAIMED` - User claims deal → Business app tracks conversion
- `CUSTOMER_VISIT` - User visits merchant → Business app records visit

**Usage in Business App:**
```typescript
import { UMABridge, notifyCampaignCreated } from '../../shared/bridge';

// Notify rider app when campaign is created
await notifyCampaignCreated({
  campaignId: 'camp123',
  merchantId: 'merch456',
  dealIds: ['deal1', 'deal2'],
  targetSegment: 'vip',
});
```

**Usage in Rider App:**
```typescript
import { UMABridge, subscribeToCampaignUpdates } from '../../shared/bridge';

// Listen for new campaigns
subscribeToCampaignUpdates((data) => {
  console.log('New campaign available:', data);
  // Refresh deals list
});
```

### **3. Shared Types** (`shared/types.ts`)
TypeScript type definitions used across both apps.

**Key Types:**
- `User`, `Merchant`
- `Deal`, `StampCard`
- `Transaction`, `Notification`
- `Campaign`, `CustomerProfile`
- `BusinessAnalytics`
- `ApiResponse<T>`, `PaginatedResponse<T>`

---

## 🏗️ Architecture

```
┌──────────────────┐         ┌──────────────────┐
│   Rider App      │         │  Business App    │
│   (frontend/)    │         │  (business-app/) │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │   ┌────────────────┐       │
         └───┤  Shared Layer  ├───────┘
             │   (shared/)    │
             └────────┬───────┘
                      │
             ┌────────▼────────┐
             │  Backend API    │
             │   (Supabase)    │
             └─────────────────┘
```

### Key Principles:
1. **Separation of Concerns**: Consumer and merchant features in separate apps
2. **Code Reuse**: Shared utilities, types, and API client
3. **Event-Driven Sync**: Real-time updates via bridge pattern
4. **Independent Deployment**: Each app can be built/released separately
5. **Type Safety**: Shared TypeScript types ensure consistency

---

## 📂 Project Structure

```
expo/
├── frontend/                    # Rider/Consumer App
│   ├── app/
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Home
│   │   │   ├── categories.tsx  # Categories
│   │   │   ├── missions.tsx    # Missions
│   │   │   ├── qr.tsx          # QR Scanner
│   │   │   └── profile.tsx     # User Profile
│   │   ├── ride-booking.tsx    # Ride features
│   │   ├── wallet.tsx          # Wallet
│   │   └── loyalty.tsx         # Loyalty cards
│   ├── store/                  # Zustand stores
│   ├── constants/              # Theme, config
│   └── package.json
│
├── business-app/               # Business/Merchant App
│   ├── app/
│   │   ├── analytics.tsx       # Analytics Dashboard
│   │   ├── campaigns.tsx       # Campaign Management
│   │   ├── crm.tsx             # CRM System
│   │   ├── customer-detail.tsx # Customer 360°
│   │   ├── profile.tsx         # Business Profile
│   │   └── _layout.tsx         # Tab navigation
│   ├── store/                  # Business-specific stores
│   ├── constants/              # Theme
│   └── package.json
│
└── shared/                     # Shared Integration Layer
    ├── api.ts                  # API Client
    ├── bridge.ts               # Event Bridge
    └── types.ts                # TypeScript Types
```

---

## 🚀 Development Workflow

### Setting Up Both Apps

1. **Install dependencies for Rider App:**
```bash
cd frontend
npm install
```

2. **Install dependencies for Business App:**
```bash
cd business-app
npm install
```

3. **Environment Variables:**
Create `.env` files in each app directory:
```env
EXPO_PUBLIC_API_URL=https://your-backend-api.com
```

### Running Apps

**Run Rider App:**
```bash
cd frontend
npx expo start
```

**Run Business App:**
```bash
cd business-app
npx expo start
```

**Run both simultaneously** (different terminals):
```bash
# Terminal 1
cd frontend && npx expo start

# Terminal 2
cd business-app && npx expo start --port 8082
```

---

## 🔄 Cross-App Communication Examples

### Example 1: Merchant Creates Campaign
```typescript
// In Business App (business-app/app/campaigns.tsx)
import { notifyCampaignCreated } from '../../shared/bridge';

const publishCampaign = async (campaign: Campaign) => {
  // Publish to backend
  await api.createCampaign(campaign);
  
  // Notify rider app
  await notifyCampaignCreated({
    campaignId: campaign.id,
    merchantId: campaign.merchantId,
    dealIds: campaign.dealIds,
    targetSegment: campaign.targetAudience.segmentIds[0],
  });
};
```

### Example 2: User Earns Stamp
```typescript
// In Rider App (frontend/app/loyalty.tsx)
import { notifyStampEarned } from '../../shared/bridge';

const earnStamp = async (stampCard: StampCard) => {
  // Update user's stamp card
  await api.earnStamp(stampCard.id);
  
  // Notify business app for CRM tracking
  await notifyStampEarned({
    userId: currentUser.id,
    merchantId: stampCard.merchantId,
    stampCardId: stampCard.id,
    stampsCollected: stampCard.stampsCollected + 1,
  });
};
```

---

## 📊 Data Flow

### Campaign Creation Flow:
1. Merchant creates campaign in **Business App**
2. Campaign saved to backend via `api.createCampaign()`
3. Bridge emits `CAMPAIGN_CREATED` event
4. **Rider App** receives event via subscription
5. Rider App fetches new deals and updates UI

### Stamp Earn Flow:
1. User scans QR code in **Rider App**
2. Stamp earned via `api.earnStamp()`
3. Bridge emits `CUSTOMER_STAMP_EARNED` event
4. **Business App** receives event
5. Business App updates customer profile in CRM

---

## 🧪 Testing

### Test Rider App:
```bash
cd frontend
npx expo start
# Press 'i' for iOS, 'a' for Android
```

**Verify:**
- ✅ No Business Portal in Profile screen
- ✅ Consumer features only (rides, wallet, missions, loyalty)
- ✅ QR scanner works

### Test Business App:
```bash
cd business-app
npx expo start
# Press 'i' for iOS, 'a' for Android
```

**Verify:**
- ✅ 4 tabs: Analytics, Campaigns, CRM, Profile
- ✅ Analytics dashboard loads with sample data
- ✅ Campaign management works
- ✅ CRM shows customer list
- ✅ Navigation to customer detail works

---

## 🔧 Troubleshooting

### "Cannot find module '@/store/...'"
**Solution:** Import paths were updated to use relative paths. Use:
```typescript
// ✅ Correct
import { useCRMStore } from '../store/crmStore';

// ❌ Incorrect
import { useCRMStore } from '@/store/crmStore';
```

### "Shared module not found"
**Solution:** Import from `../../shared/`:
```typescript
import { api } from '../../shared/api';
import { UMABridge } from '../../shared/bridge';
import type { User, Merchant } from '../../shared/types';
```

### "Port already in use"
**Solution:** Run apps on different ports:
```bash
npx expo start --port 8081  # Rider App
npx expo start --port 8082  # Business App
```

---

## 📝 Development Guidelines

### When Adding New Features:

1. **Consumer Feature** → Add to `frontend/app/`
2. **Merchant Feature** → Add to `business-app/app/`
3. **Shared Logic** → Add to `shared/`
4. **Cross-App Communication** → Use bridge events

### When Creating New Stores:

- **Rider-specific stores** → `frontend/store/`
- **Business-specific stores** → `business-app/store/`
- Import using relative paths: `import { useStore } from '../store/myStore'`

### When Adding Bridge Events:

1. Add event type to `BridgeEvent` enum in `shared/bridge.ts`
2. Create helper functions (e.g., `notifyEventName`, `subscribeToEvent`)
3. Emit from source app
4. Subscribe in receiving app

---

## 🚢 Deployment

### Build Rider App:
```bash
cd frontend
eas build --platform android
eas build --platform ios
```

### Build Business App:
```bash
cd business-app
eas build --platform android
eas build --platform ios
```

---

## 📚 Additional Documentation

- **Business Analytics Guide**: `frontend/BUSINESS_ANALYTICS_GUIDE.md`
- **Missions System**: `frontend/MISSIONS_GUIDE.md`
- **ONDC Integration**: `frontend/ONDC_INTEGRATION.md`
- **User Flow Guide**: `frontend/USER_FLOW_GUIDE.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

UMA Development Team - Building the future of urban mobility and local commerce

---

**Questions?** Contact the development team or check the documentation files in each app directory.
