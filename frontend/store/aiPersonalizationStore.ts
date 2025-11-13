import { create } from 'zustand';

// ==================== TYPES ====================

export type PersonalityArchetype = 'explorer' | 'foodie' | 'socializer' | 'planner' | 'adventurer' | 'relaxer';
export type Mood = 'energetic' | 'relaxed' | 'stressed' | 'celebratory' | 'adventurous';
export type LocationContext = 'home' | 'work' | 'commuting' | 'exploring';
export type CompanionPattern = 'solo' | 'friends' | 'dates' | 'family';
export type PriceSensitivity = 'low' | 'medium' | 'high';

export interface ExplicitPreferences {
  favoriteCategories: string[];
  dietaryRestrictions: string[];
  priceSensitivity: PriceSensitivity;
  preferredCuisines: string[];
  dealResponsiveness: number; // 0-100
}

export interface BehaviorPatterns {
  timeOfDay: { [hour: string]: number };
  dayOfWeek: { [day: string]: number };
  weatherPreferences: { [condition: string]: number };
  companionPattern: CompanionPattern;
}

export interface SpendingHabits {
  averageSpend: number;
  spendByCategory: { [category: string]: number };
  dealUsageRate: number; // 0-100
}

export interface DiscoveryPreferences {
  noveltySeeking: number; // 0-100
  trendFollowing: number; // 0-100
  friendInfluence: number; // 0-100
}

export interface ImplicitPreferences {
  behaviorPatterns: BehaviorPatterns;
  spendingHabits: SpendingHabits;
  discoveryPreferences: DiscoveryPreferences;
}

export interface CurrentContext {
  mood?: Mood;
  budgetToday?: number;
  timeAvailable?: number; // minutes
  withFriends?: boolean;
  locationContext?: LocationContext;
  weather?: string;
  currentTime?: Date;
}

export interface SocialInfluence {
  closestFriends: string[];
  tasteMakers: string[];
  influenceScore: number; // 0-100
}

export interface AIUserProfile {
  userId: string;
  personalityArchetype: PersonalityArchetype;
  archetypeConfidence: number; // 0-100
  explicitPreferences: ExplicitPreferences;
  implicitPreferences: ImplicitPreferences;
  currentContext: CurrentContext;
  socialInfluence: SocialInfluence;
  lastUpdated: Date;
}

export interface UserAction {
  type: 'deal_viewed' | 'deal_claimed' | 'mission_started' | 'mission_completed' | 'merchant_visited' | 'search' | 'friend_activity_viewed' | 'group_joined';
  timestamp: Date;
  metadata: any;
  context: CurrentContext;
}

export interface PersonalizedDeal {
  dealId: string;
  merchantName: string;
  title: string;
  discount: string;
  category: string;
  relevanceScore: number; // 0-100
  reasons: string[];
  urgency?: string;
}

export interface PersonalizedMission {
  missionId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relevanceScore: number; // 0-100
  reasons: string[];
  estimatedTime: number; // minutes
}

export interface AIPrediction {
  nextLikelyActivity: string;
  confidence: number; // 0-100
  recommendedMissions: PersonalizedMission[];
  dealSuggestions: PersonalizedDeal[];
  optimalTiming: {
    bestTime: string;
    reason: string;
  };
}

export interface PersonalizedContent {
  greeting: string;
  contextMessage: string;
  priorityDeals: PersonalizedDeal[];
  suggestedMissions: PersonalizedMission[];
  socialHighlights: string[];
  moodBasedSuggestions: string[];
}

export interface LearningMetrics {
  actionsTracked: number;
  modelAccuracy: number; // 0-100
  lastTrainingDate: Date;
  preferenceEvolution: {
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
}

// ==================== SAMPLE DATA ====================

const SAMPLE_USER_PROFILE: AIUserProfile = {
  userId: 'user-1',
  personalityArchetype: 'foodie',
  archetypeConfidence: 82,
  explicitPreferences: {
    favoriteCategories: ['Food & Drink', 'Entertainment', 'Wellness'],
    dietaryRestrictions: ['Vegetarian'],
    priceSensitivity: 'medium',
    preferredCuisines: ['Italian', 'Indian', 'Japanese', 'Mediterranean'],
    dealResponsiveness: 75,
  },
  implicitPreferences: {
    behaviorPatterns: {
      timeOfDay: {
        '8': 15, '9': 25, '12': 40, '13': 35, '18': 50, '19': 60, '20': 45,
      },
      dayOfWeek: {
        'Monday': 30, 'Tuesday': 35, 'Wednesday': 40, 'Thursday': 45,
        'Friday': 80, 'Saturday': 90, 'Sunday': 70,
      },
      weatherPreferences: {
        'sunny': 80, 'rainy': 45, 'cloudy': 60,
      },
      companionPattern: 'friends',
    },
    spendingHabits: {
      averageSpend: 850,
      spendByCategory: {
        'Food & Drink': 1200,
        'Entertainment': 600,
        'Wellness': 400,
        'Shopping': 300,
      },
      dealUsageRate: 68,
    },
    discoveryPreferences: {
      noveltySeeking: 75,
      trendFollowing: 60,
      friendInfluence: 70,
    },
  },
  currentContext: {
    mood: 'energetic',
    budgetToday: 1000,
    timeAvailable: 120,
    withFriends: false,
    locationContext: 'work',
    weather: 'sunny',
    currentTime: new Date(),
  },
  socialInfluence: {
    closestFriends: ['friend-1', 'friend-2', 'friend-4'],
    tasteMakers: ['friend-2'],
    influenceScore: 65,
  },
  lastUpdated: new Date(),
};

const ARCHETYPE_DESCRIPTIONS = {
  explorer: {
    name: 'Explorer',
    icon: '🗺️',
    description: 'Loves trying new places and discovering hidden gems',
    traits: ['High novelty seeking', 'Adventurous', 'Location diversity'],
    suggestedMissions: ['Discover Hidden Gems', 'Neighborhood Explorer', 'Off the Beaten Path'],
  },
  foodie: {
    name: 'Foodie',
    icon: '🍽️',
    description: 'Prioritizes culinary experiences and follows food trends',
    traits: ['Quality-focused', 'Cuisine diversity', 'Restaurant reviews'],
    suggestedMissions: ['Culinary Journey', 'Taste of Italy', 'Brunch Champion'],
  },
  socializer: {
    name: 'Socializer',
    icon: '👥',
    description: 'Prefers group activities and friend recommendations',
    traits: ['Group bookings', 'Friend influence', 'Social events'],
    suggestedMissions: ['Weekend Squad Goals', 'Party Planner', 'Social Butterfly'],
  },
  planner: {
    name: 'Planner',
    icon: '📅',
    description: 'Likes structured missions and advance booking',
    traits: ['Scheduled activities', 'Mission-oriented', 'Organized approach'],
    suggestedMissions: ['Weekly Planner', 'Mission Master', 'Strategic Saver'],
  },
  adventurer: {
    name: 'Adventurer',
    icon: '🎒',
    description: 'Seeks unique experiences and offbeat locations',
    traits: ['Unique experiences', 'Risk-taking', 'Experience collector'],
    suggestedMissions: ['Extreme Explorer', 'Adventure Seeker', 'Thrill Hunter'],
  },
  relaxer: {
    name: 'Relaxer',
    icon: '☕',
    description: 'Prefers comfortable, familiar places and low-key activities',
    traits: ['Comfort-seeking', 'Familiar places', 'Stress-free'],
    suggestedMissions: ['Comfort Zone', 'Relaxation Ritual', 'Me Time Master'],
  },
};

// ==================== STORE ====================

interface AIPersonalizationState {
  // User Profile
  userProfile: AIUserProfile;
  actionHistory: UserAction[];
  learningMetrics: LearningMetrics;
  
  // Personalized Content
  personalizedDeals: PersonalizedDeal[];
  personalizedMissions: PersonalizedMission[];
  predictions: AIPrediction[];
  
  // Actions
  trackAction: (action: UserAction) => void;
  updateContext: (context: Partial<CurrentContext>) => void;
  updateExplicitPreferences: (prefs: Partial<ExplicitPreferences>) => void;
  
  // AI Intelligence
  detectPersonalityArchetype: () => PersonalityArchetype;
  detectMood: () => Mood | undefined;
  generatePersonalizedContent: () => PersonalizedContent;
  predictNextActions: (timeframe: 'today' | 'week' | 'month') => AIPrediction[];
  
  // Recommendations
  rankDeals: (deals: any[]) => PersonalizedDeal[];
  suggestMissions: () => PersonalizedMission[];
  getContextualGreeting: () => string;
  
  // Learning
  updatePreferenceModel: () => void;
  calculateRelevanceScore: (item: any, type: 'deal' | 'mission') => number;
  
  // Helpers
  getArchetypeInfo: () => typeof ARCHETYPE_DESCRIPTIONS[PersonalityArchetype];
  getInsights: () => string[];
}

export const useAIPersonalizationStore = create<AIPersonalizationState>((set, get) => ({
  // Initial State
  userProfile: SAMPLE_USER_PROFILE,
  actionHistory: [],
  learningMetrics: {
    actionsTracked: 156,
    modelAccuracy: 78,
    lastTrainingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    preferenceEvolution: [
      { category: 'Food & Drink', trend: 'increasing' },
      { category: 'Wellness', trend: 'increasing' },
      { category: 'Shopping', trend: 'decreasing' },
    ],
  },
  personalizedDeals: [],
  personalizedMissions: [],
  predictions: [],

  // Actions
  trackAction: (action: UserAction) => {
    const { actionHistory, userProfile } = get();
    
    // Add action to history
    const newHistory = [...actionHistory, action].slice(-100); // Keep last 100 actions
    
    set({ actionHistory: newHistory });
    
    // Update behavior patterns based on action
    get().updatePreferenceModel();
  },

  updateContext: (context: Partial<CurrentContext>) => {
    const { userProfile } = get();
    set({
      userProfile: {
        ...userProfile,
        currentContext: {
          ...userProfile.currentContext,
          ...context,
        },
      },
    });
  },

  updateExplicitPreferences: (prefs: Partial<ExplicitPreferences>) => {
    const { userProfile } = get();
    set({
      userProfile: {
        ...userProfile,
        explicitPreferences: {
          ...userProfile.explicitPreferences,
          ...prefs,
        },
      },
    });
  },

  // AI Intelligence
  detectPersonalityArchetype: () => {
    const { userProfile, actionHistory } = get();
    
    // Analyze behavior patterns
    const { discoveryPreferences, behaviorPatterns } = userProfile.implicitPreferences;
    
    // Score each archetype
    const scores = {
      explorer: discoveryPreferences.noveltySeeking * 0.8 + (behaviorPatterns.companionPattern === 'solo' ? 20 : 0),
      foodie: (userProfile.explicitPreferences.preferredCuisines.length > 3 ? 70 : 40) + discoveryPreferences.trendFollowing * 0.3,
      socializer: discoveryPreferences.friendInfluence * 0.7 + (behaviorPatterns.companionPattern === 'friends' ? 30 : 0),
      planner: (100 - discoveryPreferences.noveltySeeking) * 0.5 + 40,
      adventurer: discoveryPreferences.noveltySeeking * 0.9 + 10,
      relaxer: (100 - discoveryPreferences.noveltySeeking) * 0.6 + (100 - discoveryPreferences.trendFollowing) * 0.4,
    };
    
    // Find highest scoring archetype
    const archetype = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PersonalityArchetype;
    
    return archetype;
  },

  detectMood: () => {
    const { userProfile, actionHistory } = get();
    const { currentContext } = userProfile;
    
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Friday/Saturday evening = celebratory
    if ((day === 5 || day === 6) && hour >= 18) {
      return 'celebratory';
    }
    
    // Sunday morning = relaxed
    if (day === 0 && hour < 12) {
      return 'relaxed';
    }
    
    // Monday morning = might be stressed
    if (day === 1 && hour < 10) {
      return 'stressed';
    }
    
    // Recent high activity = energetic
    const recentActions = actionHistory.filter(
      a => new Date(a.timestamp).getTime() > Date.now() - 1000 * 60 * 60
    );
    if (recentActions.length > 5) {
      return 'energetic';
    }
    
    // High novelty seeking + exploring context = adventurous
    if (
      userProfile.implicitPreferences.discoveryPreferences.noveltySeeking > 70 &&
      currentContext.locationContext === 'exploring'
    ) {
      return 'adventurous';
    }
    
    return currentContext.mood;
  },

  generatePersonalizedContent: () => {
    const { userProfile, getContextualGreeting, rankDeals, suggestMissions, getInsights } = get();
    const { currentContext, personalityArchetype } = userProfile;
    
    const greeting = getContextualGreeting();
    const mood = get().detectMood();
    
    // Generate context message
    let contextMessage = '';
    const now = new Date();
    const hour = now.getHours();
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    if (mood === 'celebratory') {
      contextMessage = `Happy ${day}! Time to celebrate with amazing deals 🎉`;
    } else if (mood === 'relaxed') {
      contextMessage = 'Perfect day to unwind and explore at your own pace ☕';
    } else if (mood === 'stressed') {
      contextMessage = 'Take a break - here are some stress-free activities 🌿';
    } else if (mood === 'adventurous') {
      contextMessage = 'Ready for an adventure? Discover something new today! 🗺️';
    } else if (hour < 12) {
      contextMessage = 'Start your day right with these morning favorites ☀️';
    } else if (hour < 17) {
      contextMessage = 'Afternoon pick-me-up? Perfect timing for these deals 🎯';
    } else {
      contextMessage = 'Evening plans sorted with these curated suggestions 🌙';
    }
    
    // Get sample deals (in real app, these would come from deals store)
    const sampleDeals = [
      { id: '1', merchantName: 'Artisan Cafe', title: '30% Off All Beverages', discount: '30%', category: 'Food & Drink', price: 150 },
      { id: '2', merchantName: 'Urban Gaming Zone', title: '2 Hours Free Gaming', discount: 'BOGO', category: 'Entertainment', price: 500 },
      { id: '3', merchantName: 'Spa Serenity', title: 'Massage + Facial Package', discount: '40%', category: 'Wellness', price: 1200 },
      { id: '4', merchantName: 'Pizza Paradise', title: 'Family Combo Deal', discount: '₹200 Off', category: 'Food & Drink', price: 800 },
      { id: '5', merchantName: 'Bookworm Cafe', title: 'Coffee + Book Combo', discount: '25%', category: 'Food & Drink', price: 200 },
    ];
    
    const priorityDeals = rankDeals(sampleDeals);
    const suggestedMissionsData = suggestMissions();
    const insights = getInsights();
    
    const moodBasedSuggestions = mood === 'celebratory'
      ? ['Try the trending night spots', 'Group activities with friends', 'Premium dining experiences']
      : mood === 'relaxed'
      ? ['Cozy cafes perfect for reading', 'Peaceful spa experiences', 'Solo-friendly venues']
      : mood === 'adventurous'
      ? ['Never-been-before places', 'Unique local experiences', 'Hidden gems nearby']
      : ['Quick and easy options', 'Comfort food favorites', 'Low-key hangout spots'];
    
    return {
      greeting,
      contextMessage,
      priorityDeals: priorityDeals.slice(0, 5),
      suggestedMissions: suggestedMissionsData.slice(0, 3),
      socialHighlights: insights,
      moodBasedSuggestions,
    };
  },

  predictNextActions: (timeframe: 'today' | 'week' | 'month') => {
    const { userProfile } = get();
    const { behaviorPatterns, spendingHabits } = userProfile.implicitPreferences;
    
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const predictions: AIPrediction[] = [];
    
    // Today predictions
    if (timeframe === 'today') {
      // Evening prediction
      if (hour < 17 && behaviorPatterns.timeOfDay['19'] > 50) {
        predictions.push({
          nextLikelyActivity: 'Dinner with friends',
          confidence: 75,
          recommendedMissions: get().suggestMissions().filter(m => m.category === 'Food & Drink'),
          dealSuggestions: get().rankDeals([]).filter(d => d.category === 'Food & Drink'),
          optimalTiming: {
            bestTime: '7:00 PM',
            reason: 'Based on your typical Friday evening pattern',
          },
        });
      }
    }
    
    // Week predictions
    if (timeframe === 'week') {
      // Weekend prediction
      if (day < 5 && behaviorPatterns.dayOfWeek['Saturday'] > 70) {
        predictions.push({
          nextLikelyActivity: 'Weekend exploration',
          confidence: 82,
          recommendedMissions: get().suggestMissions().filter(m => m.difficulty !== 'easy'),
          dealSuggestions: get().rankDeals([]),
          optimalTiming: {
            bestTime: 'Saturday afternoon',
            reason: 'You typically explore new places on Saturday afternoons',
          },
        });
      }
    }
    
    return predictions;
  },

  // Recommendations
  rankDeals: (deals: any[]) => {
    const { userProfile, calculateRelevanceScore } = get();
    
    return deals
      .map(deal => {
        const relevanceScore = calculateRelevanceScore(deal, 'deal');
        const reasons: string[] = [];
        
        // Add reasons based on matching criteria
        if (userProfile.explicitPreferences.favoriteCategories.includes(deal.category)) {
          reasons.push(`Matches your favorite category: ${deal.category}`);
        }
        
        if (userProfile.implicitPreferences.spendingHabits.spendByCategory[deal.category] > 0) {
          reasons.push(`You spend an average of ₹${userProfile.implicitPreferences.spendingHabits.spendByCategory[deal.category]} on ${deal.category}`);
        }
        
        const now = new Date();
        const hour = now.getHours();
        if (userProfile.implicitPreferences.behaviorPatterns.timeOfDay[hour.toString()] > 40) {
          reasons.push(`Perfect timing - you're typically active now`);
        }
        
        if (userProfile.currentContext.withFriends && deal.category === 'Entertainment') {
          reasons.push('Great for groups - you\'re with friends!');
        }
        
        // Price sensitivity check
        const avgSpend = userProfile.implicitPreferences.spendingHabits.averageSpend;
        if (userProfile.explicitPreferences.priceSensitivity === 'high' && deal.price < avgSpend * 0.7) {
          reasons.push('Budget-friendly option');
        }
        
        return {
          dealId: deal.id,
          merchantName: deal.merchantName,
          title: deal.title,
          discount: deal.discount,
          category: deal.category,
          relevanceScore,
          reasons: reasons.length > 0 ? reasons : ['Recommended based on your preferences'],
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  suggestMissions: () => {
    const { userProfile } = get();
    const archetypeInfo = get().getArchetypeInfo();
    
    // Generate missions based on archetype
    const missions: PersonalizedMission[] = archetypeInfo.suggestedMissions.map((title, index) => {
      const difficulty: 'easy' | 'medium' | 'hard' = index === 0 ? 'easy' : index === 1 ? 'medium' : 'hard';
      const estimatedTime = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 120;
      
      const reasons: string[] = [
        `Perfect for ${archetypeInfo.name}s like you`,
        `Matches your ${archetypeInfo.traits[0].toLowerCase()} trait`,
      ];
      
      if (userProfile.implicitPreferences.discoveryPreferences.noveltySeeking > 70 && difficulty !== 'easy') {
        reasons.push('Challenging enough for your adventurous spirit');
      }
      
      return {
        missionId: `mission-${index + 1}`,
        title,
        description: `Curated ${archetypeInfo.name} mission just for you`,
        category: 'Personalized',
        difficulty,
        relevanceScore: 95 - (index * 10),
        reasons,
        estimatedTime,
      };
    });
    
    return missions;
  },

  getContextualGreeting: () => {
    const { userProfile } = get();
    const hour = new Date().getHours();
    const { personalityArchetype } = userProfile;
    
    const archetypeInfo = ARCHETYPE_DESCRIPTIONS[personalityArchetype];
    
    if (hour < 12) {
      return `Good morning, ${archetypeInfo.name}! ${archetypeInfo.icon}`;
    } else if (hour < 17) {
      return `Good afternoon! Ready to ${personalityArchetype === 'explorer' ? 'discover' : personalityArchetype === 'foodie' ? 'taste' : 'explore'}?`;
    } else {
      return `Evening, ${archetypeInfo.name}! Time to ${personalityArchetype === 'socializer' ? 'connect' : 'unwind'} ${archetypeInfo.icon}`;
    }
  },

  // Learning
  updatePreferenceModel: () => {
    const { actionHistory, userProfile } = get();
    
    // Update archetype based on recent behavior
    const detectedArchetype = get().detectPersonalityArchetype();
    
    // Calculate confidence (how sure we are about the archetype)
    const archetypeConfidence = Math.min(
      100,
      50 + (actionHistory.length * 0.5) // Increases with more data
    );
    
    set({
      userProfile: {
        ...userProfile,
        personalityArchetype: detectedArchetype,
        archetypeConfidence,
        lastUpdated: new Date(),
      },
      learningMetrics: {
        ...get().learningMetrics,
        actionsTracked: actionHistory.length,
      },
    });
  },

  calculateRelevanceScore: (item: any, type: 'deal' | 'mission') => {
    const { userProfile } = get();
    let score = 50; // Base score
    
    // Category match
    if (userProfile.explicitPreferences.favoriteCategories.includes(item.category)) {
      score += 20;
    }
    
    // Price sensitivity
    if (type === 'deal' && item.price) {
      const avgSpend = userProfile.implicitPreferences.spendingHabits.averageSpend;
      if (userProfile.explicitPreferences.priceSensitivity === 'high' && item.price < avgSpend) {
        score += 15;
      } else if (userProfile.explicitPreferences.priceSensitivity === 'low' || item.price <= avgSpend * 1.2) {
        score += 10;
      }
    }
    
    // Time context
    const hour = new Date().getHours();
    if (userProfile.implicitPreferences.behaviorPatterns.timeOfDay[hour.toString()] > 40) {
      score += 10;
    }
    
    // Social context
    if (userProfile.currentContext.withFriends && item.category === 'Entertainment') {
      score += 15;
    }
    
    // Novelty seeking
    if (userProfile.implicitPreferences.discoveryPreferences.noveltySeeking > 70) {
      score += 10;
    }
    
    return Math.min(100, score);
  },

  // Helpers
  getArchetypeInfo: () => {
    const { userProfile } = get();
    return ARCHETYPE_DESCRIPTIONS[userProfile.personalityArchetype];
  },

  getInsights: () => {
    const { userProfile, actionHistory } = get();
    const insights: string[] = [];
    
    // Spending insight
    const avgSpend = userProfile.implicitPreferences.spendingHabits.averageSpend;
    insights.push(`You typically spend ₹${avgSpend} per outing`);
    
    // Pattern insight
    const topDay = Object.entries(userProfile.implicitPreferences.behaviorPatterns.dayOfWeek)
      .sort((a, b) => b[1] - a[1])[0][0];
    insights.push(`${topDay}s are your favorite exploration days`);
    
    // Social insight
    if (userProfile.implicitPreferences.behaviorPatterns.companionPattern === 'friends') {
      insights.push(`You prefer exploring with friends`);
    } else {
      insights.push(`You enjoy solo adventures`);
    }
    
    // Discovery insight
    if (userProfile.implicitPreferences.discoveryPreferences.noveltySeeking > 70) {
      insights.push(`You love trying new places - ${Math.floor(userProfile.implicitPreferences.discoveryPreferences.noveltySeeking)}% novelty seeker`);
    }
    
    return insights;
  },
}));

// ==================== HELPER FUNCTIONS ====================

export const getPersonalityArchetypes = () => ARCHETYPE_DESCRIPTIONS;

export const getMoodEmoji = (mood?: Mood): string => {
  switch (mood) {
    case 'energetic': return '⚡';
    case 'relaxed': return '☕';
    case 'stressed': return '😰';
    case 'celebratory': return '🎉';
    case 'adventurous': return '🗺️';
    default: return '😊';
  }
};

export const formatConfidence = (confidence: number): string => {
  if (confidence >= 80) return 'Very High';
  if (confidence >= 60) return 'High';
  if (confidence >= 40) return 'Medium';
  return 'Low';
};

export const getPriceSensitivityLabel = (sensitivity: PriceSensitivity): string => {
  switch (sensitivity) {
    case 'low': return 'Premium Seeker';
    case 'medium': return 'Value Conscious';
    case 'high': return 'Budget Optimizer';
  }
};
