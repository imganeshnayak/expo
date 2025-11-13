# 🧠 AI PERSONALIZATION - QUICK START GUIDE

## 🎯 WHAT'S NEW

UMA now has **Instagram-level AI personalization** - every user gets a unique, adaptive experience based on their personality, behavior, mood, and social connections.

---

## 📱 NEW SCREENS

### **1. AI Profile** (`/ai-profile`)
Your complete AI personality breakdown:
- **Your Archetype:** Foodie 🍽️ (82% confidence)
- **Behavioral Insights:** Spending patterns, active days, social preferences
- **Discovery Profile:** Novelty seeking (75%), trend following (60%), friend influence (70%)
- **Social Influence:** Closest friends, taste makers, your influence score
- **All Preferences:** Categories, cuisines, price sensitivity

### **2. AI Recommendations** (`/ai-recommendations`)
Personalized content feed:
- **AI Prediction:** "Dinner with friends at 7PM" (75% confidence)
- **Perfect for You:** 5 deals ranked by relevance score
- **Curated Missions:** 3 archetype-specific missions
- **Social Insights:** Your behavioral patterns
- **Mood-Based Picks:** Suggestions for current mood

### **3. Enhanced Home Screen** (`/(tabs)/index`)
- **Personalized Greeting:** "Evening, Foodie! 🍽️"
- **AI Profile Badge:** Shows archetype + mood
- **AI Recommendations Banner:** Quick access to AI picks

---

## 🎭 6 PERSONALITY ARCHETYPES

| Archetype | Icon | Description | Sample Missions |
|-----------|------|-------------|-----------------|
| **Explorer** | 🗺️ | Loves new places, high novelty | "Discover Hidden Gems", "Neighborhood Explorer" |
| **Foodie** | 🍽️ | Culinary experiences, quality focus | "Culinary Journey", "Taste of Italy" |
| **Socializer** | 👥 | Group activities, friend influence | "Weekend Squad Goals", "Party Planner" |
| **Planner** | 📅 | Structured, mission-oriented | "Weekly Planner", "Mission Master" |
| **Adventurer** | 🎒 | Unique experiences, risk-taking | "Extreme Explorer", "Thrill Hunter" |
| **Relaxer** | ☕ | Comfort, familiar places | "Comfort Zone", "Me Time Master" |

---

## 🎯 KEY FEATURES

### **1. Personality Detection**
AI analyzes behavior to determine your archetype:
```typescript
// Based on:
- Discovery preferences (novelty seeking, trend following, friend influence)
- Behavior patterns (time, day, weather, companion)
- Spending habits (average, by category, deal usage)
- Explicit preferences (categories, cuisines, price sensitivity)

// Result:
Archetype: Foodie (82% confidence)
```

### **2. Context-Aware Recommendations**
AI adapts to your current situation:

**Time-Based:**
- Morning: "Start your day right ☀️"
- Afternoon: "Afternoon pick-me-up 🎯"
- Evening: "Evening plans sorted 🌙"

**Mood-Based:**
- Celebratory (Fri/Sat eve): Night spots, group activities
- Relaxed (Sun morning): Cozy cafes, spa experiences
- Stressed (Mon morning): Stress-free activities
- Energetic (high activity): Quick wins, active experiences
- Adventurous (exploring): New places, unique experiences

**Social Context:**
- With friends → Group deals, social venues
- Solo → Solo-friendly options, quiet spaces

**Weather:**
- Sunny → Outdoor activities
- Rainy → Indoor venues, cozy spots

### **3. Smart Relevance Scoring**
Every deal ranked 0-100:
```typescript
Base: 50
+ Category match: +20
+ Price match: +15
+ Time context: +10
+ Social context: +15
+ Novelty bonus: +10
= Score: 85/100
```

**Why Displayed:**
- "Matches your favorite category: Food & Drink"
- "You spend an average of ₹1200 on Food & Drink"
- "Perfect timing - you're typically active now"

### **4. Predictive Intelligence**
AI predicts your next actions:

**Today:**
- "Dinner with friends at 7PM" (75% confidence)
- Reason: "Based on your typical Friday evening pattern"

**This Week:**
- "Weekend exploration on Saturday afternoon" (82% confidence)
- Missions: Medium-Hard difficulty (matches high novelty)

### **5. Social Graph Intelligence**
AI learns from your network:
- **Closest Friends:** 3 connections (most co-activities)
- **Taste Makers:** 1 influencer (most followed)
- **Your Influence:** 65/100 (medium influencer)

**Social Recommendations:**
- "Users with similar tastes loved this restaurant"
- "Your friend circle is trending toward Korean food"
- "3 friends visited this gaming zone last week"

### **6. Continuous Learning**
Every action improves AI:
```typescript
trackAction({
  type: 'deal_claimed',
  timestamp: new Date(),
  metadata: { dealId, category, price },
  context: { mood, withFriends, locationContext, weather }
})

// AI learns:
- Category preferences
- Time patterns
- Social patterns
- Spending habits
- Discovery preferences
```

---

## 🗂️ STATE MANAGEMENT

### **Import the Store:**
```typescript
import { 
  useAIPersonalizationStore,
  getMoodEmoji,
  getPersonalityArchetypes,
  formatConfidence,
  getPriceSensitivityLabel
} from '@/store/aiPersonalizationStore';
```

### **Access AI Data:**
```typescript
const {
  // Profile
  userProfile,
  actionHistory,
  learningMetrics,
  
  // Personalized Content
  personalizedDeals,
  personalizedMissions,
  predictions,
  
  // Actions
  trackAction,
  updateContext,
  updateExplicitPreferences,
  
  // AI Intelligence
  detectPersonalityArchetype,
  detectMood,
  generatePersonalizedContent,
  predictNextActions,
  
  // Recommendations
  rankDeals,
  suggestMissions,
  getContextualGreeting,
  
  // Helpers
  getArchetypeInfo,
  getInsights,
} = useAIPersonalizationStore();
```

### **Sample Data Available:**
```typescript
// User Profile
{
  personalityArchetype: 'foodie',
  archetypeConfidence: 82,
  explicitPreferences: {
    favoriteCategories: ['Food & Drink', 'Entertainment', 'Wellness'],
    preferredCuisines: ['Italian', 'Indian', 'Japanese', 'Mediterranean'],
    priceSensitivity: 'medium',
    dealResponsiveness: 75,
  },
  implicitPreferences: {
    behaviorPatterns: {
      timeOfDay: { '19': 60 }, // Peak at 7PM
      dayOfWeek: { 'Saturday': 90 }, // Most active Saturday
      companionPattern: 'friends',
    },
    spendingHabits: {
      averageSpend: 850,
      spendByCategory: { 'Food & Drink': 1200 },
      dealUsageRate: 68,
    },
    discoveryPreferences: {
      noveltySeeking: 75,
      trendFollowing: 60,
      friendInfluence: 70,
    },
  },
  socialInfluence: {
    closestFriends: ['friend-1', 'friend-2', 'friend-4'],
    tasteMakers: ['friend-2'],
    influenceScore: 65,
  },
}

// Learning Metrics
{
  actionsTracked: 156,
  modelAccuracy: 78,
  preferenceEvolution: [
    { category: 'Food & Drink', trend: 'increasing' },
    { category: 'Wellness', trend: 'increasing' },
    { category: 'Shopping', trend: 'decreasing' },
  ],
}
```

---

## 🚀 USAGE EXAMPLES

### **1. Display Personalized Greeting:**
```typescript
const { getContextualGreeting, userProfile } = useAIPersonalizationStore();
const greeting = getContextualGreeting();
// Result: "Evening, Foodie! Time to unwind 🍽️"

const mood = userProfile.currentContext.mood;
const moodEmoji = getMoodEmoji(mood);
// Result: 🎉 (celebratory)
```

### **2. Track User Actions:**
```typescript
const { trackAction, userProfile } = useAIPersonalizationStore();

// When user claims a deal
trackAction({
  type: 'deal_claimed',
  timestamp: new Date(),
  metadata: { 
    dealId: 'deal-123',
    category: 'Food & Drink',
    price: 850,
  },
  context: userProfile.currentContext,
});
// AI automatically updates preferences
```

### **3. Get Personalized Recommendations:**
```typescript
const { generatePersonalizedContent } = useAIPersonalizationStore();

const content = generatePersonalizedContent();
// Returns:
{
  greeting: "Evening, Foodie! 🍽️",
  contextMessage: "Happy Friday! Time to celebrate 🎉",
  priorityDeals: [5 ranked deals with reasons],
  suggestedMissions: [3 curated missions],
  socialHighlights: ["You typically spend ₹850 per outing"],
  moodBasedSuggestions: ["Try trending night spots"],
}
```

### **4. Rank Deals:**
```typescript
const { rankDeals } = useAIPersonalizationStore();

const deals = [
  { id: '1', merchantName: 'Artisan Cafe', category: 'Food & Drink', price: 150 },
  { id: '2', merchantName: 'Gaming Zone', category: 'Entertainment', price: 500 },
];

const rankedDeals = rankDeals(deals);
// Returns sorted array with:
// - relevanceScore: 85/100
// - reasons: ["Matches your favorite category", "Perfect timing"]
```

### **5. Get AI Predictions:**
```typescript
const { predictNextActions } = useAIPersonalizationStore();

const todayPredictions = predictNextActions('today');
// Returns:
{
  nextLikelyActivity: 'Dinner with friends',
  confidence: 75,
  recommendedMissions: [...],
  dealSuggestions: [...],
  optimalTiming: {
    bestTime: '7:00 PM',
    reason: 'Based on your typical Friday evening pattern',
  },
}
```

---

## 🛣️ NAVIGATION PATHS

### **From Profile Screen:**
1. Profile → **AI & Personalization** section
2. Tap **AI Profile** → Full personality breakdown
3. Tap **AI Recommendations** → Personalized content feed

### **From Home Screen:**
1. See AI profile badge in header → Tap → AI Profile
2. See **AI Picks for You** banner → Tap → AI Recommendations

### **From AI Profile:**
- **View Profile** button on recommendation screen → AI Profile

---

## 📊 SUCCESS METRICS TO TRACK

### **Engagement:**
- AI Recommendations screen views
- AI Profile screen views
- Time spent on AI screens
- Return visits to AI features

### **Conversion:**
- Deal claim rate from AI recommendations vs regular
- Mission start rate from AI suggestions
- Average relevance score of claimed deals

### **Learning:**
- Actions tracked per user
- Archetype confidence growth over time
- Model accuracy improvement
- Preference evolution patterns

### **Satisfaction:**
- User rating of AI recommendations
- "Helpful" votes on reasons
- Archetype identification rate ("I am a Foodie!")

---

## 🎨 DESIGN HIGHLIGHTS

### **Color Coding:**
- **Purple (#8b5cf6):** AI/personalization features
- **Blue (#3b82f6):** Confidence/accuracy metrics
- **Yellow (#f59e0b):** Predictions/recommendations
- **Green (#10b981):** Growth/insights
- **Pink (#ec4899):** Social features

### **Icon System:**
- **Brain 🧠:** AI Profile
- **Sparkles ✨:** AI Recommendations
- **Star ⭐:** Relevance scores
- **Trophy 🏆:** Missions
- **Target 🎯:** Perfect matches
- **Zap ⚡:** Energy/influence

### **Typography:**
- **Headers:** Bold, 18-20px
- **Scores:** Large, 16-24px with badges
- **Descriptions:** 13-14px, readable
- **Reasons:** 11-12px, supportive

---

## 🔄 LIFECYCLE

### **New User (Day 1):**
- Default archetype: Planner (conservative)
- Generic recommendations
- Low confidence (50%)
- Limited predictions

### **Learning Phase (Week 1):**
- 5-10 actions tracked
- Archetype detected (60% confidence)
- Time patterns emerging
- Basic predictions available

### **Established Profile (Month 1):**
- 30+ actions tracked
- Stable archetype (80%+ confidence)
- Rich behavior patterns
- Accurate predictions
- Social graph established

### **Mature AI (Month 3+):**
- 100+ actions tracked
- Very high confidence (90%+)
- Deep understanding
- Predictive excellence
- Strong social influence

---

## 🚀 GETTING STARTED

### **1. View Your AI Profile:**
```
Home → Profile → AI & Personalization → AI Profile
```
See your personality archetype, behavioral insights, and discovery profile.

### **2. Check AI Recommendations:**
```
Home → AI Picks Banner OR Profile → AI Recommendations
```
Get personalized deals, missions, and predictions.

### **3. Track Your Activity:**
Every interaction (deal claim, mission start, search) automatically updates your AI profile.

### **4. Watch AI Learn:**
Check "Actions Tracked" and "Model Accuracy" in AI Profile to see learning progress.

---

## 💡 PRO TIPS

1. **More Usage = Better AI:** The more you use UMA, the smarter it gets!
2. **Check Predictions:** See if AI can predict your next move (it's usually right!)
3. **Read "Why":** Tap deals to see why AI recommended them
4. **Update Preferences:** Edit cuisines/categories in AI Profile for better results
5. **Social Learning:** Add friends - AI learns from your shared tastes
6. **Trust the Score:** Deals with 85+ relevance are almost always perfect for you

---

## 🎯 NEXT ACTIONS

### **For Testing:**
- [ ] Navigate to AI Profile from Profile screen
- [ ] Check your personality archetype
- [ ] View AI Recommendations screen
- [ ] See personalized greeting on Home
- [ ] Claim a deal and verify AI tracking
- [ ] Check if actions tracked increased

### **For Backend Integration:**
- [ ] Replace sample data with real user data
- [ ] Implement API for preference updates
- [ ] Add WebSocket for real-time learning
- [ ] Store action history in database
- [ ] Implement collaborative filtering API
- [ ] Add analytics tracking for AI metrics

### **For Enhancement:**
- [ ] Add archetype quiz for onboarding
- [ ] Implement preference adjustment UI
- [ ] Add "Train AI" feature (thumbs up/down)
- [ ] Create AI insights dashboard
- [ ] Add personality matching for groups
- [ ] Implement merchant AI analytics

---

## 📦 FILES REFERENCE

**Store:**
- `frontend/store/aiPersonalizationStore.ts` - Complete AI state management

**Screens:**
- `frontend/app/ai-profile.tsx` - Personality & insights
- `frontend/app/ai-recommendations.tsx` - Personalized content
- `frontend/app/(tabs)/index.tsx` - AI-enhanced home (modified)
- `frontend/app/(tabs)/profile.tsx` - AI navigation (modified)

**Documentation:**
- `AI_PERSONALIZATION_COMPLETE.md` - Full technical docs
- `AI_PERSONALIZATION_QUICK_START.md` - This guide

---

## 🎉 THE MAGIC

**Before AI:** "Here are some deals near you"

**With AI:** "Evening, Foodie! Based on your typical Friday 7PM pattern and love for Italian food, here's a new restaurant your friend Priya just visited. 95% match for you!"

**That's the difference.** 🧠✨

---

**UMA now understands users like a personal assistant - creating Instagram-level personalization that makes every experience feel custom-built.** 🚀
