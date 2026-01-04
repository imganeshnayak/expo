import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Mood = 'energetic' | 'relaxed' | 'stressed' | 'celebratory' | 'adventurous' | 'focused' | 'neutral';

export interface ArchetypeParams {
    explorer: number;
    foodie: number;
    socialite: number;
    planner: number;
    adventurer: number;
    relaxer: number;
}

export interface UserContext {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late_night';
    isWeekend: boolean;
    weather: 'clear' | 'rain' | 'cloudy' | 'hot';
    locationContext: 'home' | 'work' | 'out' | 'traveling';
}

interface PersonaState {
    // Core Identity
    archetypes: ArchetypeParams;

    // Real-time State
    currentMood: Mood;
    context: UserContext;

    // AI Insights
    predictions: {
        nextLikelyActivity: string;
        recommendedMerchants: string[]; // IDs
    };

    // Actions
    updateArchetypes: (scores: Partial<ArchetypeParams>) => void;
    setMood: (mood: Mood) => void;
    updateContext: (ctx: Partial<UserContext>) => void;
    generatePredictions: () => void; // Mock AI logic
}

export const usePersonaStore = create<PersonaState>()(
    persist(
        (set, get) => ({
            archetypes: {
                explorer: 50,
                foodie: 30,
                socialite: 40,
                planner: 20,
                adventurer: 30,
                relaxer: 20,
            },
            currentMood: 'neutral',
            context: {
                timeOfDay: 'morning',
                isWeekend: false,
                weather: 'clear',
                locationContext: 'home',
            },
            predictions: {
                nextLikelyActivity: 'Coffee',
                recommendedMerchants: [],
            },

            updateArchetypes: (scores) => set((state) => ({
                archetypes: { ...state.archetypes, ...scores }
            })),

            setMood: (mood) => set({ currentMood: mood }),

            updateContext: (ctx) => set((state) => ({
                context: { ...state.context, ...ctx }
            })),

            generatePredictions: () => {
                const { archetypes, currentMood, context } = get();
                let nextActivity = 'Browsing';

                if (context.timeOfDay === 'morning') nextActivity = 'Coffee Run';
                if (context.timeOfDay === 'evening') nextActivity = 'Dinner';
                if (currentMood === 'energetic') nextActivity = 'Adventure';
                if (currentMood === 'relaxed') nextActivity = 'Spa / Chill';

                set({
                    predictions: {
                        nextLikelyActivity: nextActivity,
                        recommendedMerchants: []
                    }
                });
            }
        }),
        {
            name: 'utopia-persona-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
