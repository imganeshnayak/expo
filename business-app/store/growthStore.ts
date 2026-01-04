import { create } from 'zustand';

export interface CampaignSuggestion {
    id: string;
    type: 'retention' | 'acquisition' | 'boost';
    title: string;
    description: string;
    predictedImpact: string; // "+15% Revenue"
    recommendedAction: string; // "Send 'We Miss You' Push"
}

export interface GrowthInsight {
    id: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    trend: 'positive' | 'negative' | 'neutral';
}

interface GrowthState {
    healthScore: number;
    insights: GrowthInsight[];
    suggestions: CampaignSuggestion[];

    // Actions
    refreshInsights: () => void;
    dismissSuggestion: (id: string) => void;
}

export const useGrowthStore = create<GrowthState>((set) => ({
    healthScore: 82, // Mock starting score

    insights: [
        { id: '1', severity: 'medium', message: 'Tuesday afternoons have 30% less traffic.', trend: 'negative' },
        { id: '2', severity: 'high', message: '40% of Platinum users haven\'t visited in 30 days.', trend: 'negative' },
        { id: '3', severity: 'low', message: 'Weekend revenue is up 12% vs last month.', trend: 'positive' },
    ],

    suggestions: [
        {
            id: 'c1',
            type: 'boost',
            title: 'Fill the Void',
            description: 'Launch a Happy Hour for Tuesday 2PM-5PM.',
            predictedImpact: '+20% Traffic',
            recommendedAction: 'Create Flash Deal',
        },
        {
            id: 'c2',
            type: 'retention',
            title: 'Win Back VIPs',
            description: 'Send a "We Miss You" points boost to inactive Platinum users.',
            predictedImpact: 'Retain 15% Users',
            recommendedAction: 'Send Push Notification',
        }
    ],

    refreshInsights: () => {
        // Mock refresh logic
        set({ healthScore: Math.floor(Math.random() * 20) + 80 });
    },

    dismissSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id)
    })),
}));
