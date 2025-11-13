import { useAdvancedAIStore } from '../store/advancedAIStore';

/**
 * Demo Data & Testing Utilities for Advanced AI Personalization
 * 
 * This file provides:
 * - Sample user activities to populate the AI profile
 * - Mock behavioral data for testing archetypes
 * - Journey pattern examples
 * - Mood simulation scenarios
 */

export interface DemoActivity {
  type: string;
  category?: string;
  duration?: number;
  companions?: number;
  spend?: number;
  merchant?: string;
  timestamp?: number;
}

// ==================== DEMO ACTIVITIES ====================

export const DEMO_ACTIVITIES: Record<string, DemoActivity[]> = {
  // Foodie persona activities
  foodie: [
    { type: 'restaurant_visit', category: 'food', companions: 2, spend: 1200, merchant: 'Fine Dining Palace', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { type: 'restaurant_visit', category: 'food', companions: 1, spend: 800, merchant: 'Sushi House', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { type: 'cafe_visit', category: 'food', companions: 0, spend: 250, merchant: 'Artisan Coffee Co', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { type: 'restaurant_visit', category: 'food', companions: 3, spend: 1500, merchant: 'French Bistro', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { type: 'food_review', category: 'food', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  ],
  
  // Explorer persona activities
  explorer: [
    { type: 'explore_new_merchant', category: 'discovery', companions: 1, spend: 600, merchant: 'Hidden Gallery', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { type: 'explore_new_merchant', category: 'discovery', companions: 0, spend: 300, merchant: 'Secret Garden Cafe', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { type: 'walking_tour', category: 'experience', duration: 180, companions: 2, spend: 500, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { type: 'explore_new_merchant', category: 'discovery', companions: 0, spend: 450, merchant: 'Indie Bookstore', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  ],
  
  // Socializer persona activities
  socializer: [
    { type: 'group_dinner', category: 'social', companions: 5, spend: 2000, merchant: 'Popular Restaurant', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { type: 'party_event', category: 'social', companions: 8, spend: 1500, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { type: 'group_activity', category: 'social', companions: 4, spend: 800, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { type: 'meetup', category: 'social', companions: 6, spend: 600, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  ],
  
  // Planner persona activities
  planner: [
    { type: 'planned_booking', category: 'planning', companions: 2, spend: 1000, timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 }, // Booked 2 weeks in advance
    { type: 'reservation', category: 'planning', companions: 1, spend: 800, timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 }, // Booked 10 days in advance
    { type: 'itinerary_creation', category: 'planning', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { type: 'planned_booking', category: 'planning', companions: 3, spend: 1500, timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000 }, // Booked 3 weeks ahead
  ],
  
  // Adventurer persona activities
  adventurer: [
    { type: 'adventure_activity', category: 'adventure', companions: 2, spend: 2500, merchant: 'Skydiving Center', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { type: 'trekking', category: 'adventure', duration: 360, companions: 3, spend: 1200, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { type: 'water_sports', category: 'adventure', duration: 120, companions: 1, spend: 1500, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  ],
  
  // Relaxer persona activities
  relaxer: [
    { type: 'spa', category: 'wellness', duration: 90, companions: 0, spend: 1500, merchant: 'Serenity Spa', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { type: 'yoga_session', category: 'wellness', duration: 60, companions: 0, spend: 500, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { type: 'meditation', category: 'wellness', duration: 45, companions: 0, spend: 300, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { type: 'spa', category: 'wellness', duration: 120, companions: 1, spend: 2000, merchant: 'Luxury Spa', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
  ],
};

// ==================== JOURNEY PATTERNS ====================

export const DEMO_JOURNEY_PATTERNS = [
  {
    sequence: ['coffee', 'work', 'lunch', 'gym'],
    duration: 480, // 8 hours
    day: 'Monday',
  },
  {
    sequence: ['breakfast', 'shopping', 'lunch', 'cafe'],
    duration: 300, // 5 hours
    day: 'Saturday',
  },
  {
    sequence: ['brunch', 'spa', 'dinner', 'movie'],
    duration: 600, // 10 hours
    day: 'Sunday',
  },
  {
    sequence: ['cafe', 'work', 'dinner', 'drinks'],
    duration: 540, // 9 hours
    day: 'Friday',
  },
];

// ==================== TESTING UTILITIES ====================

/**
 * Populate user profile with demo data for a specific archetype
 */
export function loadDemoProfile(archetype: 'foodie' | 'explorer' | 'socializer' | 'planner' | 'adventurer' | 'relaxer') {
  const store = useAdvancedAIStore.getState();
  
  if (!store.profile) {
    store.initializeProfile('demo_user');
  }
  
  // Track all activities for the archetype
  const activities = DEMO_ACTIVITIES[archetype];
  activities.forEach(activity => {
    store.trackActivity(activity);
  });
  
  // Learn journey patterns
  DEMO_JOURNEY_PATTERNS.forEach(pattern => {
    store.learnJourneyPattern(pattern.sequence, pattern.duration);
  });
  
  // Run analysis
  store.analyzeAndLearn();
  store.evolveProfile();
  
  console.log(`✅ Demo profile loaded for archetype: ${archetype}`);
  console.log(`📊 Profile scores:`, store.getArchetypeScores());
}

/**
 * Simulate mood changes throughout a day
 */
export function simulateDayMoods() {
  const store = useAdvancedAIStore.getState();
  
  if (!store.profile) {
    store.initializeProfile('demo_user');
  }
  
  // Morning - Energetic
  store.updateContext({
    timeContext: 'morning',
    energyLevel: 85,
    socialContext: 'solo',
  });
  store.detectMood();
  
  // Midday - Focused
  setTimeout(() => {
    store.updateContext({
      timeContext: 'midday',
      energyLevel: 75,
    });
    store.detectMood();
  }, 1000);
  
  // Evening - Celebratory
  setTimeout(() => {
    store.updateContext({
      timeContext: 'evening',
      energyLevel: 90,
      socialContext: 'with_friends',
    });
    store.detectMood();
  }, 2000);
  
  console.log('✅ Simulated mood changes throughout the day');
}

/**
 * Generate random activities for testing
 */
export function generateRandomActivities(count: number = 20) {
  const store = useAdvancedAIStore.getState();
  
  if (!store.profile) {
    store.initializeProfile('demo_user');
  }
  
  const activityTypes = ['restaurant_visit', 'cafe_visit', 'shopping', 'spa', 'gym', 'movie', 'explore_new_merchant'];
  const categories = ['food', 'wellness', 'entertainment', 'shopping', 'discovery'];
  
  for (let i = 0; i < count; i++) {
    const activity: DemoActivity = {
      type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      companions: Math.floor(Math.random() * 4),
      spend: Math.floor(Math.random() * 2000) + 200,
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
    };
    
    store.trackActivity(activity);
  }
  
  store.analyzeAndLearn();
  console.log(`✅ Generated ${count} random activities`);
}

/**
 * Test recommendation generation
 */
export function testRecommendations() {
  const store = useAdvancedAIStore.getState();
  
  if (!store.profile) {
    console.error('❌ No profile found. Initialize profile first.');
    return;
  }
  
  const prediction = store.predictNextActivity();
  console.log('🎯 Next Activity Prediction:', prediction);
  
  const insights = store.generateInsights();
  console.log('💡 Proactive Insights:', insights);
  
  const summary = store.getProfileSummary();
  console.log('📊 Profile Summary:', summary);
}

/**
 * Reset profile to default state
 */
export function resetProfile() {
  const store = useAdvancedAIStore.getState();
  store.initializeProfile('demo_user');
  console.log('🔄 Profile reset to default state');
}

/**
 * Load mixed archetype profile (realistic scenario)
 */
export function loadMixedProfile() {
  const store = useAdvancedAIStore.getState();
  
  if (!store.profile) {
    store.initializeProfile('demo_user');
  }
  
  // Mix activities from different archetypes
  const mixedActivities = [
    ...DEMO_ACTIVITIES.foodie.slice(0, 3),
    ...DEMO_ACTIVITIES.explorer.slice(0, 2),
    ...DEMO_ACTIVITIES.socializer.slice(0, 2),
    ...DEMO_ACTIVITIES.relaxer.slice(0, 1),
  ];
  
  mixedActivities.forEach(activity => {
    store.trackActivity(activity);
  });
  
  // Learn journey patterns
  DEMO_JOURNEY_PATTERNS.forEach(pattern => {
    store.learnJourneyPattern(pattern.sequence, pattern.duration);
  });
  
  store.analyzeAndLearn();
  store.evolveProfile();
  
  console.log('✅ Mixed profile loaded (realistic user behavior)');
  console.log('📊 Archetype scores:', store.getArchetypeScores());
}

/**
 * Quick test all features
 */
export function testAllFeatures() {
  console.log('🧪 Testing all Advanced AI features...\n');
  
  // 1. Load mixed profile
  console.log('1️⃣ Loading mixed profile...');
  loadMixedProfile();
  
  // 2. Simulate moods
  console.log('\n2️⃣ Simulating mood changes...');
  simulateDayMoods();
  
  // 3. Test predictions
  setTimeout(() => {
    console.log('\n3️⃣ Testing recommendations...');
    testRecommendations();
  }, 3000);
  
  console.log('\n✅ All tests complete!');
}

// Export for use in screens
export default {
  loadDemoProfile,
  simulateDayMoods,
  generateRandomActivities,
  testRecommendations,
  resetProfile,
  loadMixedProfile,
  testAllFeatures,
  DEMO_ACTIVITIES,
  DEMO_JOURNEY_PATTERNS,
};
