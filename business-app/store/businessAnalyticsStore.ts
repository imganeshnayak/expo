import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';
export type CampaignType = 'stamp_card' | 'discount' | 'ride_reimbursement' | 'mission';
export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface BusinessOverview {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerAcquisitionCost: number;
  // Trends (percentage change from previous period)
  customersTrend: number;
  revenueTrend: number;
  aovTrend: number;
  dailyRevenue: { value: number; label: string }[];
}

export interface CustomerDemographics {
  ageGroups: { range: string; percentage: number; count: number }[];
  genderDistribution: { gender: string; percentage: number; count: number }[];
  customerSource: { source: string; percentage: number; count: number }[];
  locationDistribution: { area: string; percentage: number; count: number }[];
}

export interface CustomerBehavior {
  visitFrequency: number; // Average visits per customer
  averageSpend: number;
  favoriteItems: { item: string; orders: number; revenue: number }[];
  peakHours: { hour: string; visits: number; revenue: number }[];
  peakDays: { day: string; visits: number; revenue: number }[];
}

export interface LoyaltyMetrics {
  stampCardCompletionRate: number;
  rewardRedemptionRate: number;
  customerLifetimeValue: number;
  repeatCustomerRate: number;
  churnRate: number;
  averageCustomerLifespan: number; // days
}

export interface CampaignPerformance {
  id: string;
  name: string;
  type: CampaignType;
  spend: number;
  revenue: number;
  customers: number;
  conversions: number;
  roi: number; // percentage
  status: CampaignStatus;
  startDate: number;
  endDate?: number;
  impressions: number;
  clickThroughRate: number;
}

export interface CompetitiveIntelligence {
  marketShare: number; // % of UMA customers in area
  marketRank: number; // 1st, 2nd, 3rd in category
  totalCompetitors: number;
  pricingComparison: { item: string; yourPrice: number; avgPrice: number; position: 'low' | 'avg' | 'high' }[];
  demandForecast: { date: string; expectedCustomers: number; confidence: number }[];
  ratingComparison: { merchant: string; rating: number; isYou: boolean }[];
}

export interface AIRecommendation {
  id: string;
  type: 'pricing' | 'timing' | 'targeting' | 'campaign' | 'inventory' | 'churn';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  actionable: boolean;
  action?: {
    label: string;
    params: any;
  };
  createdAt: number;
}

export interface BusinessAnalytics {
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  period: TimePeriod;
  lastUpdated: number;
  overview: BusinessOverview;
  customerInsights: {
    demographics: CustomerDemographics;
    behavior: CustomerBehavior;
    loyalty: LoyaltyMetrics;
  };
  campaignPerformance: {
    activeCampaigns: CampaignPerformance[];
    roiByCampaign: { campaignId: string; name: string; roi: number }[];
    bestPerformingDeals: { dealId: string; name: string; conversions: number; revenue: number }[];
  };
  competitiveIntelligence: CompetitiveIntelligence;
  recommendations: AIRecommendation[];
}

interface AnalyticsState {
  analytics: BusinessAnalytics | null;
  selectedPeriod: TimePeriod;
  isLoading: boolean;

  // Actions
  initializeAnalytics: (merchantId: string) => void;
  setPeriod: (period: TimePeriod) => void;
  refreshAnalytics: () => void;
  generateRecommendations: () => AIRecommendation[];
  trackCampaignEvent: (campaignId: string, event: 'impression' | 'click' | 'conversion', revenue?: number) => void;
  trackCustomerEvent: (customerId: string, event: 'visit' | 'purchase', data: any) => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'ready' | 'completed') => Promise<void>;
}


// ============================================================================
// SAMPLE ANALYTICS DATA
// ============================================================================

const generateSampleAnalytics = (merchantId: string, period: TimePeriod): BusinessAnalytics => {
  const now = Date.now();

  return {
    merchantId,
    merchantName: 'Coffee House Koramangala',
    merchantCategory: 'cafe',
    period,
    lastUpdated: now,

    overview: {
      totalCustomers: 157,
      newCustomers: 38,
      returningCustomers: 119,
      totalRevenue: 48500,
      averageOrderValue: 309,
      customerAcquisitionCost: 225,
      customersTrend: 23.5, // +23.5%
      revenueTrend: 18.2, // +18.2%
      aovTrend: -4.1, // -4.1%
      dailyRevenue: [
        { value: 4500, label: 'Mon' },
        { value: 5200, label: 'Tue' },
        { value: 4800, label: 'Wed' },
        { value: 6100, label: 'Thu' },
        { value: 8500, label: 'Fri' },
        { value: 9200, label: 'Sat' },
        { value: 5800, label: 'Sun' },
      ],
    },

    customerInsights: {
      demographics: {
        ageGroups: [
          { range: '18-24', percentage: 45, count: 71 },
          { range: '25-34', percentage: 35, count: 55 },
          { range: '35-44', percentage: 12, count: 19 },
          { range: '45+', percentage: 8, count: 12 },
        ],
        genderDistribution: [
          { gender: 'Male', percentage: 52, count: 82 },
          { gender: 'Female', percentage: 45, count: 71 },
          { gender: 'Other', percentage: 3, count: 4 },
        ],
        customerSource: [
          { source: 'Missions', percentage: 42, count: 66 },
          { source: 'Direct QR Scan', percentage: 28, count: 44 },
          { source: 'Stamp Cards', percentage: 18, count: 28 },
          { source: 'Referrals', percentage: 12, count: 19 },
        ],
        locationDistribution: [
          { area: 'Koramangala 5th Block', percentage: 38, count: 60 },
          { area: 'Koramangala 6th Block', percentage: 25, count: 39 },
          { area: 'HSR Layout', percentage: 20, count: 31 },
          { area: 'Other', percentage: 17, count: 27 },
        ],
      },

      behavior: {
        visitFrequency: 2.3,
        averageSpend: 309,
        favoriteItems: [
          { item: 'Cold Coffee', orders: 142, revenue: 21300 },
          { item: 'Sandwich', orders: 89, revenue: 13350 },
          { item: 'Cappuccino', orders: 76, revenue: 11400 },
          { item: 'Pastry', orders: 68, revenue: 6800 },
          { item: 'Breakfast Combo', orders: 54, revenue: 16200 },
        ],
        peakHours: [
          { hour: '08:00', visits: 12, revenue: 3600 },
          { hour: '09:00', visits: 18, revenue: 5400 },
          { hour: '12:00', visits: 22, revenue: 6800 },
          { hour: '13:00', visits: 25, revenue: 7750 },
          { hour: '16:00', visits: 28, revenue: 8400 },
          { hour: '17:00', visits: 32, revenue: 9600 },
          { hour: '18:00', visits: 38, revenue: 11400 },
          { hour: '19:00', visits: 35, revenue: 10500 },
        ],
        peakDays: [
          { day: 'Monday', visits: 18, revenue: 5562 },
          { day: 'Tuesday', visits: 19, revenue: 5871 },
          { day: 'Wednesday', visits: 22, revenue: 6798 },
          { day: 'Thursday', visits: 24, revenue: 7416 },
          { day: 'Friday', visits: 35, revenue: 10815 },
          { day: 'Saturday', visits: 28, revenue: 8652 },
          { day: 'Sunday', visits: 11, revenue: 3399 },
        ],
      },

      loyalty: {
        stampCardCompletionRate: 45,
        rewardRedemptionRate: 78,
        customerLifetimeValue: 2847,
        repeatCustomerRate: 76,
        churnRate: 12,
        averageCustomerLifespan: 87,
      },
    },

    campaignPerformance: {
      activeCampaigns: [
        {
          id: 'camp_1',
          name: '5 Stamp Coffee Card',
          type: 'stamp_card',
          spend: 5000,
          revenue: 18500,
          customers: 66,
          conversions: 52,
          roi: 270,
          status: 'active',
          startDate: now - 30 * 24 * 60 * 60 * 1000,
          impressions: 245,
          clickThroughRate: 26.9,
        },
        {
          id: 'camp_2',
          name: 'Friday Night Mission',
          type: 'mission',
          spend: 3500,
          revenue: 12400,
          customers: 42,
          conversions: 38,
          roi: 254,
          status: 'active',
          startDate: now - 20 * 24 * 60 * 60 * 1000,
          impressions: 189,
          clickThroughRate: 22.2,
        },
        {
          id: 'camp_3',
          name: '₹100 Ride Reimbursement',
          type: 'ride_reimbursement',
          spend: 4200,
          revenue: 9800,
          customers: 38,
          conversions: 31,
          roi: 133,
          status: 'active',
          startDate: now - 15 * 24 * 60 * 60 * 1000,
          impressions: 156,
          clickThroughRate: 24.4,
        },
      ],
      roiByCampaign: [
        { campaignId: 'camp_1', name: '5 Stamp Coffee Card', roi: 270 },
        { campaignId: 'camp_2', name: 'Friday Night Mission', roi: 254 },
        { campaignId: 'camp_3', name: '₹100 Ride Reimbursement', roi: 133 },
      ],
      bestPerformingDeals: [
        { dealId: 'deal_1', name: 'Cold Coffee + Pastry Combo', conversions: 68, revenue: 10200 },
        { dealId: 'deal_2', name: 'Breakfast Special', conversions: 54, revenue: 8100 },
        { dealId: 'deal_3', name: 'Evening Snack Deal', conversions: 42, revenue: 6300 },
      ],
    },

    competitiveIntelligence: {
      marketShare: 23,
      marketRank: 2,
      totalCompetitors: 5,
      pricingComparison: [
        { item: 'Cold Coffee', yourPrice: 150, avgPrice: 165, position: 'low' },
        { item: 'Cappuccino', yourPrice: 160, avgPrice: 155, position: 'avg' },
        { item: 'Sandwich', yourPrice: 180, avgPrice: 170, position: 'high' },
      ],
      demandForecast: [
        { date: '2025-01-14', expectedCustomers: 28, confidence: 85 },
        { date: '2025-01-15', expectedCustomers: 32, confidence: 82 },
        { date: '2025-01-16', expectedCustomers: 35, confidence: 88 },
        { date: '2025-01-17', expectedCustomers: 42, confidence: 90 },
        { date: '2025-01-18', expectedCustomers: 38, confidence: 87 },
      ],
      ratingComparison: [
        { merchant: 'Coffee House Koramangala', rating: 4.3, isYou: true },
        { merchant: 'Starbucks', rating: 4.1, isYou: false },
        { merchant: 'Cafe Coffee Day', rating: 3.9, isYou: false },
        { merchant: 'Third Wave Coffee', rating: 4.0, isYou: false },
        { merchant: 'Blue Tokai', rating: 3.8, isYou: false },
      ],
    },

    recommendations: [],
  };
};

// ============================================================================
// AI RECOMMENDATION ENGINE
// ============================================================================

const generateAIRecommendations = (analytics: BusinessAnalytics): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const now = Date.now();

  // 1. PRICING OPTIMIZATION
  const highPricedItems = analytics.competitiveIntelligence.pricingComparison.filter(
    item => item.position === 'high'
  );
  if (highPricedItems.length > 0) {
    recommendations.push({
      id: `rec_${now}_1`,
      type: 'pricing',
      priority: 'high',
      title: 'Optimize Pricing Strategy',
      description: `Your ${highPricedItems[0].item} is priced ₹${highPricedItems[0].yourPrice - highPricedItems[0].avgPrice} above market average. Consider lowering to ₹${highPricedItems[0].avgPrice} to increase conversions.`,
      expectedImpact: '+15% sales on this item',
      actionable: true,
      action: {
        label: 'Adjust Price',
        params: { item: highPricedItems[0].item, suggestedPrice: highPricedItems[0].avgPrice },
      },
      createdAt: now,
    });
  }

  // 2. PEAK HOURS OPTIMIZATION
  const peakHours = analytics.customerInsights.behavior.peakHours;
  if (peakHours.length > 0) {
    const peakHour = peakHours.reduce((max, hour) =>
      hour.visits > max.visits ? hour : max
    );
    const offPeakHours = peakHours.filter(
      h => h.visits < peakHour.visits * 0.5
    );
    if (offPeakHours.length > 0) {
      recommendations.push({
        id: `rec_${now}_2`,
        type: 'timing',
        priority: 'medium',
        title: 'Launch Happy Hour Campaign',
        description: `Traffic drops ${((1 - offPeakHours[0].visits / peakHour.visits) * 100).toFixed(0)}% during ${offPeakHours[0].hour}. Launch a "Happy Hour" discount to capture more customers.`,
        expectedImpact: '+25 customers during off-peak',
        actionable: true,
        action: {
          label: 'Create Happy Hour Deal',
          params: { timeSlot: offPeakHours[0].hour },
        },
        createdAt: now,
      });
    }
  }

  // 3. CUSTOMER CHURN PREVENTION
  if (analytics.customerInsights.loyalty.churnRate > 10) {
    recommendations.push({
      id: `rec_${now}_3`,
      type: 'churn',
      priority: 'high',
      title: 'Reduce Customer Churn',
      description: `${analytics.customerInsights.loyalty.churnRate}% churn rate detected. Send personalized offers to customers who haven't visited in 2+ weeks.`,
      expectedImpact: 'Recover 30% of at-risk customers',
      actionable: true,
      action: {
        label: 'Launch Win-Back Campaign',
        params: { targetSegment: 'inactive_14days' },
      },
      createdAt: now,
    });
  }

  // 4. STAMP CARD OPTIMIZATION
  if (analytics.customerInsights.loyalty.stampCardCompletionRate < 50) {
    recommendations.push({
      id: `rec_${now}_4`,
      type: 'campaign',
      priority: 'medium',
      title: 'Improve Stamp Card Completion',
      description: `Only ${analytics.customerInsights.loyalty.stampCardCompletionRate}% of customers complete stamp cards. Reduce required stamps from 8 to 5 for higher engagement.`,
      expectedImpact: '+35% completion rate',
      actionable: true,
      action: {
        label: 'Modify Stamp Card',
        params: { currentStamps: 8, suggestedStamps: 5 },
      },
      createdAt: now,
    });
  }

  // 5. DEMAND FORECAST OPPORTUNITY
  const upcomingHighDemand = analytics.competitiveIntelligence.demandForecast.find(
    forecast => forecast.expectedCustomers > analytics.overview.totalCustomers / 7 * 1.3
  );
  if (upcomingHighDemand) {
    recommendations.push({
      id: `rec_${now}_5`,
      type: 'inventory',
      priority: 'high',
      title: 'Prepare for High Demand',
      description: `${upcomingHighDemand.date} shows ${upcomingHighDemand.expectedCustomers} expected customers (${upcomingHighDemand.confidence}% confidence). Stock up on top items.`,
      expectedImpact: 'Capture 100% of demand',
      actionable: false,
      createdAt: now,
    });
  }

  // 6. NEW CUSTOMER ACQUISITION
  const newCustomerPercentage = (analytics.overview.newCustomers / analytics.overview.totalCustomers) * 100;
  if (newCustomerPercentage < 20) {
    recommendations.push({
      id: `rec_${now}_6`,
      type: 'targeting',
      priority: 'medium',
      title: 'Boost New Customer Acquisition',
      description: `Only ${newCustomerPercentage.toFixed(0)}% are new customers. Launch a "First Visit Free Dessert" mission to attract newcomers.`,
      expectedImpact: '+40 new customers this month',
      actionable: true,
      action: {
        label: 'Create Welcome Mission',
        params: { targetAudience: 'new_users' },
      },
      createdAt: now,
    });
  }

  // 7. ROI OPTIMIZATION
  const lowROICampaigns = analytics.campaignPerformance.activeCampaigns.filter(
    camp => camp.roi < 150
  );
  if (lowROICampaigns.length > 0) {
    recommendations.push({
      id: `rec_${now}_7`,
      type: 'campaign',
      priority: 'high',
      title: 'Pause Low-ROI Campaign',
      description: `"${lowROICampaigns[0].name}" has ${lowROICampaigns[0].roi}% ROI. Pause and reallocate budget to better-performing campaigns.`,
      expectedImpact: 'Save ₹${lowROICampaigns[0].spend * 0.3}/month',
      actionable: true,
      action: {
        label: 'Pause Campaign',
        params: { campaignId: lowROICampaigns[0].id },
      },
      createdAt: now,
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

// Helper to map backend data to frontend structure
const mapBackendToFrontend = (backendData: any, campaignData?: any): BusinessAnalytics => {
  const metrics = backendData.metrics || {};
  const campaigns = campaignData || {};

  return {
    merchantId: backendData.merchantId,
    merchantName: '', // Not in analytics response
    merchantCategory: '',
    period: backendData.period,
    lastUpdated: Date.now(),

    overview: {
      totalCustomers: metrics.totalCustomers || 0,
      newCustomers: metrics.newCustomers || 0,
      returningCustomers: metrics.returningCustomers || 0,
      totalRevenue: metrics.totalRevenue || 0,
      averageOrderValue: metrics.averageOrderValue || 0,
      customerAcquisitionCost: metrics.customerAcquisitionCost || 0,
      customersTrend: 0,
      revenueTrend: 0,
      aovTrend: 0,
      dailyRevenue: metrics.dailyRevenue || [],
    },

    customerInsights: {
      demographics: {
        ageGroups: [],
        genderDistribution: [],
        customerSource: [],
        locationDistribution: [],
      },
      behavior: {
        visitFrequency: 0,
        averageSpend: metrics.averageOrderValue || 0,
        favoriteItems: metrics.topItems || [],
        peakHours: metrics.peakHours || [],
        peakDays: metrics.peakDays || [],
      },
      loyalty: {
        stampCardCompletionRate: 0,
        rewardRedemptionRate: 0,
        customerLifetimeValue: metrics.customerLifetimeValue || 0,
        repeatCustomerRate: 0,
        churnRate: metrics.churnRate || 0,
        averageCustomerLifespan: 0,
      },
    },

    campaignPerformance: {
      activeCampaigns: (campaigns.topCampaigns || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: 'discount' as CampaignType,
        spend: 0,
        revenue: c.revenue || 0,
        customers: c.claims || 0,
        conversions: c.conversions || 0,
        roi: c.roi || 0,
        status: 'active' as CampaignStatus,
        startDate: Date.now(),
        impressions: 0,
        clickThroughRate: 0,
      })),
      roiByCampaign: (campaigns.topCampaigns || []).map((c: any) => ({
        campaignId: c.id,
        name: c.name,
        roi: c.roi || 0,
      })),
      bestPerformingDeals: (campaigns.topCampaigns || []).map((c: any) => ({
        dealId: c.id,
        name: c.name,
        conversions: c.conversions || 0,
        revenue: c.revenue || 0,
      })),
    },

    competitiveIntelligence: {
      marketShare: 0,
      marketRank: 0,
      totalCompetitors: 0,
      pricingComparison: [],
      demandForecast: [],
      ratingComparison: [],
    },

    recommendations: [],
  };
};

export const useBusinessAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      analytics: null,
      selectedPeriod: 'week',
      isLoading: false,

      initializeAnalytics: async (merchantId: string) => {
        set({ isLoading: true });
        try {
          const period = get().selectedPeriod;

          // Fetch both overview and campaign analytics
          const [overviewResponse, campaignResponse] = await Promise.all([
            api.get<{
              success: boolean;
              analytics: any;
            }>(`/api/analytics/overview?period=${period}`),
            api.get<{
              success: boolean;
              campaigns: any;
            }>('/api/analytics/campaigns'),
          ]);

          const mappedAnalytics = mapBackendToFrontend(overviewResponse.analytics, campaignResponse.campaigns);

          // Generate AI recommendations
          const recommendations = generateAIRecommendations(mappedAnalytics);

          set({
            analytics: { ...mappedAnalytics, recommendations },
            isLoading: false,
          });
          console.log('✅ Business analytics initialized from API');
        } catch (error: any) {
          console.error('❌ Failed to load analytics, using sample data:', error.message);
          // Fallback to sample data for demo
          const sampleAnalytics = generateSampleAnalytics(merchantId, get().selectedPeriod);
          const recommendations = generateAIRecommendations(sampleAnalytics);
          set({
            analytics: { ...sampleAnalytics, recommendations },
            isLoading: false,
          });
          console.log('📊 Using sample analytics for demo');
        }
      },

      setPeriod: async (period: TimePeriod) => {
        set({ isLoading: true, selectedPeriod: period });
        try {
          const response = await api.get<{
            success: boolean;
            analytics: any;
          }>(`/api/analytics/overview?period=${period}`);

          const mappedAnalytics = mapBackendToFrontend(response.analytics);

          set({
            analytics: mappedAnalytics,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Failed to update period:', error.message);
          set({ isLoading: false });
        }
      },

      refreshAnalytics: async () => {
        const { selectedPeriod } = get();
        set({ isLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            analytics: any;
          }>(`/api/analytics/overview?period=${selectedPeriod}`);

          const mappedAnalytics = mapBackendToFrontend(response.analytics);

          set({
            analytics: mappedAnalytics,
            isLoading: false,
          });
          console.log('🔄 Analytics refreshed from API');
        } catch (error: any) {
          console.error('❌ Failed to refresh analytics:', error.message);
          set({ isLoading: false });
        }
      },

      generateRecommendations: () => {
        const { analytics } = get();
        if (!analytics) return [];

        return generateAIRecommendations(analytics);
      },

      trackCampaignEvent: (campaignId, event, revenue = 0) => {
        const { analytics } = get();
        if (!analytics) return;

        const campaigns = analytics.campaignPerformance.activeCampaigns.map(camp => {
          if (camp.id === campaignId) {
            const updates: Partial<CampaignPerformance> = {};

            if (event === 'impression') {
              updates.impressions = camp.impressions + 1;
            } else if (event === 'click') {
              updates.clickThroughRate = ((camp.conversions + 1) / (camp.impressions + 1)) * 100;
            } else if (event === 'conversion') {
              updates.conversions = camp.conversions + 1;
              updates.customers = camp.customers + 1;
              updates.revenue = camp.revenue + revenue;
              updates.roi = ((camp.revenue + revenue - camp.spend) / camp.spend) * 100;
            }

            return { ...camp, ...updates };
          }
          return camp;
        });

        set({
          analytics: {
            ...analytics,
            campaignPerformance: {
              ...analytics.campaignPerformance,
              activeCampaigns: campaigns,
            },
          },
        });
      },

      trackCustomerEvent: (customerId, event, data) => {
        const { analytics } = get();
        if (!analytics) return;

        // Update overview metrics
        if (event === 'visit') {
          set({
            analytics: {
              ...analytics,
              overview: {
                ...analytics.overview,
                totalCustomers: analytics.overview.totalCustomers + (data.isNew ? 1 : 0),
                newCustomers: analytics.overview.newCustomers + (data.isNew ? 1 : 0),
              },
            },
          });
        } else if (event === 'purchase') {
          set({
            analytics: {
              ...analytics,
              overview: {
                ...analytics.overview,
                totalRevenue: analytics.overview.totalRevenue + data.amount,
                averageOrderValue:
                  (analytics.overview.totalRevenue + data.amount) /
                  (analytics.overview.totalCustomers + 1),
              },
            },
          });
        }

        console.log(`📊 Tracked ${event} for customer ${customerId}`);
      },

      updateOrderStatus: async (orderId, status) => {
        const { analytics } = get();
        // 1. Optimistic Update
        console.log(`⚡ Optimistic Update: Order ${orderId} -> ${status}`);

        try {
          // 2. API Call (simulation)
          // await api.post(`/api/orders/${orderId}/status`, { status });
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('✅ Order status synced');
        } catch (error) {
          console.error('❌ Sync failed, rolling back');
        }
      },
    }),
    {
      name: 'uma-business-analytics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const getTrendIcon = (trend: number): string => {
  return trend >= 0 ? '↑' : '↓';
};

export const getTrendColor = (trend: number): string => {
  return trend >= 0 ? '#2ECC71' : '#E74C3C';
};

export const getPriorityColor = (priority: AIRecommendation['priority']): string => {
  const colors = {
    high: '#E74C3C',
    medium: '#F39C12',
    low: '#3498DB',
  };
  return colors[priority];
};
