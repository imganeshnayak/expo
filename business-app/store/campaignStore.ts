import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CampaignCategory = 'acquisition' | 'retention' | 'reactivation' | 'loyalty';
export type CampaignDifficulty = 'simple' | 'advanced';
export type CampaignType = 'stamp_card' | 'discount' | 'ride_reimbursement' | 'mission' | 'combo' | 'flash_deal';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type AudienceType = 'all' | 'new' | 'returning' | 'high_value' | 'at_risk';
export type TimingType = 'always' | 'schedule';

export interface CampaignTemplate {
  id: string;
  name: string;
  category: CampaignCategory;
  difficulty: CampaignDifficulty;
  description: string;
  estimatedROI: number;
  successRate: number; // % of merchants who see positive results
  icon: string;
  defaultConfig: Partial<Campaign>;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  category: CampaignCategory;
  status: CampaignStatus;
  budget: {
    total: number;
    spent: number;
    dailyLimit?: number;
  };
  targeting: {
    audience: AudienceType;
    location: 'all' | 'specific_zone';
    timing: TimingType;
    scheduleStart?: number; // timestamp
    scheduleEnd?: number; // timestamp
    minSpend?: number;
    maxUses?: number;
    maxUsesPerCustomer?: number;
  };
  offer: {
    discountPercent?: number;
    rideReimbursement?: number;
    freeItem?: string;
    stampReward?: number;
    bonusStamps?: number;
  };
  performance: {
    impressions: number;
    conversions: number;
    revenue: number;
    roi: number;
    costPerAcquisition: number;
    clickThroughRate: number;
  };
  createdAt: number;
  updatedAt: number;
  merchantId: string;
  // Frontend Deal Interface Fields
  title?: string;
  description?: string;
  consumerCategory?: string;
  images?: string[];
  termsAndConditions?: string[];
  pricing?: {
    originalPrice: number;
    discountedPrice: number;
  };
  maxRedemptions?: number;
  // Specific Deal Configs
  stampConfig?: {
    totalStamps: number;
    rewardDescription: string;
  };
  flashConfig?: {
    startTime: number;
    endTime: number;
    urgencyLabel?: string; // e.g. "Ending Soon"
  };
}

export interface AIOptimization {
  campaignId: string;
  type: 'budget' | 'targeting' | 'offer' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  actionable: boolean;
  action?: {
    label: string;
    params: any;
  };
}

interface CampaignState {
  templates: CampaignTemplate[];
  campaigns: Campaign[];
  draftCampaign: Partial<Campaign> | null;
  currentStep: number;
  isLoading: boolean;

  // Actions
  initializeCampaigns: (merchantId: string) => void;
  loadTemplates: () => void;
  startCampaignFromTemplate: (templateId: string, merchantId: string) => void;
  updateDraftCampaign: (updates: Partial<Campaign>) => void;
  setCurrentStep: (step: number) => void;
  saveDraft: () => void;
  launchCampaign: () => void;
  pauseCampaign: (campaignId: string) => void;
  resumeCampaign: (campaignId: string) => void;
  archiveCampaign: (campaignId: string) => void;
  updateCampaignPerformance: (campaignId: string, metrics: Partial<Campaign['performance']>) => void;
  getAIOptimizations: (campaignId: string) => AIOptimization[];
  applyOptimization: (optimization: AIOptimization) => void;
  duplicateCampaign: (campaignId: string) => void;
  createTemplate: (template: Omit<CampaignTemplate, 'id'>) => void;
}

// ============================================================================
// CAMPAIGN TEMPLATES
// ============================================================================

const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'tmpl_new_customer_blast',
    name: 'New Customer Blast',
    category: 'acquisition',
    difficulty: 'simple',
    description: 'High-value offer to attract first-time customers with ride reimbursement + discount',
    estimatedROI: 280,
    successRate: 87,
    icon: 'rocket',
    defaultConfig: {
      type: 'combo',
      targeting: {
        audience: 'new',
        location: 'all',
        timing: 'always',
        maxUsesPerCustomer: 1,
      },
      offer: {
        rideReimbursement: 200,
        discountPercent: 15,
      },
      budget: {
        total: 10000,
        spent: 0,
        dailyLimit: 1000,
      },
    },
  },
  {
    id: 'tmpl_weekend_warrior',
    name: 'Weekend Warrior',
    category: 'retention',
    difficulty: 'simple',
    description: 'Friday-Sunday special with bonus stamps to drive weekend traffic',
    estimatedROI: 245,
    successRate: 82,
    icon: 'calendar',
    defaultConfig: {
      type: 'stamp_card',
      targeting: {
        audience: 'all',
        location: 'all',
        timing: 'schedule',
      },
      offer: {
        bonusStamps: 2,
        discountPercent: 10,
      },
      budget: {
        total: 5000,
        spent: 0,
      },
    },
  },
  {
    id: 'tmpl_lunch_rush',
    name: 'Lunch Rush Booster',
    category: 'acquisition',
    difficulty: 'simple',
    description: '11 AM - 2 PM special for office workers with quick service discount',
    estimatedROI: 310,
    successRate: 91,
    icon: 'clock',
    defaultConfig: {
      type: 'discount',
      targeting: {
        audience: 'all',
        location: 'all',
        timing: 'schedule',
      },
      offer: {
        discountPercent: 20,
      },
      budget: {
        total: 8000,
        spent: 0,
        dailyLimit: 800,
      },
    },
  },
  {
    id: 'tmpl_vip_treatment',
    name: 'VIP Treatment',
    category: 'loyalty',
    difficulty: 'advanced',
    description: 'Exclusive offers for top 10% customers to boost retention',
    estimatedROI: 420,
    successRate: 94,
    icon: 'crown',
    defaultConfig: {
      type: 'combo',
      targeting: {
        audience: 'high_value',
        location: 'all',
        timing: 'always',
        minSpend: 5000,
      },
      offer: {
        discountPercent: 25,
        bonusStamps: 3,
        rideReimbursement: 150,
      },
      budget: {
        total: 15000,
        spent: 0,
      },
    },
  },
  {
    id: 'tmpl_comeback',
    name: 'Come Back Soon',
    category: 'reactivation',
    difficulty: 'simple',
    description: 'Win-back campaign for customers who haven\'t visited in 3+ weeks',
    estimatedROI: 195,
    successRate: 68,
    icon: 'refresh',
    defaultConfig: {
      type: 'discount',
      targeting: {
        audience: 'at_risk',
        location: 'all',
        timing: 'always',
        maxUsesPerCustomer: 1,
      },
      offer: {
        discountPercent: 25,
        rideReimbursement: 100,
      },
      budget: {
        total: 7000,
        spent: 0,
      },
    },
  },
  {
    id: 'tmpl_loyalty_accelerator',
    name: 'Loyalty Accelerator',
    category: 'loyalty',
    difficulty: 'simple',
    description: 'Stamp card with bonus stamps to increase completion rates',
    estimatedROI: 265,
    successRate: 85,
    icon: 'award',
    defaultConfig: {
      type: 'stamp_card',
      targeting: {
        audience: 'returning',
        location: 'all',
        timing: 'always',
      },
      offer: {
        stampReward: 5,
        bonusStamps: 2,
      },
      budget: {
        total: 6000,
        spent: 0,
      },
    },
  },
  {
    id: 'tmpl_competitive_conquest',
    name: 'Competitive Conquest',
    category: 'acquisition',
    difficulty: 'advanced',
    description: 'Match or beat competitor pricing with aggressive offers',
    estimatedROI: 175,
    successRate: 72,
    icon: 'target',
    defaultConfig: {
      type: 'combo',
      targeting: {
        audience: 'new',
        location: 'all',
        timing: 'always',
        maxUses: 100,
      },
      offer: {
        discountPercent: 30,
        rideReimbursement: 250,
      },
      budget: {
        total: 20000,
        spent: 0,
        dailyLimit: 2000,
      },
    },
  },
  {
    id: 'tmpl_flash_sale',
    name: '2-Hour Flash Sale',
    category: 'acquisition',
    difficulty: 'advanced',
    description: 'Time-limited deep discount to create urgency',
    estimatedROI: 340,
    successRate: 79,
    icon: 'zap',
    defaultConfig: {
      type: 'discount',
      targeting: {
        audience: 'all',
        location: 'all',
        timing: 'schedule',
        maxUses: 50,
      },
      offer: {
        discountPercent: 40,
      },
      budget: {
        total: 5000,
        spent: 0,
      },
    },
  },
];

// ============================================================================
// SAMPLE CAMPAIGNS
// ============================================================================

const generateSampleCampaigns = (merchantId: string): Campaign[] => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: 'camp_001',
      name: '₹100 Stamp Card Campaign',
      type: 'stamp_card',
      category: 'loyalty',
      status: 'active',
      merchantId,
      budget: {
        total: 10000,
        spent: 3700,
        dailyLimit: 1000,
      },
      targeting: {
        audience: 'all',
        location: 'all',
        timing: 'always',
        maxUsesPerCustomer: 1,
      },
      offer: {
        stampReward: 8,
        bonusStamps: 1,
      },
      performance: {
        impressions: 1245,
        conversions: 185,
        revenue: 18500,
        roi: 270,
        costPerAcquisition: 20,
        clickThroughRate: 18.5,
      },
      createdAt: now - 15 * dayMs,
      updatedAt: now,
      // Frontend Deal Fields
      title: '₹100 Stamp Card Campaign',
      description: 'Collect stamps and get rewards!',
      consumerCategory: 'Loyalty',
      images: ['https://via.placeholder.com/300'],
      termsAndConditions: ['One stamp per visit'],
      pricing: {
        originalPrice: 0,
        discountedPrice: 0,
      },
      maxRedemptions: 1000,
    },
    {
      id: 'camp_002',
      name: 'Weekend Special - 20% Off',
      type: 'discount',
      category: 'retention',
      status: 'active',
      merchantId,
      budget: {
        total: 5000,
        spent: 2800,
      },
      targeting: {
        audience: 'returning',
        location: 'all',
        timing: 'schedule',
        scheduleStart: now,
        scheduleEnd: now + 2 * dayMs,
      },
      offer: {
        discountPercent: 20,
      },
      performance: {
        impressions: 890,
        conversions: 124,
        revenue: 12400,
        roi: 254,
        costPerAcquisition: 22.5,
        clickThroughRate: 21.4,
      },
      createdAt: now - 7 * dayMs,
      updatedAt: now,
      // Frontend Deal Fields
      title: 'Weekend Special - 20% Off',
      description: 'Get 20% off this weekend!',
      consumerCategory: 'Shopping',
      images: ['https://via.placeholder.com/300'],
      termsAndConditions: ['Valid Sat-Sun only'],
      pricing: {
        originalPrice: 100,
        discountedPrice: 80,
      },
      maxRedemptions: 500,
    },
    {
      id: 'camp_003',
      name: 'First Visit Free Ride',
      type: 'ride_reimbursement',
      category: 'acquisition',
      status: 'paused',
      merchantId,
      budget: {
        total: 8000,
        spent: 4200,
        dailyLimit: 800,
      },
      targeting: {
        audience: 'new',
        location: 'all',
        timing: 'always',
        maxUsesPerCustomer: 1,
      },
      offer: {
        rideReimbursement: 200,
        discountPercent: 10,
      },
      performance: {
        impressions: 456,
        conversions: 87,
        revenue: 8700,
        roi: 133,
        costPerAcquisition: 48,
        clickThroughRate: 14.5,
      },
      createdAt: now - 20 * dayMs,
      updatedAt: now - 2 * dayMs,
      // Frontend Deal Fields
      title: 'First Visit Free Ride',
      description: 'Get a free ride to our store for your first visit!',
      consumerCategory: 'Travel',
      images: ['https://via.placeholder.com/300'],
      termsAndConditions: ['New customers only'],
      pricing: {
        originalPrice: 200,
        discountedPrice: 0,
      },
      maxRedemptions: 500,
    },
  ];
};

// ============================================================================
// AI OPTIMIZATION ENGINE
// ============================================================================

const generateAIOptimizations = (campaign: Campaign): AIOptimization[] => {
  const optimizations: AIOptimization[] = [];

  // Budget optimization
  if (campaign.performance.roi > 250 && campaign.budget.spent / campaign.budget.total > 0.7) {
    optimizations.push({
      campaignId: campaign.id,
      type: 'budget',
      priority: 'high',
      title: 'Increase Budget - Campaign Performing Well',
      description: `This campaign has ${campaign.performance.roi}% ROI and is 70% through budget. Increasing budget by 50% could generate ₹${Math.round((campaign.budget.total * 0.5 * campaign.performance.roi) / 100)} additional revenue.`,
      expectedImpact: `+₹${Math.round((campaign.budget.total * 0.5 * campaign.performance.roi) / 100)} revenue`,
      actionable: true,
      action: {
        label: 'Increase Budget',
        params: { newBudget: Math.round(campaign.budget.total * 1.5) },
      },
    });
  }

  // Low ROI warning
  if (campaign.performance.roi < 150 && campaign.performance.conversions > 20) {
    optimizations.push({
      campaignId: campaign.id,
      type: 'offer',
      priority: 'high',
      title: 'Low ROI - Reduce Offer Amount',
      description: `ROI of ${campaign.performance.roi}% is below target. Consider reducing discount from ${campaign.offer.discountPercent}% to ${(campaign.offer.discountPercent || 0) - 5}% to improve profitability.`,
      expectedImpact: '+50% ROI improvement',
      actionable: true,
      action: {
        label: 'Reduce Discount',
        params: { newDiscount: (campaign.offer.discountPercent || 0) - 5 },
      },
    });
  }

  // Targeting optimization
  if (campaign.targeting.audience === 'all' && campaign.performance.conversions > 50) {
    optimizations.push({
      campaignId: campaign.id,
      type: 'targeting',
      priority: 'medium',
      title: 'Narrow Targeting for Better Results',
      description: 'This campaign could perform 30% better by targeting returning customers instead of everyone. Returning customers convert at 2.5x the rate.',
      expectedImpact: '+30% conversion rate',
      actionable: true,
      action: {
        label: 'Target Returning',
        params: { audience: 'returning' },
      },
    });
  }

  // Timing optimization
  if (campaign.targeting.timing === 'always') {
    optimizations.push({
      campaignId: campaign.id,
      type: 'timing',
      priority: 'low',
      title: 'Schedule for Peak Hours',
      description: 'Based on analytics, 68% of conversions happen 6-8 PM. Scheduling this campaign for peak hours could reduce budget waste by 40%.',
      expectedImpact: '-40% budget waste',
      actionable: true,
      action: {
        label: 'Schedule Peak Hours',
        params: { timing: 'schedule' },
      },
    });
  }

  // Daily limit recommendation
  if (!campaign.budget.dailyLimit && campaign.budget.total > 5000) {
    optimizations.push({
      campaignId: campaign.id,
      type: 'budget',
      priority: 'medium',
      title: 'Add Daily Budget Limit',
      description: 'Setting a daily limit of ₹1,000 prevents budget from being depleted too quickly and allows for better optimization over time.',
      expectedImpact: 'Better budget control',
      actionable: true,
      action: {
        label: 'Set Daily Limit',
        params: { dailyLimit: 1000 },
      },
    });
  }

  return optimizations;
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      templates: [],
      campaigns: [],
      draftCampaign: null,
      currentStep: 0,
      isLoading: false,

      initializeCampaigns: async (merchantId: string) => {
        set({ isLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            campaigns: Campaign[];
          }>('/api/campaigns');

          set({
            campaigns: (response.campaigns || []).map((c: any) => ({
              ...c,
              id: c._id || c.id,
            })),
            isLoading: false
          });
          console.log(`🎯 Loaded ${response.campaigns?.length || 0} campaigns from API`);
        } catch (error: any) {
          console.error('❌ Failed to load campaigns:', error.message);
          // Fallback to sample data
          const sampleCampaigns = generateSampleCampaigns(merchantId);
          set({
            campaigns: sampleCampaigns,
            isLoading: false
          });
          console.log(`🎯 Using ${sampleCampaigns.length} sample campaigns (API unavailable)`);
        }
      },

      loadTemplates: () => {
        set({ templates: CAMPAIGN_TEMPLATES });
        console.log(`📋 Loaded ${CAMPAIGN_TEMPLATES.length} campaign templates`);
      },

      startCampaignFromTemplate: (templateId: string, merchantId: string) => {
        const template = CAMPAIGN_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        const newCampaign: Partial<Campaign> = {
          id: `camp_${Date.now()}`,
          name: template.name,
          merchantId,
          category: template.category,
          status: 'draft',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          performance: {
            impressions: 0,
            conversions: 0,
            revenue: 0,
            roi: 0,
            costPerAcquisition: 0,
            clickThroughRate: 0,
          },
          ...template.defaultConfig,
          // Initialize Frontend Deal Fields
          title: template.name,
          description: template.description,
          consumerCategory: 'Food', // Default
          images: ['https://via.placeholder.com/300'],
          termsAndConditions: ['Valid at all locations', 'Cannot be combined with other offers'],
          pricing: {
            originalPrice: 0,
            discountedPrice: 0,
          },
          maxRedemptions: template.defaultConfig.targeting?.maxUses || 100,
        };

        set({ draftCampaign: newCampaign, currentStep: 1 });
        console.log(`✨ Started campaign from template: ${template.name}`);
      },

      updateDraftCampaign: (updates: Partial<Campaign>) => {
        const { draftCampaign } = get();
        if (!draftCampaign) return;

        set({
          draftCampaign: {
            ...draftCampaign,
            ...updates,
            updatedAt: Date.now(),
          },
        });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      saveDraft: () => {
        const { draftCampaign, campaigns } = get();
        if (!draftCampaign || !draftCampaign.id) return;

        const existingIndex = campaigns.findIndex(c => c.id === draftCampaign.id);

        if (existingIndex >= 0) {
          const updatedCampaigns = [...campaigns];
          updatedCampaigns[existingIndex] = { ...campaigns[existingIndex], ...draftCampaign };
          set({ campaigns: updatedCampaigns });
        } else {
          set({ campaigns: [...campaigns, draftCampaign as Campaign] });
        }

        console.log(`💾 Saved draft campaign: ${draftCampaign.name}`);
      },

      launchCampaign: async () => {
        const { draftCampaign, campaigns } = get();
        if (!draftCampaign) return;

        set({ isLoading: true });
        try {
          const campaignData = {
            ...draftCampaign,
            status: 'active',
          };

          let savedCampaign: Campaign;

          if (draftCampaign.id && campaigns.some(c => c.id === draftCampaign.id)) {
            // Update existing
            await api.put(`/api/campaigns/${draftCampaign.id}`, campaignData);
            savedCampaign = campaignData as Campaign; // Optimistic
          } else {
            // Create new
            const response = await api.post<{ success: boolean; campaign: any }>('/api/campaigns', campaignData);
            savedCampaign = { ...response.campaign, id: response.campaign._id || response.campaign.id };
          }

          const existingIndex = campaigns.findIndex(c => c.id === savedCampaign.id);
          const updatedCampaigns = [...campaigns];

          if (existingIndex >= 0) {
            updatedCampaigns[existingIndex] = savedCampaign;
          } else {
            updatedCampaigns.push(savedCampaign);
          }

          set({
            campaigns: updatedCampaigns,
            draftCampaign: null,
            currentStep: 0,
            isLoading: false,
          });

          console.log(`🚀 Launched campaign: ${savedCampaign.name}`);
        } catch (error: any) {
          console.error('❌ Failed to launch campaign:', error.message);
          set({ isLoading: false });
        }
      },

      pauseCampaign: async (campaignId: string) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/pause`);

          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(c =>
            c.id === campaignId ? { ...c, status: 'paused' as CampaignStatus, updatedAt: Date.now() } : c
          );
          set({ campaigns: updatedCampaigns });
          console.log(`⏸️ Paused campaign: ${campaignId}`);
        } catch (error: any) {
          console.error('❌ Failed to pause campaign:', error.message);
        }
      },

      resumeCampaign: async (campaignId: string) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/resume`);

          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(c =>
            c.id === campaignId ? { ...c, status: 'active' as CampaignStatus, updatedAt: Date.now() } : c
          );
          set({ campaigns: updatedCampaigns });
          console.log(`▶️ Resumed campaign: ${campaignId}`);
        } catch (error: any) {
          console.error('❌ Failed to resume campaign:', error.message);
        }
      },

      archiveCampaign: async (campaignId: string) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/archive`);

          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(c =>
            c.id === campaignId ? { ...c, status: 'archived' as CampaignStatus, updatedAt: Date.now() } : c
          );
          set({ campaigns: updatedCampaigns });
          console.log(`📦 Archived campaign: ${campaignId}`);
        } catch (error: any) {
          console.error('❌ Failed to archive campaign:', error.message);
        }
      },

      updateCampaignPerformance: (campaignId: string, metrics: Partial<Campaign['performance']>) => {
        const { campaigns } = get();
        const updatedCampaigns = campaigns.map(c => {
          if (c.id === campaignId) {
            return {
              ...c,
              performance: { ...c.performance, ...metrics },
              updatedAt: Date.now(),
            };
          }
          return c;
        });
        set({ campaigns: updatedCampaigns });
      },

      getAIOptimizations: (campaignId: string) => {
        // Placeholder for AI logic
        return [];
      },

      applyOptimization: (optimization: AIOptimization) => {
        const { campaigns } = get();
        const updatedCampaigns = campaigns.map(c => {
          if (c.id === optimization.campaignId && optimization.action) {
            const updates: Partial<Campaign> = { updatedAt: Date.now() };

            if (optimization.type === 'budget') {
              updates.budget = { ...c.budget, ...optimization.action.params };
            } else if (optimization.type === 'targeting') {
              updates.targeting = { ...c.targeting, ...optimization.action.params };
            } else if (optimization.type === 'offer') {
              updates.offer = { ...c.offer, ...optimization.action.params };
            }

            return { ...c, ...updates };
          }
          return c;
        });

        set({ campaigns: updatedCampaigns });
        console.log(`🤖 Applied AI optimization: ${optimization.title}`);
      },

      duplicateCampaign: (campaignId: string) => {
        const { campaigns } = get();
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        const duplicated: Campaign = {
          ...campaign,
          id: `camp_${Date.now()}`,
          name: `${campaign.name} (Copy)`,
          status: 'draft',
          budget: {
            ...campaign.budget,
            spent: 0,
          },
          performance: {
            impressions: 0,
            conversions: 0,
            revenue: 0,
            roi: 0,
            costPerAcquisition: 0,
            clickThroughRate: 0,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({
          campaigns: [...campaigns, duplicated],
          draftCampaign: duplicated,
          currentStep: 0,
        });

        console.log(`📋 Duplicated campaign: ${campaign.name}`);
      },
      createTemplate: (template: Omit<CampaignTemplate, 'id'>) => {
        const newTemplate: CampaignTemplate = {
          ...template,
          id: `tmpl_${Date.now()}`,
        };

        const { templates } = get();
        set({ templates: [...templates, newTemplate] });
        console.log(`💾 Created custom template: ${newTemplate.name}`);
      },
    }),
    {
      name: 'uma-campaign-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCampaignTypeLabel = (type: CampaignType): string => {
  const labels: Record<CampaignType, string> = {
    stamp_card: 'Stamp Card',
    discount: 'Discount',
    ride_reimbursement: 'Ride Reimbursement',
    mission: 'Mission',
    combo: 'Combo Offer',
    flash_deal: 'Flash Deal',
  };
  return labels[type];
};

export const getCampaignStatusColor = (status: CampaignStatus): string => {
  const colors: Record<CampaignStatus, string> = {
    draft: '#95A5A6',
    active: '#2ECC71',
    paused: '#F39C12',
    completed: '#3498DB',
    archived: '#7F8C8D',
  };
  return colors[status];
};

export const getCategoryColor = (category: CampaignCategory): string => {
  const colors: Record<CampaignCategory, string> = {
    acquisition: '#3498DB',
    retention: '#2ECC71',
    reactivation: '#F39C12',
    loyalty: '#9B59B6',
  };
  return colors[category];
};

export const formatBudget = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const calculateBudgetPercentage = (spent: number, total: number): number => {
  return Math.min((spent / total) * 100, 100);
};
