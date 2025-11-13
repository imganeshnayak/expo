# Universal Loyalty Management - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Add Navigation Link
In your main app screen, add:
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

<TouchableOpacity onPress={() => router.push('/loyalty-management')}>
  <Text>My Loyalty Programs</Text>
</TouchableOpacity>
```

---

## 📱 Screen Guide

### Main Dashboard (`/loyalty-management`)
- **Purpose**: Central hub for all loyalty programs
- **Key Features**:
  - Portfolio value overview
  - Active/Expiring/Ready stats
  - Search programs
  - Quick add button
  - Reminders tab

### Add Program (`/loyalty-add`)
- **Purpose**: Create new loyalty program
- **Flow**: Basic Info → Program Type → Reward Details → Optional Details
- **Templates**: Starbucks, Domino's, Big Bazaar, Local, Other

### Manual Update (`/manual-update?programId=xxx`)
- **Purpose**: Track progress manually
- **Key Actions**:
  - Add progress (+1, +2, etc.)
  - Attach receipt photo
  - View update history
  - Delete updates

### Notifications (`/loyalty-notifications`)
- **Purpose**: View reminders & alerts
- **Types**: Expiring Soon, Milestone Reached, Unused Points, New Reward

### Analytics (`/loyalty-analytics`)
- **Purpose**: Portfolio insights & recommendations
- **Sections**: Total Value, Category Breakdown, Program Types, Top Recommendation, Insights

---

## 🎯 Common Tasks

### Add a New Loyalty Program
```
1. Tap "+" in loyalty-management
2. Choose template or "Create Custom"
3. Fill merchant name, type, reward
4. Set expiration (optional)
5. Tap "Add Program"
```

### Track Manual Progress
```
1. Tap program card in dashboard
2. Tap "Add Manual Update"
3. Enter progress change (e.g., +1)
4. Add notes (optional)
5. Take/attach receipt photo (optional)
6. Tap "Add Update"
```

### View Portfolio Value
```
1. Navigate to /loyalty-management
2. See total value in portfolio header
3. Or go to /loyalty-analytics for detailed breakdown
```

### Check Expiring Programs
```
1. In /loyalty-management, see "Expiring Soon" section
2. Or switch to "Reminders" tab
3. Tap reminder to view program
```

---

## 🔧 Store Methods Reference

### External Loyalty Store (`useExternalLoyaltyStore`)

```typescript
// Get store instance
const {
  programs,              // All loyalty programs
  reminders,            // All reminders
  insights,             // Analytics insights
  templates,            // Program templates
  
  // Actions
  addProgram,           // Create new program
  updateProgramProgress, // Update progress
  addManualUpdate,      // Add manual update with receipt
  deleteManualUpdate,   // Remove update (reverses progress)
  
  // Analytics
  calculateInsights,    // Compute portfolio insights
  getTotalPortfolioValue, // Get total ₹ value
  getExpiringPrograms,  // Get programs expiring soon
  getBestRedemptionOpportunities, // Get ready programs
  
  // Reminders
  generateReminders,    // Create smart reminders
  markReminderRead,     // Mark reminder as read
  markAllRemindersRead, // Mark all read
} = useExternalLoyaltyStore();
```

### Key Type Definitions

```typescript
// Program sources
type ProgramSource = 'starbucks' | 'dominos' | 'bigbazaar' | 'local' | 'other';

// Program types
type ProgramType = 'stamps' | 'points' | 'tiers' | 'visits';

// Reward status
type RewardStatus = 'active' | 'expired' | 'redeemed' | 'near_expiry';

// Manual update
interface ManualUpdate {
  id: string;
  date: number;
  progressChange: number;
  notes?: string;
  receiptPhoto?: string;
  location?: string;
}
```

---

## 🎨 UI Components

### Program Card
```typescript
<ProgramCard 
  program={program}
  onPress={() => navigateToDetail(program.id)}
/>
```
**Shows**: Logo, Name, Progress, Reward, Expiration

### Reminder Card
```typescript
<ReminderCard 
  reminder={reminder}
  onPress={() => handleReminderPress(reminder)}
/>
```
**Shows**: Icon, Merchant, Message, Time, Unread dot

### Category Breakdown Card
```typescript
<CategoryCard 
  category="Food & Dining"
  count={5}
  value={400}
  avgProgress={65}
/>
```
**Shows**: Icon, Name, Count, Value, Progress bar

---

## 💡 Pro Tips

### 1. Use Templates for Speed
- Tap "+" → Select template (Starbucks, Domino's, etc.)
- Pre-filled with common settings
- Just adjust progress and start tracking

### 2. Always Attach Receipt Photos
- Proof of purchase
- Helps remember transaction details
- Can be used for dispute resolution

### 3. Check Analytics Weekly
- Understand spending patterns
- Optimize redemption strategy
- Don't let rewards expire

### 4. Enable Reminders
- Get notified before expiration
- Milestone alerts (90%, 100% complete)
- Proximity alerts (near merchant)

### 5. Track Local Businesses
- Not just big chains!
- Add your favorite cafe's punch card
- Track any loyalty program manually

---

## 🐛 Troubleshooting

### Issue: App crashes on image picker
**Solution**: Check camera/gallery permissions in device settings

### Issue: Progress not updating
**Solution**: Refresh screen or restart app, check addManualUpdate() call

### Issue: No reminders appearing
**Solution**: Call generateReminders() or check program expiration dates

### Issue: Analytics showing 0
**Solution**: Add some programs first, then call calculateInsights()

### Issue: Theme colors not working
**Solution**: Use `theme.colors.primary` instead of `theme.primary`

---

## 📊 Sample Data

### Example Starbucks Program
```typescript
{
  id: 'starbucks-001',
  merchantName: 'Starbucks Coffee',
  merchantLogo: '☕',
  programSource: 'starbucks',
  category: 'Food & Dining',
  programType: 'stamps',
  currentProgress: 7,
  requiredForReward: 10,
  reward: 'Free coffee of any size',
  expirationDate: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days
  isManual: true,
  autoSync: false,
  manualUpdates: [
    {
      id: 'update-1',
      date: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      progressChange: 2,
      notes: 'Bought 2 lattes',
      receiptPhoto: 'file:///...',
      location: 'Starbucks MG Road'
    }
  ]
}
```

---

## 🔗 Navigation Flow

```
Main App
  ↓
/loyalty-management (Dashboard)
  ├→ /loyalty-add (Add Program)
  ├→ /manual-update?programId=xxx (Update Progress)
  ├→ /loyalty-notifications (View Reminders)
  └→ /loyalty-analytics (View Analytics)
```

---

## ✅ Feature Checklist

- [x] Create loyalty programs (manual or template)
- [x] Track progress manually
- [x] Attach receipt photos
- [x] View update history
- [x] Delete updates (reverses progress)
- [x] Search programs
- [x] Filter by status (Active, Expiring, Ready)
- [x] View total portfolio value
- [x] Category breakdown
- [x] Program type distribution
- [x] Expiration reminders
- [x] Milestone notifications
- [x] Top recommendations
- [x] Usage insights

---

## 📞 Need Help?

- **Documentation**: See `UNIVERSAL_LOYALTY_COMPLETE.md` for full details
- **Related Guides**: 
  - AI Personalization: `AI_PERSONALIZATION_COMPLETE.md`
  - Coupon Engine: `COUPON_ENGINE_COMPLETE.md`
  - Social Features: `SOCIAL_FEATURES_COMPLETE.md`

---

**Happy Tracking! 🎉**
