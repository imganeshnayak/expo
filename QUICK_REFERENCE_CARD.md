# UMA Quick Reference Card

## 🚀 Quick Start

### Run Rider App
```bash
cd frontend && npx expo start
```

### Run Business App
```bash
cd business-app && npx expo start
```

### Run Both Apps
```bash
# Terminal 1
cd frontend && npx expo start

# Terminal 2
cd business-app && npx expo start --port 8082
```

---

## 📂 Directory Structure Cheat Sheet

```
expo/
├── frontend/           # Rider/Consumer App
│   ├── app/(tabs)/    # Tab screens (Home, Categories, etc.)
│   └── store/         # Consumer stores (loyalty, ride, wallet)
│
├── business-app/      # Business/Merchant App
│   ├── app/          # Business screens (Analytics, CRM, etc.)
│   └── store/        # Business stores (analytics, campaigns, crm)
│
└── shared/           # Integration Layer
    ├── api.ts        # API Client
    ├── bridge.ts     # Event Bridge
    └── types.ts      # TypeScript Types
```

---

## 🔧 Common Commands

### Install Dependencies
```bash
# Rider App
cd frontend && npm install

# Business App
cd business-app && npm install
```

### Clear Cache
```bash
npx expo start --clear
```

### Build Apps
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

### TypeScript Check
```bash
npm run typecheck
```

---

## 📝 Import Patterns

### In Rider App (frontend/)
```typescript
// Local stores
import { useLoyaltyStore } from '../store/loyaltyStore';

// Constants
import { theme } from '../constants/theme';

// Shared layer
import { api } from '../../shared/api';
import { UMABridge } from '../../shared/bridge';
import type { User, Deal } from '../../shared/types';
```

### In Business App (business-app/)
```typescript
// Local stores
import { useCRMStore } from '../store/crmStore';

// Constants
import { theme } from '../constants/theme';

// Shared layer
import { api } from '../../shared/api';
import { UMABridge, notifyCampaignCreated } from '../../shared/bridge';
import type { Merchant, Campaign } from '../../shared/types';
```

---

## 🌐 API Client Usage

### Authentication
```typescript
import { api } from '../../shared/api';

const response = await api.login(phone, password);
if (response.success && response.data) {
  const user = response.data;
  // Save user to store
}
```

### Get User Profile
```typescript
const response = await api.getUserProfile(userId);
if (response.success && response.data) {
  const user = response.data;
}
```

### Get Merchant Deals
```typescript
const response = await api.getDeals(merchantId);
if (response.success && response.data) {
  const deals = response.data;
}
```

### Create Transaction
```typescript
const response = await api.createTransaction({
  userId: user.id,
  merchantId: merchant.id,
  type: 'deal_used',
  amount: 10,
  description: 'Used 10% off coupon',
});
```

---

## 🔗 Bridge Events Reference

### Event Types
```typescript
enum BridgeEvent {
  CAMPAIGN_CREATED       // Merchant creates campaign
  CAMPAIGN_UPDATED       // Merchant updates campaign
  DEAL_PUBLISHED         // Merchant publishes deal
  DEAL_CLAIMED           // User claims deal
  CUSTOMER_STAMP_EARNED  // User earns stamp
  CUSTOMER_VISIT         // User visits merchant
  REWARD_REDEEMED        // User redeems reward
  SYNC_REQUEST           // Manual sync requested
  SYNC_COMPLETE          // Sync completed
}
```

### Emit Events (from source app)
```typescript
import { UMABridge, notifyCampaignCreated } from '../../shared/bridge';

// Notify campaign created
await notifyCampaignCreated({
  campaignId: 'camp123',
  merchantId: 'merch456',
  dealIds: ['deal1', 'deal2'],
  targetSegment: 'vip',
});

// Notify stamp earned
await notifyStampEarned({
  userId: 'user123',
  merchantId: 'merch456',
  stampCardId: 'stamp789',
  stampsCollected: 5,
});

// Notify deal published
await notifyDealPublished({
  dealId: 'deal123',
  merchantId: 'merch456',
  discount: 20,
  validUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
});
```

### Subscribe to Events (in receiving app)
```typescript
import { UMABridge, subscribeToCampaignUpdates } from '../../shared/bridge';

useEffect(() => {
  // Subscribe to campaign updates
  const unsubscribe = subscribeToCampaignUpdates((data) => {
    console.log('New campaign:', data);
    // Refresh deals list
    fetchDeals();
  });
  
  return () => unsubscribe();
}, []);
```

---

## 📊 Common Store Patterns

### Zustand Store Template
```typescript
import { create } from 'zustand';

interface MyStore {
  data: any[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  reset: () => void;
}

export const useMyStore = create<MyStore>((set, get) => ({
  data: [],
  isLoading: false,
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getData();
      if (response.success && response.data) {
        set({ data: response.data, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },
  
  reset: () => set({ data: [], isLoading: false }),
}));
```

### Using Store in Component
```typescript
import { useMyStore } from '../store/myStore';

function MyComponent() {
  const { data, isLoading, fetchData } = useMyStore();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (isLoading) return <Text>Loading...</Text>;
  
  return (
    <View>
      {data.map(item => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </View>
  );
}
```

---

## 🎨 Theme Usage

```typescript
import { theme } from '../constants/theme';

<View style={{ backgroundColor: theme.colors.primary }}>
  <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.lg }}>
    Hello World
  </Text>
</View>
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Tests (Detox)
```bash
# Build
detox build --configuration ios.sim.debug

# Run
detox test --configuration ios.sim.debug
```

---

## 🐛 Debugging

### Enable Debug Mode
```bash
# Set DEBUG env variable
DEBUG=* npx expo start
```

### View Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Remote Debugging
1. Start app in dev mode
2. Shake device
3. Select "Debug Remote JS"
4. Open `http://localhost:8081/debugger-ui`

---

## 🔐 Environment Variables

### .env file
```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.uma.com

# Supabase (if used)
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Analytics (if used)
EXPO_PUBLIC_ANALYTICS_KEY=...
```

### Access in Code
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🚨 Common Issues & Solutions

### "Cannot find module"
**Solution:**
```bash
rm -rf node_modules
npm install
```

### "Port already in use"
**Solution:**
```bash
npx expo start --port 8082
```

### Import path errors
**Solution:** Use relative paths, not `@/` alias
```typescript
// ✅ Correct
import { useStore } from '../store/myStore';

// ❌ Incorrect
import { useStore } from '@/store/myStore';
```

### TypeScript errors
**Solution:** Restart TS Server
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type "TypeScript: Restart TS Server"

### Metro bundler cache issues
**Solution:**
```bash
npx expo start --clear
```

---

## 📚 File Templates

### New Screen Template
```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function MyScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Fetch data on mount
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Text>My Screen</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### New Store Template
```typescript
import { create } from 'zustand';

interface MyStore {
  items: any[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
}

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  isLoading: false,
  
  fetchItems: async () => {
    set({ isLoading: true });
    // Fetch logic here
    set({ isLoading: false });
  },
}));
```

---

## 🔄 Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Commit Changes
```bash
git add .
git commit -m "feat: add my feature"
```

### Push to Remote
```bash
git push origin feature/my-feature
```

### Common Commit Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Add/update tests
- `chore:` Maintenance tasks

---

## 📱 App Navigation Shortcuts

### Rider App Tabs
- **Home** → `index.tsx`
- **Categories** → `categories.tsx`
- **Missions** → `missions.tsx`
- **QR** → `qr.tsx`
- **Profile** → `profile.tsx`

### Business App Tabs
- **Analytics** → `analytics.tsx`
- **Campaigns** → `campaigns.tsx`
- **CRM** → `crm.tsx`
- **Profile** → `profile.tsx`

---

## 🎯 Key Files to Know

### Configuration
- `app.json` - Expo config
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `.env` - Environment variables

### Entry Points
- `frontend/app/_layout.tsx` - Rider app root
- `business-app/app/_layout.tsx` - Business app root

### Shared Layer
- `shared/api.ts` - API client
- `shared/bridge.ts` - Event bridge
- `shared/types.ts` - TypeScript types

---

## 📖 Documentation Links

- **Main README**: `../README.md`
- **Architecture**: `../ARCHITECTURE.md`
- **Implementation Summary**: `../IMPLEMENTATION_COMPLETE.md`
- **Business App Guide**: `../business-app/README.md`

---

## 💡 Pro Tips

1. **Always use TypeScript** - Type safety prevents bugs
2. **Test on real devices** - Simulators don't show all issues
3. **Use bridge for cross-app updates** - Don't poll the API
4. **Keep stores focused** - One responsibility per store
5. **Document complex logic** - Future you will thank you
6. **Use relative imports** - Avoid `@/` path alias issues
7. **Clear cache often** - `npx expo start --clear`
8. **Test both apps together** - Verify bridge events work

---

**Quick Reference Version**: 1.0  
**Last Updated**: December 2024  
**For**: UMA Dual App Architecture
