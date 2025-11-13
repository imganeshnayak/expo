# 🎯 UMA Missions System Guide

## Overview
The Missions system transforms UMA into a gamified experience where users complete quests to earn rewards, points, and exclusive benefits.

## Features Implemented

### 1. **Mission Store** (`store/missionStore.ts`)
- **6 Sample Missions** across different categories
- **AI-Powered Recommendations** based on time of day
- **Auto-Tracking** for rides, deals, and QR scans
- **State Persistence** with AsyncStorage
- **Progress Tracking** with real-time updates

### 2. **Missions Screen** (`app/(tabs)/missions.tsx`)
- **Horizontal Scroll** - Stories-like UI with card-based design
- **Mission Cards** showing:
  - Progress bars (0-100%)
  - Step checkmarks
  - Rewards (points + savings)
  - Difficulty badges
  - Time estimates
- **Modal Detail View** for each mission
- **Celebration Animations** on mission completion
- **Active Mission Counter** with visual indicator

### 3. **Navigation Integration**
- Added **Missions tab** to bottom navigation
- Target icon with animated effects
- Positioned between Categories and QR Code tabs

## Mission Categories

| Category | Color | Examples |
|----------|-------|----------|
| **Food** | `#FF6B6B` | Coffee Connoisseur, Foodie Friday |
| **Entertainment** | `#9B59B6` | Friday Night Thrills |
| **Wellness** | `#2ECC71` | Wellness Warrior |
| **Shopping** | `#F39C12` | Shopping Spree |
| **Adventure** | `#3498DB` | Weekend Explorer |

## Sample Missions

### 🎉 Friday Night Thrills
- **Category:** Entertainment
- **Difficulty:** Medium
- **Reward:** 300 points + ₹200 savings
- **Steps:**
  1. Book a ride after 6 PM
  2. Redeem a "Food & Beverage" deal
  3. Visit an entertainment venue

### 🗺️ Weekend Explorer
- **Category:** Adventure
- **Difficulty:** Easy
- **Reward:** 250 points + ₹150 savings
- **Steps:**
  1. Book a ride on Saturday or Sunday
  2. Visit 2 different merchant categories
  3. Redeem a weekend special deal
  4. Share your experience

### ☕ Coffee Connoisseur
- **Category:** Food
- **Difficulty:** Easy
- **Reward:** 200 points + ₹100 savings
- **Steps:**
  1. Book a ride to a cafe
  2. Redeem a cafe deal
  3. Scan the QR code

### 🧘 Wellness Warrior
- **Category:** Wellness
- **Difficulty:** Hard
- **Reward:** 350 points + ₹250 savings
- **Steps:**
  1. Book a ride to a gym or yoga studio
  2. Redeem a wellness deal
  3. Complete a health-related visit

### 🍕 Foodie Friday
- **Category:** Food
- **Difficulty:** Medium
- **Reward:** 275 points + ₹180 savings
- **Steps:**
  1. Book a ride on Friday
  2. Redeem a restaurant deal
  3. Try a new cuisine

### 🛍️ Shopping Spree
- **Category:** Shopping
- **Difficulty:** Medium
- **Reward:** 225 points + ₹300 savings
- **Steps:**
  1. Book a ride to a shopping area
  2. Redeem 2 shopping deals
  3. Make a purchase

## AI Recommendation Logic

The system intelligently recommends missions based on:

### **Time-Based Filtering**
```typescript
const hour = new Date().getHours();
const isEvening = hour >= 18 || hour < 6;

if (isEvening) {
  // Recommend: Entertainment, Food missions
} else {
  // Recommend: Food, Wellness, Shopping missions
}
```

### **Future Enhancements** (Planned)
- **Location-Based:** Recommend missions near user's current location
- **Preference-Based:** Learn from completed missions to suggest similar quests
- **Seasonal Missions:** Holiday specials, weekend adventures
- **Community Missions:** Group challenges with multiplayer rewards

## Auto-Tracking Integration

### Ride Bookings
```typescript
// Automatically completes "ride" type steps
useMissionStore.getState().trackRideBooking(rideDetails);
```

### Deal Redemptions
```typescript
// Automatically completes "deal" type steps
useMissionStore.getState().trackDealBooking(dealDetails);
```

### QR Scans
```typescript
// Automatically completes "scan" type steps
useMissionStore.getState().trackQRScan(merchantId);
```

## User Flow

1. **Discover Missions**
   - Open Missions tab from bottom navigation
   - Browse recommended missions in horizontal scroll
   - View mission details by tapping card

2. **Start a Mission**
   - Tap "Start Mission" button
   - Mission moves to Active Missions section
   - Steps begin auto-tracking

3. **Complete Steps**
   - Book rides → Auto-completes ride steps
   - Redeem deals → Auto-completes deal steps
   - Scan QR codes → Auto-completes scan steps
   - Progress bar updates in real-time

4. **Claim Rewards**
   - Once all steps complete, mission shows "Claim Reward"
   - Tap to trigger celebration animation
   - Points added to user's total
   - Badge unlocked

## Progress Tracking

### Mission Card Progress Indicator
```tsx
<ProgressBar 
  progress={75}  // 3 of 4 steps completed
  color="#00D9A3"
/>
```

### Step Status Icons
- ✓ **Completed** - Green checkmark
- ○ **Pending** - Gray circle
- → **Action Required** - Chevron (deep link available)

## Celebration Animation

When users claim rewards:
```typescript
1. Trophy icon scales up (bounce animation)
2. "Mission Complete!" text fades in
3. Confetti-style celebration (2 seconds)
4. Points added with haptic feedback
5. Badge unlocked notification
```

## State Management

### Mission State Structure
```typescript
interface MissionState {
  missions: Mission[];           // All available missions
  activeMissions: Mission[];     // Currently in-progress
  completedMissions: Mission[];  // Finished missions
  totalPoints: number;           // User's total points
  badges: string[];              // Unlocked badges
}
```

### Persistence
- Uses Zustand + AsyncStorage
- Survives app restarts
- Syncs across sessions

## Tips for Users

💡 **Pro Tips:**
- Complete missions to earn points and exclusive rewards
- Steps auto-complete when you book deals or rides
- New missions unlock based on your preferences
- Check back daily for fresh recommendations
- Stack multiple missions for maximum rewards

## Design System

### Colors
- **Primary:** `#00D9A3` (UMA Green)
- **Background:** `#0A0A0A` (Dark)
- **Surface:** `#1C1C1C` (Cards)
- **Text:** `#FFFFFF` (Primary)
- **Text Secondary:** `#9CA3AF`

### Typography
- **Mission Title:** 22px, Semi-bold
- **Description:** 14px, Regular
- **Rewards:** 13px, Medium
- **Step Text:** 14px, Medium

### Spacing
- **Card Width:** 85% of screen width
- **Card Padding:** 20px
- **Card Margin:** 20px right
- **Border Radius:** 20px
- **Border Width:** 2px

## Integration Points

### 1. Ride Booking Screen
Add mission tracking after successful booking:
```typescript
import { useMissionStore } from '@/store/missionStore';

const { trackRideBooking } = useMissionStore();

// After ride confirmed
trackRideBooking({
  category: rideDetails.category,
  timestamp: Date.now(),
});
```

### 2. Deal Booking Screen
Track when users redeem deals:
```typescript
const { trackDealBooking } = useMissionStore();

// After deal redeemed
trackDealBooking({
  category: deal.category,
  merchantId: deal.merchantId,
});
```

### 3. QR Scanner Screen
Track successful QR scans:
```typescript
const { trackQRScan } = useMissionStore();

// After QR code scanned
trackQRScan(merchantId);
```

## Testing Checklist

- [ ] Missions appear on new tab
- [ ] Horizontal scroll works smoothly
- [ ] Can start a mission
- [ ] Progress bar updates correctly
- [ ] Auto-tracking works for rides
- [ ] Auto-tracking works for deals
- [ ] Auto-tracking works for QR scans
- [ ] Mission detail modal opens
- [ ] Can navigate to deep links
- [ ] Completion triggers celebration
- [ ] Points increment correctly
- [ ] State persists after app restart
- [ ] Recommendations change by time
- [ ] Navigation animations smooth

## Future Roadmap

### Phase 2: Advanced Features
- [ ] **Daily Missions** - Refresh every 24 hours
- [ ] **Weekly Challenges** - Longer, more rewarding quests
- [ ] **Leaderboards** - Compete with friends
- [ ] **Mission Streaks** - Bonus for consecutive days
- [ ] **Custom Badges** - Unlock unique achievements

### Phase 3: Social Features
- [ ] **Team Missions** - Collaborate with friends
- [ ] **Mission Sharing** - Invite friends to join
- [ ] **Community Goals** - City-wide challenges
- [ ] **Mission Chat** - Discuss strategies

### Phase 4: Merchant Integration
- [ ] **Merchant-Created Missions** - Custom brand quests
- [ ] **Sponsored Missions** - Premium rewards
- [ ] **Exclusive Access** - Mission-gated deals
- [ ] **Early Access** - Try new products first

## Support

For questions or issues with the Missions system:
1. Check mission progress in Missions tab
2. Verify auto-tracking is working
3. Ensure location permissions enabled
4. Contact UMA support

---

**Built with ❤️ for UMA Riders**
Version 1.0 - January 2025
