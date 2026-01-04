import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loyaltyService } from '@/services/api';
import { useLoyaltyStore } from './loyaltyStore';


export type MissionDifficulty = 'easy' | 'medium' | 'hard';
export type MissionCategory = 'food' | 'entertainment' | 'wellness' | 'shopping' | 'adventure';
export type StepType = 'ride' | 'deal' | 'visit' | 'scan';

export interface MissionStep {
  id: string;
  type: StepType;
  dealId?: string;
  merchantId?: string;
  instructions: string;
  completed: boolean;
  actionRequired: boolean;
  deepLink?: string;
  completedAt?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: MissionDifficulty;
  steps: MissionStep[];
  reward: number;
  estimatedSavings: number;
  completed: boolean;
  progress: number;
  timeEstimate: string;
  category: MissionCategory;
  categoryColor: string;
  expiresAt?: number;
  startedAt?: number;
  completedAt?: number;
}

interface MissionState {
  missions: Mission[];
  activeMissions: Mission[];
  completedMissions: Mission[];
  totalPoints: number;
  badges: string[];

  // Actions
  initializeMissions: () => void;
  startMission: (missionId: string) => void;
  completeStep: (missionId: string, stepId: string) => void;
  checkMissionCompletion: (missionId: string) => void;
  claimReward: (missionId: string) => void;
  getRecommendedMissions: (userPreferences?: any) => Mission[];
  trackRideBooking: (rideId: string) => void;
  trackDealBooking: (dealId: string) => void;
  trackQRScan: (merchantId: string) => void;
}

// Sample missions data
const sampleMissions: Mission[] = [
  {
    id: 'friday-night-thrills',
    title: '🎮 Friday Night Thrills',
    description: 'Complete the ultimate evening entertainment experience',
    icon: 'Gamepad2',
    difficulty: 'medium',
    category: 'entertainment',
    categoryColor: '#9B59B6',
    reward: 300,
    estimatedSavings: 200,
    completed: false,
    progress: 0,
    timeEstimate: '3-4 hours',
    steps: [
      {
        id: 'step1',
        type: 'ride',
        instructions: 'Book a ride to gaming zone',
        completed: false,
        actionRequired: true,
        deepLink: '/ride-booking',
      },
      {
        id: 'step2',
        type: 'visit',
        merchantId: 'gaming-zone-001',
        instructions: 'Play 1 hour at gaming zone',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step3',
        type: 'deal',
        dealId: 'restaurant-dinner-001',
        instructions: 'Enjoy dinner at nearby restaurant',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
    ],
  },
  {
    id: 'weekend-explorer',
    title: '🗺️ Weekend Explorer',
    description: 'Discover different experiences across the city',
    icon: 'Compass',
    difficulty: 'easy',
    category: 'adventure',
    categoryColor: '#E74C3C',
    reward: 250,
    estimatedSavings: 150,
    completed: false,
    progress: 0,
    timeEstimate: '2-3 hours',
    steps: [
      {
        id: 'step1',
        type: 'visit',
        instructions: 'Visit a food establishment',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step2',
        type: 'visit',
        instructions: 'Visit a wellness center',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step3',
        type: 'visit',
        instructions: 'Visit a shopping store',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step4',
        type: 'ride',
        instructions: 'Complete 1 ride booking',
        completed: false,
        actionRequired: true,
        deepLink: '/ride-booking',
      },
    ],
  },
  {
    id: 'coffee-connoisseur',
    title: '☕ Coffee Connoisseur',
    description: 'Experience the best coffee spots in town',
    icon: 'Coffee',
    difficulty: 'easy',
    category: 'food',
    categoryColor: '#F39C12',
    reward: 200,
    estimatedSavings: 100,
    completed: false,
    progress: 0,
    timeEstimate: '2-3 hours',
    steps: [
      {
        id: 'step1',
        type: 'scan',
        merchantId: 'starbucks-001',
        instructions: 'Visit Starbucks and scan QR',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step2',
        type: 'scan',
        merchantId: 'local-cafe-001',
        instructions: 'Try a local cafe',
        completed: false,
        actionRequired: true,
      },
      {
        id: 'step3',
        type: 'scan',
        merchantId: 'artisan-coffee-001',
        instructions: 'Visit artisan coffee shop',
        completed: false,
        actionRequired: true,
      },
    ],
  },
  {
    id: 'wellness-warrior',
    title: '🧘 Wellness Warrior',
    description: 'Complete your wellness journey',
    icon: 'Heart',
    difficulty: 'hard',
    category: 'wellness',
    categoryColor: '#1ABC9C',
    reward: 350,
    estimatedSavings: 250,
    completed: false,
    progress: 0,
    timeEstimate: '4-5 hours',
    steps: [
      {
        id: 'step1',
        type: 'deal',
        dealId: 'clinic-consultation-001',
        instructions: 'Book clinic consultation',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
      {
        id: 'step2',
        type: 'deal',
        dealId: 'spa-treatment-001',
        instructions: 'Get a spa treatment',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
      {
        id: 'step3',
        type: 'deal',
        dealId: 'healthy-lunch-001',
        instructions: 'Enjoy a healthy lunch',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
    ],
  },
  {
    id: 'foodie-friday',
    title: '🍕 Foodie Friday',
    description: 'Taste the best cuisines in your area',
    icon: 'UtensilsCrossed',
    difficulty: 'medium',
    category: 'food',
    categoryColor: '#E67E22',
    reward: 275,
    estimatedSavings: 180,
    completed: false,
    progress: 0,
    timeEstimate: '3-4 hours',
    steps: [
      {
        id: 'step1',
        type: 'ride',
        instructions: 'Book ride to first restaurant',
        completed: false,
        actionRequired: true,
        deepLink: '/ride-booking',
      },
      {
        id: 'step2',
        type: 'deal',
        dealId: 'pizza-deal-001',
        instructions: 'Try the pizza special',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
      {
        id: 'step3',
        type: 'scan',
        merchantId: 'dessert-shop-001',
        instructions: 'Get dessert at sweet shop',
        completed: false,
        actionRequired: true,
      },
    ],
  },
  {
    id: 'shopping-spree',
    title: '🛍️ Shopping Spree',
    description: 'Shop smart and save big',
    icon: 'ShoppingBag',
    difficulty: 'easy',
    category: 'shopping',
    categoryColor: '#3498DB',
    reward: 225,
    estimatedSavings: 300,
    completed: false,
    progress: 0,
    timeEstimate: '2-3 hours',
    steps: [
      {
        id: 'step1',
        type: 'deal',
        dealId: 'electronics-deal-001',
        instructions: 'Browse electronics deals',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
      {
        id: 'step2',
        type: 'deal',
        dealId: 'fashion-deal-001',
        instructions: 'Check out fashion offers',
        completed: false,
        actionRequired: true,
        deepLink: '/',
      },
      {
        id: 'step3',
        type: 'scan',
        merchantId: 'mall-001',
        instructions: 'Visit the shopping mall',
        completed: false,
        actionRequired: true,
      },
    ],
  },
];

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: sampleMissions, // Initialize with sample missions for demo
      activeMissions: [],
      completedMissions: [],
      totalPoints: 0,
      badges: [],

      initializeMissions: async () => {
        try {
          const response = await loyaltyService.getMissions();
          if (response.data && response.data.length > 0) {
            // Map backend _id to frontend id
            const mappedMissions = response.data.map((m: any) => ({
              ...m,
              id: m._id,
              progress: m.progress || 0,
              completed: m.completed || false,
              steps: m.steps || [],
              reward: m.rewardPoints || m.reward || 0
            }));
            set({ missions: mappedMissions });
          } else {
            // API returned empty array - use sample missions for demo
            console.log('[MissionStore] Using sample missions for demo');
            set({ missions: sampleMissions });
          }
        } catch (error) {
          console.error('Failed to fetch missions, using sample data', error);
          // Always fallback to sample missions
          set({ missions: sampleMissions });
        }
      },

      startMission: (missionId: string) => {
        set((state) => {
          const missions = state.missions.map((mission) =>
            mission.id === missionId
              ? { ...mission, startedAt: Date.now() }
              : mission
          );
          const activeMissions = missions.filter(
            (m) => m.startedAt && !m.completed
          );
          return { missions, activeMissions };
        });
      },

      completeStep: (missionId: string, stepId: string) => {
        set((state) => {
          const missions = state.missions.map((mission) => {
            if (mission.id === missionId) {
              const steps = mission.steps.map((step) =>
                step.id === stepId
                  ? { ...step, completed: true, completedAt: Date.now() }
                  : step
              );
              const completedSteps = steps.filter((s) => s.completed).length;
              const progress = (completedSteps / steps.length) * 100;
              return { ...mission, steps, progress };
            }
            return mission;
          });
          return { missions };
        });

        // Check if mission is complete
        get().checkMissionCompletion(missionId);
      },

      checkMissionCompletion: (missionId: string) => {
        const mission = get().missions.find((m) => m.id === missionId);
        if (!mission) return;

        const allStepsCompleted = mission.steps.every((step) => step.completed);

        if (allStepsCompleted && !mission.completed) {
          set((state) => {
            const missions = state.missions.map((m) =>
              m.id === missionId
                ? { ...m, completed: true, completedAt: Date.now(), progress: 100 }
                : m
            );
            const completedMissions = missions.filter((m) => m.completed);
            const activeMissions = missions.filter(
              (m) => m.startedAt && !m.completed
            );
            return { missions, completedMissions, activeMissions };
          });
        }
      },

      claimReward: (missionId: string) => {
        const mission = get().missions.find((m) => m.id === missionId);
        if (!mission || !mission.completed) return;

        set((state) => ({
          totalPoints: state.totalPoints + mission.reward,
          badges: [...state.badges, `${mission.category}-${mission.difficulty}`],
        }));

        // Bonus: Award stamps for mission completion (if any steps involved merchants)
        try {
          const earnStamp = useLoyaltyStore.getState().earnStamp;

          // Find merchant-related steps in the mission
          const merchantSteps = mission.steps.filter(
            step => step.type === 'deal' || step.type === 'scan' || step.type === 'visit'
          );

          // Award bonus stamp if mission had merchant interactions
          if (merchantSteps.length > 0) {
            console.log('🎁 Mission completion bonus: Awarding loyalty stamp!');
            // earnStamp(merchantSteps[0].merchantId, undefined, 'Mission Bonus');
          }
        } catch (error) {
          console.log('Loyalty store interaction failed', error);
        }
      },

      getRecommendedMissions: (userPreferences = {}) => {
        const { missions } = get();
        const currentHour = new Date().getHours();

        // Time-based filtering
        let recommended = [...missions];

        // Evening missions (6 PM - 11 PM)
        if (currentHour >= 18 && currentHour <= 23) {
          recommended = recommended.sort((a, b) => {
            const eveningCategories = ['entertainment', 'food'];
            const aScore = eveningCategories.includes(a.category) ? 1 : 0;
            const bScore = eveningCategories.includes(b.category) ? 1 : 0;
            return bScore - aScore;
          });
        }

        // Morning missions (6 AM - 12 PM)
        if (currentHour >= 6 && currentHour <= 12) {
          recommended = recommended.sort((a, b) => {
            const morningCategories = ['food', 'wellness'];
            const aScore = morningCategories.includes(a.category) ? 1 : 0;
            const bScore = morningCategories.includes(b.category) ? 1 : 0;
            return bScore - aScore;
          });
        }

        // Filter out completed missions
        recommended = recommended.filter((m) => !m.completed);

        return recommended;
      },

      trackRideBooking: (rideId: string) => {
        const { missions } = get();
        missions.forEach((mission) => {
          mission.steps.forEach((step) => {
            if (step.type === 'ride' && !step.completed) {
              get().completeStep(mission.id, step.id);
            }
          });
        });
      },

      trackDealBooking: (dealId: string) => {
        const { missions } = get();
        missions.forEach((mission) => {
          mission.steps.forEach((step) => {
            if (
              step.type === 'deal' &&
              !step.completed &&
              (!step.dealId || step.dealId === dealId)
            ) {
              get().completeStep(mission.id, step.id);
            }
          });
        });
      },

      trackQRScan: (merchantId: string) => {
        const { missions } = get();
        missions.forEach((mission) => {
          mission.steps.forEach((step) => {
            if (
              (step.type === 'scan' || step.type === 'visit') &&
              !step.completed &&
              (!step.merchantId || step.merchantId === merchantId)
            ) {
              get().completeStep(mission.id, step.id);
            }
          });
        });
      },
    }),
    {
      name: 'mission-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
