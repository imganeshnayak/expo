# 🎯 UMA Platform - Quick Reference Card

## 📱 RIDER APP - Quick Actions

### Home Screen Features
```
🔍 Search Bar → Find deals by keyword
🏷️ Category Pills → Filter: All, Food, Cafe, Wellness, Shopping, Fitness
📊 Sort Options → Distance | Discount | Rating
❤️ Like Button → Save favorite deals
🚗 Book Ride → Navigate to deal location
🎟️ Book Deal → Get QR code for redemption
```

### Profile Screen Features
```
📊 Stats Cards → Deals | Rides | Saved | Favorites
🚗 Ride History → Last 5 rides with details
❤️ Favorite Merchants → Toggle with heart icon
📈 Recent Activity → Deal usage, savings
💰 Wallet → Balance, transactions, top-up
```

---

## 🏢 BUSINESS APP - Quick Actions

### Campaign Creator
```
Step 1: Deal Details
  ✏️ Title, Description
  🏷️ Category selection
  💰 Price & discount
  
Step 2: Settings
  👥 Target audience
  📝 Terms & conditions
  🎯 Max redemptions
  
Step 3: Review & Create
  ✅ Confirm details
  🚀 Publish campaign
```

### Analytics Dashboard
```
📅 Time Range → Week | Month | Year
👁️ Views → Impressions with trend
🛍️ Redemptions → Conversion rate
💰 Revenue → Total earnings
⭐ Rating → Customer satisfaction
🏆 Top Campaigns → Performance metrics
👥 Top Customers → Ranked list
```

### Revenue Reports
```
💰 Summary → Revenue, growth, avg order
💳 Payments → UPI, Card, Cash breakdown
📊 Monthly Reports → Historical data
📥 Export → PDF download
📤 Share → Send via WhatsApp/Email
```

### Profile Management
```
📷 Images → Cover & profile photo
ℹ️ Info → Name, category, description
📞 Contact → Address, phone, email, website
📱 Social → Instagram, Facebook, Twitter
✨ Amenities → Reservations, walk-ins, parking
```

---

## 🎨 UI Elements Reference

### Colors
```
Primary:    #00D9A3 (Teal)
Background: #0A0A0A (Dark)
Surface:    #1A1A1A (Card)
Text:       #FFFFFF (Primary)
Secondary:  #666666 (Muted)
Success:    #00D9A3
Error:      #FF6B6B
```

### Typography
```
Header:     18-24px, weight 600
Body:       14-15px, weight 400-500
Label:      12-13px, weight 500
Small:      11-12px
```

### Spacing
```
Container:  20px padding
Card:       16px padding
Gap:        8-16px
Radius:     12px (cards), 20px (pills)
```

---

## 🔑 Key File Locations

### Rider App
```
app/(tabs)/index.tsx          → Home with filters
app/(tabs)/profile.tsx        → Ride history & favorites
app/(tabs)/qr.tsx             → QR code generation
app/ride-booking.tsx          → ONDC ride booking
app/ride-status.tsx           → Live tracking
app/booking-confirmation.tsx  → Deal QR code
```

### Business App
```
app/business/campaign-creator.tsx    → Create campaigns
app/business/analytics.tsx           → View metrics
app/business/revenue-reports.tsx     → Financial reports
app/business/profile-management.tsx  → Edit profile
```

### State Management
```
store/rideStore.ts    → Rides & history
store/walletStore.ts  → Wallet & transactions
```

### Services
```
services/ondcService.ts   → ONDC API client
constants/ondcConfig.ts   → ONDC configuration
constants/theme.ts        → Design system
```

---

## 🚀 Common Tasks

### Add New Deal Category
```typescript
// In app/(tabs)/index.tsx
const categories = [
  'All', 'Food', 'Cafe', 'Wellness', 
  'Shopping', 'Fitness', 
  'YourNewCategory' // Add here
];
```

### Customize Campaign Fields
```typescript
// In app/business/campaign-creator.tsx
interface CampaignData {
  title: string;
  // Add new fields here
  customField: string;
}
```

### Add Analytics Metric
```typescript
// In app/business/analytics.tsx
interface AnalyticsData {
  totalViews: number;
  // Add new metric here
  newMetric: number;
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Filters not working?**
```typescript
// Check filterAndSortDeals function
// Ensure selectedCategory state is updating
console.log('Category:', selectedCategory);
```

**Ride history empty?**
```typescript
// Check rideStore
const { rideHistory } = useRideStore();
console.log('History:', rideHistory);
```

**Campaign not creating?**
```typescript
// Check required fields
if (!title || !price || !discount) {
  Alert.alert('Error', 'Fill required fields');
}
```

---

## 📊 Testing Checklist

### Rider Features
- [ ] Filter by each category
- [ ] Sort by distance/discount/rating
- [ ] Search deals by keyword
- [ ] Add/remove favorite merchant
- [ ] View ride history
- [ ] Book deal → Get QR
- [ ] Book ride → Track status

### Business Features
- [ ] Create campaign (all 3 steps)
- [ ] View analytics (all time ranges)
- [ ] Check revenue reports
- [ ] Edit profile → Save
- [ ] Toggle amenities
- [ ] Export report

---

## 🎯 Performance Tips

### Optimization
```typescript
// Use React.memo for lists
const DealCard = React.memo(({ deal }) => { ... });

// Debounce search
const debouncedSearch = useDebounce(searchQuery, 300);

// Lazy load images
<Image source={{ uri }} loadingIndicatorSource={placeholder} />
```

### Best Practices
```typescript
// ✅ DO: Use proper keys
{deals.map(deal => <Card key={deal.id} />)}

// ❌ DON'T: Use index as key
{deals.map((deal, i) => <Card key={i} />)}

// ✅ DO: Memoize calculations
const total = useMemo(() => calculateTotal(), [items]);

// ✅ DO: Clean up effects
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer);
}, []);
```

---

## 📚 Documentation Files

```
📄 ENHANCED_FEATURES.md       → Complete feature guide
📄 ONDC_INTEGRATION.md        → ONDC API docs
📄 IMPLEMENTATION_SUMMARY.md  → Implementation details
📄 USER_FLOW_GUIDE.md         → User journey maps
📄 QUICK_REFERENCE.md         → This file
```

---

## 🔗 Quick Links

### Navigation
```typescript
// Navigate to business screens
router.push('/business/campaign-creator');
router.push('/business/analytics');
router.push('/business/revenue-reports');
router.push('/business/profile-management');

// Navigate to rider screens
router.push('/');              // Home
router.push('/profile');       // Profile
router.push('/ride-booking');  // Ride booking
```

---

## 💡 Pro Tips

### For Developers
- Use TypeScript strict mode for better type safety
- Follow the established design system
- Test on multiple screen sizes
- Keep components under 300 lines
- Write meaningful commit messages

### For Designers
- Stick to the color palette
- Use 12px border radius consistently
- Maintain 20px container padding
- Use Lucide icons for consistency
- Follow Material Design guidelines

---

## 📞 Support

### Get Help
- Check documentation files first
- Review code comments
- Test in development mode
- Use console.log for debugging
- Ask specific questions

---

**Version:** 2.0.0  
**Last Updated:** November 13, 2025  
**Status:** Production Ready ✅

---

## 🎉 You're All Set!

All features are implemented, tested, and documented.  
Happy coding! 🚀
