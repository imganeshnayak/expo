# UMA Business App - Quick Start Guide

## 🚀 Running the Business App

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Expo Go app on your mobile device (or iOS Simulator/Android Emulator)

### Installation

1. **Navigate to business app directory:**
```bash
cd business-app
```

2. **Install dependencies (if not already done):**
```bash
npm install
```

### Running the App

**Start the development server:**
```bash
npx expo start
```

**Options:**
- Press `i` - Open in iOS Simulator
- Press `a` - Open in Android Emulator
- Scan QR code with Expo Go app on your device

**Run on specific port (if 8081 is busy):**
```bash
npx expo start --port 8082
```

---

## 📱 App Features

### 1. **Analytics Tab**
- Business Intelligence Dashboard
- Revenue, customer, and ROI metrics
- AI-powered recommendations
- Competitive intelligence
- 4 sub-tabs: Overview, Customers, Campaigns, Competitive

### 2. **Campaigns Tab**
- Campaign management interface
- Create, pause, and track campaigns
- ROI and performance metrics
- Budget tracking
- AI optimization suggestions

### 3. **CRM Tab**
- Customer Relationship Management
- Customer list with segments (VIP, Regular, New, At Risk)
- Customer segmentation
- Communication tools
- Automated workflows
- 4 sub-tabs: Customers, Segments, Communications, Workflows

### 4. **Profile Tab**
- Business profile management
- Contact information
- Settings
- Account management

### 5. **Customer Detail Screen**
- Customer 360° view
- Full customer history
- Loyalty status
- Visit history
- Preferences
- Communication options

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `business-app/` directory:

```env
EXPO_PUBLIC_API_URL=https://your-backend-api.com
```

---

## 🧪 Testing the App

### Verify Merchant Features Work:

1. **Analytics Dashboard:**
   - Open Analytics tab
   - Check that metrics display correctly
   - Verify AI recommendations appear
   - Test period filters (Today, Week, Month, Quarter)

2. **Campaign Management:**
   - Open Campaigns tab
   - Verify campaign cards display
   - Check status filters work
   - Tap a campaign to view details

3. **CRM System:**
   - Open CRM tab
   - Verify customer list loads (should show 50 sample customers)
   - Test search functionality
   - Tap a customer to view details
   - Verify segments tab shows 4 segments

4. **Navigation:**
   - Test tab switching
   - Navigate to customer detail from CRM
   - Verify back navigation works

---

## 🛠️ Development

### File Structure

```
business-app/
├── app/
│   ├── _layout.tsx         # Tab navigation layout
│   ├── analytics.tsx       # Analytics Dashboard (1,141 lines)
│   ├── campaigns.tsx       # Campaign Management (650 lines)
│   ├── crm.tsx             # CRM System (1,050 lines)
│   ├── customer-detail.tsx # Customer 360° View
│   └── profile.tsx         # Business Profile
├── store/
│   ├── businessAnalyticsStore.ts  # Analytics state (758 lines)
│   ├── campaignStore.ts           # Campaign state (700 lines)
│   └── crmStore.ts                # CRM state (758 lines)
├── constants/
│   └── theme.ts            # Theme constants
├── assets/
│   └── images/             # App images
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

### Adding New Features

1. **New Screen:** Create in `app/` directory
2. **New Store:** Create in `store/` directory
3. **Shared Logic:** Add to `../shared/` directory
4. **Import Paths:** Use relative paths (e.g., `../store/myStore`)

### Shared Integration

Import shared utilities from parent `shared/` directory:

```typescript
// API Client
import { api } from '../../shared/api';

// Bridge Events
import { UMABridge, notifyCampaignCreated } from '../../shared/bridge';

// Types
import type { User, Merchant, Campaign } from '../../shared/types';
```

---

## 🔄 Cross-App Communication

### Notify Rider App of New Campaign

```typescript
import { notifyCampaignCreated } from '../../shared/bridge';

const publishCampaign = async (campaign: Campaign) => {
  // Save to backend
  await api.createCampaign(campaign);
  
  // Notify rider app
  await notifyCampaignCreated({
    campaignId: campaign.id,
    merchantId: campaign.merchantId,
    dealIds: campaign.dealIds,
    targetSegment: 'vip',
  });
};
```

### Listen for Customer Activity

```typescript
import { UMABridge, subscribeToCustomerActivity } from '../../shared/bridge';

useEffect(() => {
  const unsubscribe = subscribeToCustomerActivity((data) => {
    console.log('Customer activity:', data);
    // Update CRM store
    refreshCustomerData();
  });
  
  return () => unsubscribe();
}, []);
```

---

## 📊 Sample Data

The app includes pre-populated sample data for testing:

### Analytics:
- Mock revenue data
- 1,247 total customers
- 324 new customers this month
- $156,789 revenue
- 7 AI recommendations

### Campaigns:
- 4 sample campaigns (Active, Scheduled, Paused, Completed)
- ROI tracking
- Budget management
- Performance metrics

### CRM:
- 50 sample customers with full profiles
- 4 segments: VIP (10), Regular (25), New (12), At Risk (3)
- Visit history and preferences
- Loyalty stamp cards

---

## 🚨 Troubleshooting

### "Cannot find module" errors
**Solution:** Install dependencies:
```bash
npm install
```

### "Port already in use"
**Solution:** Use a different port:
```bash
npx expo start --port 8082
```

### Import path errors
**Solution:** Use relative paths, not `@/` alias:
```typescript
// ✅ Correct
import { useCRMStore } from '../store/crmStore';

// ❌ Incorrect  
import { useCRMStore } from '@/store/crmStore';
```

### TypeScript errors
**Solution:** Restart TypeScript server in VS Code:
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type "TypeScript: Restart TS Server"
- Press Enter

### App crashes on startup
**Solution:** Clear Expo cache:
```bash
npx expo start --clear
```

---

## 📱 Building for Production

### Build for Android:
```bash
eas build --platform android
```

### Build for iOS:
```bash
eas build --platform ios
```

### Configure EAS Build:

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure build:**
```bash
eas build:configure
```

4. **Run build:**
```bash
eas build --platform all
```

---

## 📚 Related Documentation

- **Main README**: `../README.md` - Dual app architecture overview
- **Rider App**: `../frontend/` - Consumer-facing app
- **Shared Layer**: `../shared/` - API client, bridge, types
- **Business Analytics Guide**: `../frontend/BUSINESS_ANALYTICS_GUIDE.md`

---

## 🤝 Support

For issues or questions:
1. Check the main README.md
2. Review troubleshooting section above
3. Contact the development team

---

**Happy Building! 🎉**
