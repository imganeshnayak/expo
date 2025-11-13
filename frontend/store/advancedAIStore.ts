import { create } from 'zustand';

// ==================== ADVANCED TYPES ====================

// Behavioral Archetypes (multi-dimensional)
export interface ArchetypeProfile {
  score: number; // 0-100
  traits: string[];
  evolutionTrend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: number;
}

export interface BehavioralArchetypes {
  explorer: ArchetypeProfile;
  foodie: ArchetypeProfile;
  socializer: ArchetypeProfile;
  planner: ArchetypeProfile;
  adventurer: ArchetypeProfile;
  relaxer: ArchetypeProfile;
}

// Mood & Context Detection
export type DetectedMood = 'energetic' | 'relaxed' | 'stressed' | 'celebratory' | 'adventurous' | 'focused';
export type DetectionFactor = 'time_of_day' | 'recent_activity' | 'booking_pattern' | 'social_context' | 'weather' | 'velocity';

export interface MoodSnapshot {
  mood: DetectedMood;
  timestamp: number;
  confidence: number;
  detectionFactors: DetectionFactor[];
  context: string;
}

export interface CurrentMoodState {
  detectedMood: DetectedMood;
  confidence: number; // 0-100
  detectionFactors: DetectionFactor[];
  moodHistory: MoodSnapshot[];
  alternativeMoods: Array<{ mood: DetectedMood; confidence: number }>;
}

// Predictive Behavior Modeling
export interface BehaviorPrediction {
  nextLikelyActivity: string;
  optimalTiming: string; // "7:00 PM Friday" or "within 2 hours"
  preferredCompanions: number; // 0 = solo, 1 = one friend, 2+ = group
  budgetRange: [number, number];
  confidence: number; // 0-100
  alternativePredictions: Array<{
    activity: string;
    timing: string;
    confidence: number;
  }>;
}

// Cross-Merchant Journey Patterns
export interface JourneySequence {
  sequence: string[]; // ['coffee', 'work', 'lunch', 'gym']
  frequency: number; // how often this sequence occurs
  typicalDays: string[]; // ['Monday', 'Wednesday', 'Friday']
  averageDuration: number; // minutes
  lastOccurrence: number;
}

export interface DiscoveryPreferences {
  noveltyVsFamiliarity: number; // 0 = always familiar, 100 = always new
  researchDepth: number; // how much they explore options before deciding
  impulseVsPlanning: number; // 0 = impulsive, 100 = plans everything
  riskTolerance: number; // willingness to try untested merchants
  priceVsExperience: number; // 0 = price-focused, 100 = experience-focused
}

export interface JourneyPatterns {
  typicalSequences: JourneySequence[];
  discoveryPreferences: DiscoveryPreferences;
  merchantAffinities: Map<string, number>; // merchant -> affinity score
  categoryFlow: Map<string, string[]>; // category -> next likely categories
  timePatterns: Map<number, string[]>; // hour -> typical activities
  weekdayVsWeekend: {
    weekday: JourneySequence[];
    weekend: JourneySequence[];
  };
}

// Time-Based Patterns
export interface TimePattern {
  hour: number;
  dayOfWeek: string;
  typicalActivities: string[];
  averageSpend: number;
  companionPattern: 'solo' | 'paired' | 'group';
  moodProfile: DetectedMood;
  activityVelocity: number; // activities per hour
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  preferredCategories: string[];
  spendingTrend: number; // vs baseline
  activityLevel: number;
}

// Social Context Intelligence
export interface SocialContextProfile {
  soloPreference: number; // 0-100
  groupDynamics: {
    averageGroupSize: number;
    frequentCompanions: string[]; // user IDs
    roleInGroup: 'leader' | 'follower' | 'coordinator';
  };
  influenceScore: number; // how much user influences others
  suggestibility: number; // how much user is influenced by others
  sharingBehavior: {
    frequency: number; // posts/shares per week
    categories: string[]; // what they share
    responseRate: number; // engagement with shared content
  };
}

// Contextual Adaptation
export interface ContextualState {
  currentLocation: { lat: number; lng: number } | null;
  locationContext: 'home' | 'work' | 'commuting' | 'exploring' | 'unknown';
  timeContext: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late_night';
  socialContext: 'solo' | 'with_friends' | 'with_partner' | 'with_family';
  weatherContext: 'sunny' | 'rainy' | 'cloudy' | 'extreme';
  energyLevel: number; // 0-100, derived from activity velocity
  availableTime: number; // estimated minutes available
  currentBudget: number; // estimated available budget
}

// Learning & Feedback
export interface FeedbackEvent {
  id: string;
  type: 'recommendation_acted' | 'recommendation_ignored' | 'explicit_feedback' | 'pattern_shift';
  timestamp: number;
  metadata: {
    recommendationType?: string;
    actionTaken?: string;
    feedbackValue?: number; // -1 to 1
    context?: ContextualState;
  };
}

export interface LearningMetrics {
  recommendationAccuracy: number; // % of recommendations acted upon
  moodDetectionAccuracy: number; // verified through feedback
  predictionAccuracy: number; // % of predictions that came true
  adaptationSpeed: number; // how quickly profile updates
  profileCompleteness: number; // % of profile fields populated
  dataPoints: number; // total behavioral data points
}

// Advanced User Profile
export interface AdvancedUserProfile {
  userId: string;
  
  // Behavioral Archetypes
  archetypes: BehavioralArchetypes;
  dominantArchetype: keyof BehavioralArchetypes;
  archetypeEvolution: Array<{
    timestamp: number;
    archetypes: Partial<BehavioralArchetypes>;
  }>;
  
  // Mood & Context Detection
  currentMood: CurrentMoodState;
  
  // Predictive Modeling
  behaviorPredictions: BehaviorPrediction;
  
  // Journey Patterns
  journeyPatterns: JourneyPatterns;
  
  // Time-Based Patterns
  timePatterns: TimePattern[];
  seasonalPatterns: SeasonalPattern[];
  
  // Social Context
  socialContext: SocialContextProfile;
  
  // Current Contextual State
  contextualState: ContextualState;
  
  // Learning & Feedback
  feedbackHistory: FeedbackEvent[];
  learningMetrics: LearningMetrics;
  
  // Metadata
  createdAt: number;
  lastUpdated: number;
  profileVersion: number;
}

// Recommendation Types
export interface SmartRecommendation {
  id: string;
  type: 'merchant' | 'mission' | 'deal' | 'journey' | 'social';
  title: string;
  description: string;
  reasoning: string[];
  relevanceScore: number; // 0-100
  urgency: 'low' | 'medium' | 'high' | 'critical';
  moodAlignment: number; // how well it matches current mood
  timing: {
    optimal: string;
    window: [number, number]; // timestamp range
  };
  context: {
    mood: DetectedMood;
    archetypes: string[];
    predictedFit: number;
  };
  metadata: any;
}

export interface ProactiveInsight {
  id: string;
  type: 'pattern_detected' | 'preference_shift' | 'opportunity' | 'warning';
  message: string;
  details: string;
  actionable: boolean;
  suggestedActions: string[];
  priority: number; // 0-100
  timestamp: number;
}

// ==================== STORE INTERFACE ====================

export interface AdvancedAIStore {
  // State
  profile: AdvancedUserProfile | null;
  recommendations: SmartRecommendation[];
  insights: ProactiveInsight[];
  isAnalyzing: boolean;
  
  // Profile Management
  initializeProfile: (userId: string) => void;
  updateProfile: (updates: Partial<AdvancedUserProfile>) => void;
  
  // Mood Detection
  detectMood: (context?: Partial<ContextualState>) => DetectedMood;
  updateMoodHistory: (mood: DetectedMood, confidence: number, factors: DetectionFactor[]) => void;
  getMoodTrend: (hours: number) => MoodSnapshot[];
  
  // Behavioral Tracking
  trackActivity: (activity: {
    type: string;
    category?: string;
    duration?: number;
    companions?: number;
    spend?: number;
    merchant?: string;
    timestamp?: number;
  }) => void;
  
  // Archetype Management
  updateArchetypes: (activities: any[]) => void;
  getArchetypeScores: () => Record<keyof BehavioralArchetypes, number>;
  getDominantArchetype: () => keyof BehavioralArchetypes;
  
  // Predictive Modeling
  predictNextActivity: () => BehaviorPrediction;
  predictOptimalTiming: (activity: string) => string;
  predictBudget: () => [number, number];
  
  // Journey Intelligence
  learnJourneyPattern: (sequence: string[], duration: number) => void;
  suggestNextInJourney: (currentActivity: string) => string[];
  getTypicalDayPlan: (dayOfWeek: string) => JourneySequence | null;
  
  // Contextual Adaptation
  updateContext: (context: Partial<ContextualState>) => void;
  getContextualRecommendations: (limit?: number) => SmartRecommendation[];
  adaptUIForContext: () => {
    layout: 'compact' | 'standard' | 'immersive';
    tone: 'energetic' | 'calm' | 'professional';
    priorities: string[];
  };
  
  // Learning & Feedback
  recordFeedback: (type: FeedbackEvent['type'], metadata: any) => void;
  recordRecommendationOutcome: (recommendationId: string, acted: boolean) => void;
  calculateLearningMetrics: () => LearningMetrics;
  
  // Proactive Insights
  generateInsights: () => ProactiveInsight[];
  detectPatternShifts: () => ProactiveInsight[];
  suggestProactiveActions: () => ProactiveInsight[];
  
  // Advanced Recommendations
  getPersonalizedRecommendations: (filters?: {
    type?: SmartRecommendation['type'];
    minRelevance?: number;
    mood?: DetectedMood;
  }) => SmartRecommendation[];
  
  // Analytics
  getProfileSummary: () => {
    archetypeSummary: string;
    currentMood: string;
    topPredictions: string[];
    learningQuality: string;
  };
  
  // Continuous Learning
  analyzeAndLearn: () => void;
  evolveProfile: () => void;
}

// ==================== SAMPLE DATA ====================

const createDefaultArchetypes = (): BehavioralArchetypes => ({
  explorer: {
    score: 50,
    traits: ['curious', 'discovery-oriented'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
  foodie: {
    score: 50,
    traits: ['quality-focused', 'variety-seeking'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
  socializer: {
    score: 50,
    traits: ['group-oriented', 'sharing'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
  planner: {
    score: 50,
    traits: ['organized', 'deliberate'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
  adventurer: {
    score: 50,
    traits: ['risk-taking', 'spontaneous'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
  relaxer: {
    score: 50,
    traits: ['comfort-seeking', 'routine-preferring'],
    evolutionTrend: 'stable',
    lastUpdated: Date.now(),
  },
});

const createDefaultMoodState = (): CurrentMoodState => ({
  detectedMood: 'relaxed',
  confidence: 50,
  detectionFactors: ['time_of_day'],
  moodHistory: [],
  alternativeMoods: [],
});

const createDefaultContextualState = (): ContextualState => ({
  currentLocation: null,
  locationContext: 'unknown',
  timeContext: 'midday',
  socialContext: 'solo',
  weatherContext: 'sunny',
  energyLevel: 70,
  availableTime: 120,
  currentBudget: 500,
});

export const useAdvancedAIStore = create<AdvancedAIStore>((set, get) => ({
  profile: null,
  recommendations: [],
  insights: [],
  isAnalyzing: false,
  
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================
  
  initializeProfile: (userId: string) => {
    const profile: AdvancedUserProfile = {
      userId,
      archetypes: createDefaultArchetypes(),
      dominantArchetype: 'explorer',
      archetypeEvolution: [],
      currentMood: createDefaultMoodState(),
      behaviorPredictions: {
        nextLikelyActivity: 'exploring',
        optimalTiming: 'evening',
        preferredCompanions: 0,
        budgetRange: [200, 500],
        confidence: 50,
        alternativePredictions: [],
      },
      journeyPatterns: {
        typicalSequences: [],
        discoveryPreferences: {
          noveltyVsFamiliarity: 50,
          researchDepth: 50,
          impulseVsPlanning: 50,
          riskTolerance: 50,
          priceVsExperience: 50,
        },
        merchantAffinities: new Map(),
        categoryFlow: new Map(),
        timePatterns: new Map(),
        weekdayVsWeekend: {
          weekday: [],
          weekend: [],
        },
      },
      timePatterns: [],
      seasonalPatterns: [],
      socialContext: {
        soloPreference: 50,
        groupDynamics: {
          averageGroupSize: 2,
          frequentCompanions: [],
          roleInGroup: 'follower',
        },
        influenceScore: 50,
        suggestibility: 50,
        sharingBehavior: {
          frequency: 2,
          categories: [],
          responseRate: 50,
        },
      },
      contextualState: createDefaultContextualState(),
      feedbackHistory: [],
      learningMetrics: {
        recommendationAccuracy: 0,
        moodDetectionAccuracy: 0,
        predictionAccuracy: 0,
        adaptationSpeed: 50,
        profileCompleteness: 20,
        dataPoints: 0,
      },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      profileVersion: 1,
    };
    
    set({ profile });
  },
  
  updateProfile: (updates) => {
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        ...updates,
        lastUpdated: Date.now(),
        profileVersion: state.profile.profileVersion + 1,
      } : null,
    }));
  },
  
  // ============================================================================
  // MOOD DETECTION ENGINE
  // ============================================================================
  
  detectMood: (context) => {
    const state = get();
    if (!state.profile) return 'relaxed';
    
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    const factors: DetectionFactor[] = [];
    let moodScores: Record<DetectedMood, number> = {
      energetic: 0,
      relaxed: 0,
      stressed: 0,
      celebratory: 0,
      adventurous: 0,
      focused: 0,
    };
    
    // Time of day influence
    factors.push('time_of_day');
    if (hour >= 6 && hour < 10) {
      moodScores.energetic += 30;
      moodScores.focused += 20;
    } else if (hour >= 10 && hour < 14) {
      moodScores.focused += 30;
      moodScores.stressed += 10;
    } else if (hour >= 14 && hour < 18) {
      moodScores.relaxed += 20;
      moodScores.stressed += 20;
    } else if (hour >= 18 && hour < 22) {
      moodScores.celebratory += 30;
      moodScores.adventurous += 25;
    } else {
      moodScores.relaxed += 40;
    }
    
    // Day of week influence
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday, Saturday
      moodScores.celebratory += 25;
      moodScores.adventurous += 20;
      moodScores.stressed -= 10;
    } else if (dayOfWeek === 0) { // Sunday
      moodScores.relaxed += 30;
    } else if (dayOfWeek === 1) { // Monday
      moodScores.focused += 20;
      moodScores.stressed += 15;
    }
    
    // Recent activity patterns
    const recentActivities = state.profile.feedbackHistory.filter(
      f => f.timestamp > Date.now() - 3600000 // last hour
    );
    
    if (recentActivities.length > 3) {
      factors.push('recent_activity');
      moodScores.energetic += 20;
      moodScores.adventurous += 15;
    } else if (recentActivities.length === 0) {
      moodScores.relaxed += 15;
    }
    
    // Booking pattern (impulsive vs planned)
    const impulseScore = state.profile.journeyPatterns.discoveryPreferences.impulseVsPlanning;
    if (impulseScore < 30) {
      factors.push('booking_pattern');
      moodScores.adventurous += 20;
      moodScores.energetic += 10;
    } else if (impulseScore > 70) {
      moodScores.focused += 15;
      moodScores.relaxed += 10;
    }
    
    // Social context
    if (context?.socialContext === 'with_friends') {
      factors.push('social_context');
      moodScores.celebratory += 25;
      moodScores.energetic += 15;
    } else if (context?.socialContext === 'solo') {
      moodScores.relaxed += 15;
      moodScores.focused += 10;
    }
    
    // Weather influence
    if (context?.weatherContext === 'rainy') {
      factors.push('weather');
      moodScores.relaxed += 15;
      moodScores.stressed += 10;
    } else if (context?.weatherContext === 'sunny') {
      moodScores.energetic += 15;
      moodScores.adventurous += 10;
    }
    
    // Normalize and find top mood
    const totalScore = Object.values(moodScores).reduce((sum, score) => sum + Math.max(0, score), 0);
    const normalizedScores = Object.entries(moodScores).map(([mood, score]) => ({
      mood: mood as DetectedMood,
      confidence: Math.max(0, (score / totalScore) * 100),
    }));
    
    normalizedScores.sort((a, b) => b.confidence - a.confidence);
    
    const detectedMood = normalizedScores[0].mood;
    const confidence = normalizedScores[0].confidence;
    
    // Update mood history
    get().updateMoodHistory(detectedMood, confidence, factors);
    
    return detectedMood;
  },
  
  updateMoodHistory: (mood, confidence, factors) => {
    set(state => {
      if (!state.profile) return state;
      
      const snapshot: MoodSnapshot = {
        mood,
        timestamp: Date.now(),
        confidence,
        detectionFactors: factors,
        context: state.profile.contextualState.locationContext,
      };
      
      const moodHistory = [snapshot, ...state.profile.currentMood.moodHistory].slice(0, 100);
      
      return {
        profile: {
          ...state.profile,
          currentMood: {
            ...state.profile.currentMood,
            detectedMood: mood,
            confidence,
            detectionFactors: factors,
            moodHistory,
          },
        },
      };
    });
  },
  
  getMoodTrend: (hours) => {
    const state = get();
    if (!state.profile) return [];
    
    const cutoff = Date.now() - hours * 3600000;
    return state.profile.currentMood.moodHistory.filter(m => m.timestamp > cutoff);
  },
  
  // ============================================================================
  // BEHAVIORAL TRACKING
  // ============================================================================
  
  trackActivity: (activity) => {
    const state = get();
    if (!state.profile) return;
    
    const timestamp = activity.timestamp || Date.now();
    const hour = new Date(timestamp).getHours();
    const dayOfWeek = new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Record as feedback event
    const feedbackEvent: FeedbackEvent = {
      id: `activity_${timestamp}`,
      type: 'pattern_shift',
      timestamp,
      metadata: {
        context: state.profile.contextualState,
      },
    };
    
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        feedbackHistory: [feedbackEvent, ...state.profile.feedbackHistory].slice(0, 500),
        learningMetrics: {
          ...state.profile.learningMetrics,
          dataPoints: state.profile.learningMetrics.dataPoints + 1,
        },
      } : null,
    }));
    
    // Update archetypes based on activity
    const archetypeUpdates: Partial<Record<keyof BehavioralArchetypes, number>> = {};
    
    if (activity.type === 'explore_new_merchant') {
      archetypeUpdates.explorer = 5;
      archetypeUpdates.adventurer = 3;
    } else if (activity.category === 'food') {
      archetypeUpdates.foodie = 4;
    } else if (activity.companions && activity.companions > 1) {
      archetypeUpdates.socializer = 5;
    } else if (activity.type === 'planned_booking') {
      archetypeUpdates.planner = 4;
    } else if (activity.type === 'spa' || activity.category === 'wellness') {
      archetypeUpdates.relaxer = 4;
    }
    
    // Apply archetype updates
    Object.entries(archetypeUpdates).forEach(([archetype, change]) => {
      set(state => {
        if (!state.profile) return state;
        
        const key = archetype as keyof BehavioralArchetypes;
        const currentScore = state.profile.archetypes[key].score;
        const newScore = Math.min(100, Math.max(0, currentScore + change));
        
        return {
          profile: {
            ...state.profile,
            archetypes: {
              ...state.profile.archetypes,
              [key]: {
                ...state.profile.archetypes[key],
                score: newScore,
                lastUpdated: Date.now(),
              },
            },
          },
        };
      });
    });
  },
  
  // ============================================================================
  // ARCHETYPE MANAGEMENT
  // ============================================================================
  
  updateArchetypes: (activities) => {
    // This would analyze a batch of activities and update all archetypes
    activities.forEach(activity => {
      get().trackActivity(activity);
    });
  },
  
  getArchetypeScores: () => {
    const state = get();
    if (!state.profile) return {
      explorer: 50,
      foodie: 50,
      socializer: 50,
      planner: 50,
      adventurer: 50,
      relaxer: 50,
    };
    
    return Object.entries(state.profile.archetypes).reduce((scores, [key, profile]) => {
      scores[key as keyof BehavioralArchetypes] = profile.score;
      return scores;
    }, {} as Record<keyof BehavioralArchetypes, number>);
  },
  
  getDominantArchetype: () => {
    const scores = get().getArchetypeScores();
    const entries = Object.entries(scores) as [keyof BehavioralArchetypes, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  },
  
  // ============================================================================
  // PREDICTIVE MODELING
  // ============================================================================
  
  predictNextActivity: () => {
    const state = get();
    if (!state.profile) {
      return {
        nextLikelyActivity: 'exploring',
        optimalTiming: 'soon',
        preferredCompanions: 0,
        budgetRange: [200, 500],
        confidence: 0,
        alternativePredictions: [],
      };
    }
    
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const dominantArchetype = get().getDominantArchetype();
    
    let activity = 'exploring';
    let timing = 'within next 2 hours';
    let companions = 0;
    let budgetRange: [number, number] = [200, 500];
    let confidence = 60;
    
    // Time-based prediction
    if (hour >= 12 && hour < 14) {
      activity = 'lunch';
      timing = 'now';
      confidence = 85;
    } else if (hour >= 18 && hour < 21) {
      activity = 'dinner';
      timing = 'within 1 hour';
      confidence = 80;
    } else if (hour >= 10 && hour < 12) {
      activity = 'coffee';
      timing = 'soon';
      confidence = 70;
    }
    
    // Weekend patterns
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      if (hour >= 10 && hour < 13) {
        activity = 'brunch';
        companions = 2;
        budgetRange = [400, 800];
        timing = 'within 2 hours';
        confidence = 75;
      }
    }
    
    // Archetype influence
    if (dominantArchetype === 'socializer') {
      companions = 2;
      confidence += 10;
    } else if (dominantArchetype === 'explorer') {
      activity = 'discover_new_merchant';
      confidence += 5;
    } else if (dominantArchetype === 'planner') {
      timing = 'tomorrow evening';
      confidence += 15;
    }
    
    return {
      nextLikelyActivity: activity,
      optimalTiming: timing,
      preferredCompanions: companions,
      budgetRange,
      confidence: Math.min(100, confidence),
      alternativePredictions: [
        { activity: 'coffee', timing: 'morning', confidence: 60 },
        { activity: 'shopping', timing: 'afternoon', confidence: 45 },
      ],
    };
  },
  
  predictOptimalTiming: (activity) => {
    const hour = new Date().getHours();
    
    const timingMap: Record<string, string> = {
      coffee: hour < 11 ? 'within 1 hour' : 'tomorrow morning',
      lunch: hour >= 11 && hour < 14 ? 'now' : 'tomorrow at noon',
      dinner: hour >= 17 && hour < 21 ? 'within 2 hours' : 'tomorrow evening',
      brunch: 'Saturday or Sunday 10-1 PM',
      spa: 'weekend afternoon',
      movie: 'Friday or Saturday evening',
    };
    
    return timingMap[activity] || 'within next few hours';
  },
  
  predictBudget: () => {
    const state = get();
    if (!state.profile) return [200, 500];
    
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    let min = 200;
    let max = 500;
    
    // Time-based budgets
    if (hour >= 12 && hour < 14) {
      min = 150;
      max = 400; // lunch
    } else if (hour >= 18 && hour < 22) {
      min = 300;
      max = 800; // dinner
    }
    
    // Weekend premium
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      min = Math.floor(min * 1.3);
      max = Math.floor(max * 1.5);
    }
    
    return [min, max];
  },
  
  // ============================================================================
  // JOURNEY INTELLIGENCE
  // ============================================================================
  
  learnJourneyPattern: (sequence, duration) => {
    set(state => {
      if (!state.profile) return state;
      
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
      
      // Check if this sequence already exists
      const existingSeq = state.profile.journeyPatterns.typicalSequences.find(
        s => JSON.stringify(s.sequence) === JSON.stringify(sequence)
      );
      
      if (existingSeq) {
        // Update frequency
        existingSeq.frequency += 1;
        existingSeq.lastOccurrence = Date.now();
        if (!existingSeq.typicalDays.includes(dayOfWeek)) {
          existingSeq.typicalDays.push(dayOfWeek);
        }
      } else {
        // Add new sequence
        const newSequence: JourneySequence = {
          sequence,
          frequency: 1,
          typicalDays: [dayOfWeek],
          averageDuration: duration,
          lastOccurrence: Date.now(),
        };
        
        state.profile.journeyPatterns.typicalSequences.push(newSequence);
      }
      
      return { profile: { ...state.profile } };
    });
  },
  
  suggestNextInJourney: (currentActivity) => {
    const state = get();
    if (!state.profile) return [];
    
    // Find sequences that contain this activity
    const relevantSequences = state.profile.journeyPatterns.typicalSequences.filter(
      s => s.sequence.includes(currentActivity)
    );
    
    // Get what typically comes next
    const nextActivities: string[] = [];
    relevantSequences.forEach(seq => {
      const index = seq.sequence.indexOf(currentActivity);
      if (index >= 0 && index < seq.sequence.length - 1) {
        nextActivities.push(seq.sequence[index + 1]);
      }
    });
    
    // Return unique suggestions, sorted by frequency
    const counts = nextActivities.reduce((acc, act) => {
      acc[act] = (acc[act] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([activity]) => activity);
  },
  
  getTypicalDayPlan: (dayOfWeek) => {
    const state = get();
    if (!state.profile) return null;
    
    // Find most frequent sequence for this day
    const daySequences = state.profile.journeyPatterns.typicalSequences
      .filter(s => s.typicalDays.includes(dayOfWeek))
      .sort((a, b) => b.frequency - a.frequency);
    
    return daySequences[0] || null;
  },
  
  // ============================================================================
  // CONTEXTUAL ADAPTATION
  // ============================================================================
  
  updateContext: (context) => {
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        contextualState: {
          ...state.profile.contextualState,
          ...context,
        },
      } : null,
    }));
    
    // Re-detect mood with new context
    get().detectMood(context);
  },
  
  getContextualRecommendations: (limit = 10) => {
    const state = get();
    if (!state.profile) return [];
    
    // This would generate smart recommendations based on current context
    // For now, return filtered recommendations
    return state.recommendations
      .filter(r => r.moodAlignment > 60)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  },
  
  adaptUIForContext: () => {
    const state = get();
    if (!state.profile) {
      return { layout: 'standard' as const, tone: 'calm' as const, priorities: [] };
    }
    
    const mood = state.profile.currentMood.detectedMood;
    const energy = state.profile.contextualState.energyLevel;
    const time = state.profile.contextualState.timeContext;
    
    let layout: 'compact' | 'standard' | 'immersive' = 'standard';
    let tone: 'energetic' | 'calm' | 'professional' = 'calm';
    let priorities: string[] = [];
    
    // Mood-based adaptation
    if (mood === 'energetic' || mood === 'adventurous') {
      layout = 'immersive';
      tone = 'energetic';
      priorities = ['new_experiences', 'adventures', 'social'];
    } else if (mood === 'stressed' || mood === 'focused') {
      layout = 'compact';
      tone = 'professional';
      priorities = ['quick_options', 'nearby', 'familiar'];
    } else if (mood === 'relaxed') {
      layout = 'standard';
      tone = 'calm';
      priorities = ['comfort', 'wellness', 'leisure'];
    } else if (mood === 'celebratory') {
      layout = 'immersive';
      tone = 'energetic';
      priorities = ['premium', 'group', 'entertainment'];
    }
    
    // Time-based adaptation
    if (time === 'morning' || time === 'midday') {
      priorities = ['coffee', 'breakfast', 'lunch', ...priorities];
    } else if (time === 'evening') {
      priorities = ['dinner', 'entertainment', 'social', ...priorities];
    }
    
    return { layout, tone, priorities };
  },
  
  // ============================================================================
  // LEARNING & FEEDBACK
  // ============================================================================
  
  recordFeedback: (type, metadata) => {
    const feedbackEvent: FeedbackEvent = {
      id: `feedback_${Date.now()}`,
      type,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        context: get().profile?.contextualState,
      },
    };
    
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        feedbackHistory: [feedbackEvent, ...state.profile.feedbackHistory].slice(0, 500),
      } : null,
    }));
  },
  
  recordRecommendationOutcome: (recommendationId, acted) => {
    get().recordFeedback(
      acted ? 'recommendation_acted' : 'recommendation_ignored',
      { recommendationId, acted }
    );
    
    // Update learning metrics
    set(state => {
      if (!state.profile) return state;
      
      const totalRecommendations = state.profile.feedbackHistory.filter(
        f => f.type === 'recommendation_acted' || f.type === 'recommendation_ignored'
      ).length;
      
      const actedRecommendations = state.profile.feedbackHistory.filter(
        f => f.type === 'recommendation_acted'
      ).length;
      
      const accuracy = totalRecommendations > 0 
        ? (actedRecommendations / totalRecommendations) * 100 
        : 0;
      
      return {
        profile: {
          ...state.profile,
          learningMetrics: {
            ...state.profile.learningMetrics,
            recommendationAccuracy: accuracy,
          },
        },
      };
    });
  },
  
  calculateLearningMetrics: () => {
    const state = get();
    if (!state.profile) {
      return {
        recommendationAccuracy: 0,
        moodDetectionAccuracy: 0,
        predictionAccuracy: 0,
        adaptationSpeed: 50,
        profileCompleteness: 0,
        dataPoints: 0,
      };
    }
    
    return state.profile.learningMetrics;
  },
  
  // ============================================================================
  // PROACTIVE INSIGHTS
  // ============================================================================
  
  generateInsights: () => {
    const insights: ProactiveInsight[] = [];
    const state = get();
    
    if (!state.profile) return insights;
    
    // Pattern detection
    const patternInsights = get().detectPatternShifts();
    insights.push(...patternInsights);
    
    // Proactive suggestions
    const proactiveInsights = get().suggestProactiveActions();
    insights.push(...proactiveInsights);
    
    set({ insights });
    return insights;
  },
  
  detectPatternShifts: () => {
    const insights: ProactiveInsight[] = [];
    const state = get();
    
    if (!state.profile) return insights;
    
    // Check archetype evolution
    const recentUpdates = state.profile.archetypeEvolution.filter(
      e => e.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 // last week
    );
    
    if (recentUpdates.length > 0) {
      // Compare with earlier data
      const earlierData = state.profile.archetypeEvolution.filter(
        e => e.timestamp < Date.now() - 14 * 24 * 60 * 60 * 1000 // 2 weeks ago
      );
      
      if (earlierData.length > 0) {
        // Detect significant changes
        Object.keys(state.profile.archetypes).forEach(key => {
          const archetype = key as keyof BehavioralArchetypes;
          const currentScore = state.profile!.archetypes[archetype].score;
          
          // Find average from earlier data
          const earlierScores = earlierData
            .map(e => e.archetypes[archetype]?.score)
            .filter(s => s !== undefined) as number[];
          
          if (earlierScores.length > 0) {
            const earlierAvg = earlierScores.reduce((sum, s) => sum + s, 0) / earlierScores.length;
            const change = currentScore - earlierAvg;
            
            if (Math.abs(change) > 15) {
              insights.push({
                id: `pattern_${archetype}_${Date.now()}`,
                type: 'preference_shift',
                message: `Noticing ${change > 0 ? 'increased' : 'decreased'} interest in ${archetype} activities`,
                details: `Your ${archetype} score has ${change > 0 ? 'risen' : 'fallen'} by ${Math.abs(change).toFixed(0)} points over the past two weeks.`,
                actionable: true,
                suggestedActions: [
                  `Explore more ${archetype}-oriented experiences`,
                  'Update your preferences',
                  'See personalized recommendations',
                ],
                priority: Math.abs(change),
                timestamp: Date.now(),
              });
            }
          }
        });
      }
    }
    
    return insights;
  },
  
  suggestProactiveActions: () => {
    const insights: ProactiveInsight[] = [];
    const state = get();
    
    if (!state.profile) return insights;
    
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Friday evening planning
    if (dayOfWeek === 3 && hour >= 16) {
      const plannerScore = state.profile.archetypes.planner.score;
      if (plannerScore > 60) {
        insights.push({
          id: `proactive_friday_${Date.now()}`,
          type: 'opportunity',
          message: "You usually plan Friday outings on Wednesday - want to browse options?",
          details: "Based on your planning patterns, now's a great time to explore weekend activities.",
          actionable: true,
          suggestedActions: [
            'Browse Friday evening deals',
            'See weekend recommendations',
            'Invite friends to plan',
          ],
          priority: 75,
          timestamp: Date.now(),
        });
      }
    }
    
    // Weather-based suggestions
    if (state.profile.contextualState.weatherContext === 'rainy') {
      insights.push({
        id: `weather_rainy_${Date.now()}`,
        type: 'opportunity',
        message: "Rain expected - indoor alternatives suggested",
        details: "We've adjusted your recommendations to focus on indoor activities.",
        actionable: true,
        suggestedActions: [
          'View indoor entertainment',
          'See cozy cafe options',
          'Browse wellness activities',
        ],
        priority: 60,
        timestamp: Date.now(),
      });
    }
    
    // Favorite merchant updates
    insights.push({
      id: `merchant_update_${Date.now()}`,
      type: 'opportunity',
      message: "Your favorite cafe added a new mission matching your preferences",
      details: "Based on your coffee shop visits and reward redemptions.",
      actionable: true,
      suggestedActions: [
        'View new mission',
        'See other updates',
      ],
      priority: 70,
      timestamp: Date.now(),
    });
    
    return insights;
  },
  
  // ============================================================================
  // ADVANCED RECOMMENDATIONS
  // ============================================================================
  
  getPersonalizedRecommendations: (filters) => {
    const state = get();
    let recommendations = state.recommendations;
    
    if (filters?.type) {
      recommendations = recommendations.filter(r => r.type === filters.type);
    }
    
    if (filters?.minRelevance !== undefined) {
      recommendations = recommendations.filter(r => r.relevanceScore >= filters.minRelevance!);
    }
    
    if (filters?.mood) {
      recommendations = recommendations.filter(r => r.context.mood === filters.mood);
    }
    
    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },
  
  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  getProfileSummary: () => {
    const state = get();
    if (!state.profile) {
      return {
        archetypeSummary: 'Profile not initialized',
        currentMood: 'Unknown',
        topPredictions: [],
        learningQuality: 'No data',
      };
    }
    
    const dominantArchetype = get().getDominantArchetype();
    const prediction = get().predictNextActivity();
    
    const archetypeSummary = `Primary: ${dominantArchetype} (${state.profile.archetypes[dominantArchetype].score}%)`;
    const currentMood = `${state.profile.currentMood.detectedMood} (${state.profile.currentMood.confidence.toFixed(0)}% confident)`;
    const topPredictions = [
      `${prediction.nextLikelyActivity} at ${prediction.optimalTiming}`,
      ...prediction.alternativePredictions.map(p => `${p.activity} (${p.confidence}%)`),
    ];
    
    const accuracy = state.profile.learningMetrics.recommendationAccuracy;
    const learningQuality = accuracy > 70 ? 'Excellent' : accuracy > 50 ? 'Good' : accuracy > 30 ? 'Learning' : 'Limited data';
    
    return {
      archetypeSummary,
      currentMood,
      topPredictions,
      learningQuality,
    };
  },
  
  // ============================================================================
  // CONTINUOUS LEARNING
  // ============================================================================
  
  analyzeAndLearn: () => {
    set({ isAnalyzing: true });
    
    // Run analysis
    get().generateInsights();
    get().calculateLearningMetrics();
    get().detectMood();
    
    set({ isAnalyzing: false });
  },
  
  evolveProfile: () => {
    const state = get();
    if (!state.profile) return;
    
    // Save current archetype state to evolution history
    const snapshot = {
      timestamp: Date.now(),
      archetypes: { ...state.profile.archetypes },
    };
    
    set(state => ({
      profile: state.profile ? {
        ...state.profile,
        archetypeEvolution: [snapshot, ...state.profile.archetypeEvolution].slice(0, 50),
      } : null,
    }));
    
    // Detect dominant archetype changes
    const newDominant = get().getDominantArchetype();
    if (newDominant !== state.profile.dominantArchetype) {
      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          dominantArchetype: newDominant,
        } : null,
      }));
    }
  },
}));
