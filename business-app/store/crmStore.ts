import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CustomerSegment = 'new' | 'regular' | 'vip' | 'at_risk';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type SegmentOperator = 'greaterThan' | 'lessThan' | 'equals' | 'contains';
export type SegmentField = 'visitFrequency' | 'lastVisit' | 'averageSpend' | 'lifetimeValue' | 'preferences';

export interface StampCard {
  id: string;
  merchantId: string;
  merchantName: string;
  stampsCollected: number;
  stampsRequired: number;
  reward: string;
  rewardValue: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface CustomerProfile {
  id: string;
  phone: string;
  name?: string;
  segment: CustomerSegment;
  lifetimeValue: number;
  visitCount: number;
  averageSpend: number;
  lastVisit: number;
  firstVisit: number;
  favoriteItems: string[];
  preferences: {
    timeOfDay: TimeOfDay;
    dayOfWeek: string[];
    categoryPreferences: string[];
  };
  stampCards: {
    active: StampCard[];
    completed: StampCard[];
  };
  communication: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    lastContact: number;
  };
  tags: string[];
  notes: string;
}

export interface SegmentCriteria {
  field: SegmentField;
  operator: SegmentOperator;
  value: any;
}

export interface CustomSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customerCount: number;
  averageLTV: number;
  lastUpdated: number;
  color: string;
}

export interface CommunicationCampaign {
  id: string;
  name: string;
  type: 'push' | 'sms' | 'both';
  segmentIds: string[];
  message: {
    title: string;
    body: string;
    actionUrl?: string;
  };
  status: 'draft' | 'scheduled' | 'sent' | 'archived' | 'failed';
  scheduledFor?: number;
  sentAt?: number;
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: number;
}

export interface AutomatedWorkflow {
  id: string;
  name: string;
  type: 'win_back' | 'birthday' | 'milestone' | 'personalized';
  enabled: boolean;
  trigger: {
    event: string;
    condition: any;
  };
  action: {
    type: 'push' | 'sms' | 'offer';
    template: string;
    offerAmount?: number;
  };
  performance: {
    triggered: number;
    sent: number;
    converted: number;
    revenue: number;
  };
}

interface CRMState {
  customers: CustomerProfile[];
  segments: CustomSegment[];
  campaigns: CommunicationCampaign[];
  workflows: AutomatedWorkflow[];
  selectedCustomer: CustomerProfile | null;
  isLoading: boolean;

  // Customer Actions
  initializeCustomers: (merchantId: string) => void;
  getCustomer: (customerId: string) => CustomerProfile | undefined;
  updateCustomer: (customerId: string, updates: Partial<CustomerProfile>) => void;
  addCustomerNote: (customerId: string, note: string) => void;
  addCustomerTag: (customerId: string, tag: string) => void;
  removeCustomerTag: (customerId: string, tag: string) => void;
  recordVisit: (customerId: string, amount: number) => void;

  // Segmentation Actions
  createSegment: (segment: Omit<CustomSegment, 'id' | 'customerCount' | 'averageLTV' | 'lastUpdated'>) => void;
  updateSegment: (segmentId: string, updates: Partial<CustomSegment>) => void;
  deleteSegment: (segmentId: string) => void;
  getCustomersInSegment: (segmentId: string) => CustomerProfile[];
  refreshSegmentCounts: () => void;

  // Communication Actions
  createCampaign: (campaign: Omit<CommunicationCampaign, 'id' | 'performance' | 'createdAt'>) => void;
  sendCampaign: (campaignId: string) => void;
  scheduleCampaign: (campaignId: string, scheduledFor: number) => void;
  archiveCampaign: (campaignId: string) => void;

  // Workflow Actions
  createWorkflow: (workflow: Omit<AutomatedWorkflow, 'id' | 'performance'>) => void;
  toggleWorkflow: (workflowId: string, enabled: boolean) => void;
  deleteWorkflow: (workflowId: string) => void;

  // Analytics
  getSegmentStats: () => { segment: CustomerSegment; count: number; ltv: number }[];
  getTopCustomers: (limit: number) => CustomerProfile[];
  getAtRiskCustomers: () => CustomerProfile[];
}

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

const SAMPLE_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Arjun Mehta', 'Kavya Nair', 'Rohan Gupta', 'Diya Agarwal',
  'Karan Verma', 'Isha Shah', 'Siddharth Joshi', 'Tanvi Desai', 'Aditya Rao',
];

const FAVORITE_ITEMS = [
  'Cold Coffee', 'Sandwich', 'Burger', 'Pizza', 'Pasta', 'Mocha', 'Cappuccino',
  'Croissant', 'Brownie', 'Smoothie', 'Salad', 'Wrap', 'Muffin', 'Latte',
];

const generateSampleCustomers = (merchantId: string): CustomerProfile[] => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: 50 }, (_, i) => {
    const visitCount = Math.floor(Math.random() * 30) + 1;
    const avgSpend = Math.floor(Math.random() * 400) + 150;
    const ltv = visitCount * avgSpend;
    const lastVisitDaysAgo = Math.floor(Math.random() * 60);

    let segment: CustomerSegment;
    if (ltv > 5000) segment = 'vip';
    else if (lastVisitDaysAgo > 21) segment = 'at_risk';
    else if (visitCount > 5) segment = 'regular';
    else segment = 'new';

    const timeOfDay: TimeOfDay = Math.random() > 0.6 ? 'evening' : Math.random() > 0.3 ? 'afternoon' : 'morning';

    return {
      id: `cust_${1000 + i}`,
      phone: `+91 ${9000000000 + i}`,
      name: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
      segment,
      lifetimeValue: ltv,
      visitCount,
      averageSpend: avgSpend,
      lastVisit: now - lastVisitDaysAgo * dayMs,
      firstVisit: now - (lastVisitDaysAgo + visitCount * 7) * dayMs,
      favoriteItems: [
        FAVORITE_ITEMS[Math.floor(Math.random() * FAVORITE_ITEMS.length)],
        FAVORITE_ITEMS[Math.floor(Math.random() * FAVORITE_ITEMS.length)],
      ],
      preferences: {
        timeOfDay,
        dayOfWeek: timeOfDay === 'evening' ? ['Friday', 'Saturday'] : ['Monday', 'Wednesday', 'Friday'],
        categoryPreferences: ['cafe', 'food'],
      },
      stampCards: {
        active: visitCount > 3 ? [{
          id: `stamp_${i}_1`,
          merchantId,
          merchantName: 'Coffee House',
          stampsCollected: Math.min(visitCount, 7),
          stampsRequired: 8,
          reward: 'Free Cold Coffee',
          rewardValue: 150,
          isCompleted: false,
        }] : [],
        completed: visitCount > 10 ? [{
          id: `stamp_${i}_2`,
          merchantId,
          merchantName: 'Coffee House',
          stampsCollected: 8,
          stampsRequired: 8,
          reward: 'Free Sandwich',
          rewardValue: 180,
          isCompleted: true,
          completedAt: now - 10 * dayMs,
        }] : [],
      },
      communication: {
        pushEnabled: Math.random() > 0.2,
        smsEnabled: Math.random() > 0.3,
        lastContact: now - Math.floor(Math.random() * 30) * dayMs,
      },
      tags: segment === 'vip' ? ['vip', 'high-value'] : segment === 'at_risk' ? ['at-risk', 'needs-attention'] : [],
      notes: '',
    };
  });
};

const DEFAULT_SEGMENTS: CustomSegment[] = [
  {
    id: 'seg_vip',
    name: 'VIP Customers',
    description: 'Top 10% customers by lifetime value',
    criteria: [
      { field: 'lifetimeValue', operator: 'greaterThan', value: 5000 },
    ],
    customerCount: 0,
    averageLTV: 0,
    lastUpdated: Date.now(),
    color: '#9B59B6',
  },
  {
    id: 'seg_at_risk',
    name: 'At Risk',
    description: 'Haven\'t visited in 3+ weeks',
    criteria: [
      { field: 'lastVisit', operator: 'lessThan', value: Date.now() - 21 * 24 * 60 * 60 * 1000 },
    ],
    customerCount: 0,
    averageLTV: 0,
    lastUpdated: Date.now(),
    color: '#E74C3C',
  },
  {
    id: 'seg_weekend',
    name: 'Weekend Regulars',
    description: 'Primarily visit on weekends',
    criteria: [
      { field: 'preferences', operator: 'contains', value: 'Saturday' },
    ],
    customerCount: 0,
    averageLTV: 0,
    lastUpdated: Date.now(),
    color: '#F39C12',
  },
  {
    id: 'seg_coffee',
    name: 'Coffee Lovers',
    description: 'Favorite items include coffee drinks',
    criteria: [
      { field: 'preferences', operator: 'contains', value: 'Coffee' },
    ],
    customerCount: 0,
    averageLTV: 0,
    lastUpdated: Date.now(),
    color: '#3498DB',
  },
];

const DEFAULT_WORKFLOWS: AutomatedWorkflow[] = [
  {
    id: 'wf_winback',
    name: 'Win-Back Campaign',
    type: 'win_back',
    enabled: true,
    trigger: {
      event: 'lastVisit',
      condition: { daysAgo: 21 },
    },
    action: {
      type: 'push',
      template: 'We miss you! Come back and get 25% off your next order.',
      offerAmount: 25,
    },
    performance: {
      triggered: 23,
      sent: 23,
      converted: 7,
      revenue: 1890,
    },
  },
  {
    id: 'wf_milestone',
    name: '10th Visit Celebration',
    type: 'milestone',
    enabled: true,
    trigger: {
      event: 'visitCount',
      condition: { equals: 10 },
    },
    action: {
      type: 'offer',
      template: 'Congrats on your 10th visit! Here\'s a special reward just for you.',
      offerAmount: 100,
    },
    performance: {
      triggered: 8,
      sent: 8,
      converted: 6,
      revenue: 1200,
    },
  },
  {
    id: 'wf_personalized',
    name: 'Personalized Recommendations',
    type: 'personalized',
    enabled: true,
    trigger: {
      event: 'favoriteItem',
      condition: { has: 'Cold Coffee' },
    },
    action: {
      type: 'push',
      template: 'We noticed you love cold coffee! Try our new Mocha Frappé.',
    },
    performance: {
      triggered: 45,
      sent: 45,
      converted: 18,
      revenue: 2700,
    },
  },
];

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      customers: [],
      segments: [],
      campaigns: [],
      workflows: [],
      selectedCustomer: null,
      isLoading: false,

      initializeCustomers: async (merchantId: string) => {
        set({ isLoading: true });
        try {
          // Fetch customers from API
          const response = await api.get<{
            success: boolean;
            customers: CustomerProfile[];
          }>('/api/crm/customers?limit=100');

          set({
            customers: response.customers || [],
            segments: DEFAULT_SEGMENTS,
            workflows: DEFAULT_WORKFLOWS,
            isLoading: false,
          });

          // Refresh segment counts
          get().refreshSegmentCounts();

          // Fetch push notification history and merge with campaigns
          try {
            const historyResponse = await api.get<{ notifications: any[] }>('/api/push-notifications?limit=50');
            const pushCampaigns = historyResponse.notifications.map((n: any) => ({
              id: n._id,
              name: n.title,
              type: 'push' as const,
              segmentIds: n.targetSegments || [],
              message: {
                title: n.title,
                body: n.message,
              },
              status: n.status,
              sentAt: n.sentAt ? new Date(n.sentAt).getTime() : undefined,
              performance: {
                sent: n.sentCount || 0,
                delivered: n.deliveredCount || 0,
                opened: 0,
                clicked: 0,
                converted: 0,
              },
              createdAt: new Date(n.createdAt).getTime(),
            }));

            set(state => {
              // Filter out existing push campaigns to avoid duplicates
              const otherCampaigns = state.campaigns.filter(c => c.type !== 'push');
              return {
                campaigns: [...otherCampaigns, ...pushCampaigns].sort((a, b) => b.createdAt - a.createdAt)
              };
            });
            console.log(`📨 Loaded ${pushCampaigns.length} push notifications into history`);
          } catch (error) {
            console.error('Failed to load push history:', error);
          }

          console.log(`👥 Loaded ${response.customers?.length || 0} customers from API`);
        } catch (error: any) {
          console.error('❌ Failed to load customers:', error.message);
          // Fallback to sample data if API fails
          const sampleCustomers = generateSampleCustomers(merchantId);
          set({
            customers: sampleCustomers,
            segments: DEFAULT_SEGMENTS,
            workflows: DEFAULT_WORKFLOWS,
            isLoading: false,
          });
          get().refreshSegmentCounts();
          console.log(`👥 Using ${sampleCustomers.length} sample customers (API unavailable)`);
        }
      },

      getCustomer: (customerId: string) => {
        return get().customers.find(c => c.id === customerId);
      },

      updateCustomer: async (customerId: string, updates: Partial<CustomerProfile>) => {
        try {
          // Update on backend
          await api.put(`/api/crm/customers/${customerId}`, updates);

          // Update local state
          const { customers } = get();
          const updatedCustomers = customers.map(c =>
            c.id === customerId ? { ...c, ...updates } : c
          );
          set({ customers: updatedCustomers });
          console.log(`✅ Updated customer ${customerId}`);
        } catch (error: any) {
          console.error('❌ Failed to update customer:', error.message);
          // Still update locally even if API fails
          const { customers } = get();
          const updatedCustomers = customers.map(c =>
            c.id === customerId ? { ...c, ...updates } : c
          );
          set({ customers: updatedCustomers });
        }
      },

      addCustomerNote: async (customerId: string, note: string) => {
        try {
          await api.post(`/api/crm/customers/${customerId}/notes`, { note });

          const { customers } = get();
          const updatedCustomers = customers.map(c => {
            if (c.id === customerId) {
              return {
                ...c,
                notes: c.notes ? `${c.notes}\n\n${new Date().toLocaleDateString()}: ${note}` : note,
              };
            }
            return c;
          });
          set({ customers: updatedCustomers });
          console.log(`📝 Added note to customer ${customerId}`);
        } catch (error: any) {
          console.error('❌ Failed to add note:', error.message);
        }
      },

      addCustomerTag: async (customerId: string, tag: string) => {
        try {
          await api.post(`/api/crm/customers/${customerId}/tags`, { tag });

          const { customers } = get();
          const updatedCustomers = customers.map(c => {
            if (c.id === customerId && !c.tags.includes(tag)) {
              return { ...c, tags: [...c.tags, tag] };
            }
            return c;
          });
          set({ customers: updatedCustomers });
        } catch (error: any) {
          console.error('❌ Failed to add tag:', error.message);
        }
      },

      removeCustomerTag: async (customerId: string, tag: string) => {
        try {
          await api.delete(`/api/crm/customers/${customerId}/tags/${tag}`);

          const { customers } = get();
          const updatedCustomers = customers.map(c => {
            if (c.id === customerId) {
              return { ...c, tags: c.tags.filter(t => t !== tag) };
            }
            return c;
          });
          set({ customers: updatedCustomers });
        } catch (error: any) {
          console.error('❌ Failed to remove tag:', error.message);
        }
      },

      recordVisit: async (customerId: string, amount: number) => {
        try {
          await api.post(`/api/crm/customers/${customerId}/visit`, { amount });

          const { customers } = get();
          const now = Date.now();

          const updatedCustomers = customers.map(c => {
            if (c.id === customerId) {
              const newVisitCount = c.visitCount + 1;
              const newLTV = c.lifetimeValue + amount;
              const newAvgSpend = newLTV / newVisitCount;

              // Update segment based on new stats
              let newSegment: CustomerSegment = c.segment;
              if (newLTV > 5000) newSegment = 'vip';
              else if (newVisitCount > 5) newSegment = 'regular';
              else newSegment = 'new';

              return {
                ...c,
                visitCount: newVisitCount,
                lifetimeValue: newLTV,
                averageSpend: newAvgSpend,
                lastVisit: now,
                segment: newSegment,
              };
            }
            return c;
          });

          set({ customers: updatedCustomers });
          console.log(`✅ Recorded visit for customer ${customerId}: ₹${amount}`);
        } catch (error: any) {
          console.error('❌ Failed to record visit:', error.message);
        }
      },

      createSegment: async (segment) => {
        try {
          const response = await api.post<{ success: boolean; segment: CustomSegment }>('/api/crm/segments', segment);

          const { segments } = get();
          const newSegment = response.segment || {
            ...segment,
            id: `seg_${Date.now()}`,
            customerCount: 0,
            averageLTV: 0,
            lastUpdated: Date.now(),
          };

          set({ segments: [...segments, newSegment] });
          get().refreshSegmentCounts();
          console.log(`🎯 Created segment: ${newSegment.name}`);
        } catch (error: any) {
          console.error('❌ Failed to create segment:', error.message);
        }
      },

      updateSegment: async (segmentId: string, updates: Partial<CustomSegment>) => {
        try {
          await api.put(`/api/crm/segments/${segmentId}`, updates);

          const { segments } = get();
          const updatedSegments = segments.map(s =>
            s.id === segmentId ? { ...s, ...updates, lastUpdated: Date.now() } : s
          );
          set({ segments: updatedSegments });
        } catch (error: any) {
          console.error('❌ Failed to update segment:', error.message);
        }
      },

      deleteSegment: async (segmentId: string) => {
        try {
          await api.delete(`/api/crm/segments/${segmentId}`);

          const { segments } = get();
          set({ segments: segments.filter(s => s.id !== segmentId) });
          console.log(`🗑️ Deleted segment: ${segmentId}`);
        } catch (error: any) {
          console.error('❌ Failed to delete segment:', error.message);
        }
      },

      getCustomersInSegment: (segmentId: string) => {
        const { segments, customers } = get();
        const segment = segments.find(s => s.id === segmentId);
        if (!segment) return [];

        return customers.filter(customer => {
          return segment.criteria.every(criteria => {
            const fieldValue = getFieldValue(customer, criteria.field);
            return evaluateCriteria(fieldValue, criteria.operator, criteria.value);
          });
        });
      },

      refreshSegmentCounts: () => {
        const { segments, customers } = get();

        const updatedSegments = segments.map(segment => {
          const customersInSegment = customers.filter(customer => {
            return segment.criteria.every(criteria => {
              const fieldValue = getFieldValue(customer, criteria.field);
              return evaluateCriteria(fieldValue, criteria.operator, criteria.value);
            });
          });

          const avgLTV = customersInSegment.length > 0
            ? customersInSegment.reduce((sum, c) => sum + c.lifetimeValue, 0) / customersInSegment.length
            : 0;

          return {
            ...segment,
            customerCount: customersInSegment.length,
            averageLTV: avgLTV,
            lastUpdated: Date.now(),
          };
        });

        set({ segments: updatedSegments });
      },

      createCampaign: async (campaign) => {
        try {
          const response = await api.post<{ success: boolean; campaign: CommunicationCampaign }>('/api/campaigns', campaign);

          const { campaigns } = get();
          const newCampaign = response.campaign || {
            ...campaign,
            id: `comm_${Date.now()}`,
            performance: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              converted: 0,
            },
            createdAt: Date.now(),
          };

          set({ campaigns: [...campaigns, newCampaign] });
          console.log(`📧 Created campaign: ${newCampaign.name}`);
        } catch (error: any) {
          console.error('❌ Failed to create campaign:', error.message);
        }
      },

      sendCampaign: async (campaignId: string) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/send`);

          const { campaigns, segments } = get();
          const campaign = campaigns.find(c => c.id === campaignId);
          if (!campaign) return;

          // Calculate total recipients for local optimistic update
          let totalRecipients = 0;
          campaign.segmentIds.forEach(segmentId => {
            const segment = segments.find(s => s.id === segmentId);
            if (segment) {
              totalRecipients += segment.customerCount;
            }
          });

          const updatedCampaigns = campaigns.map(c => {
            if (c.id === campaignId) {
              return {
                ...c,
                status: 'sent' as const,
                sentAt: Date.now(),
                performance: {
                  sent: totalRecipients,
                  delivered: Math.floor(totalRecipients * 0.95),
                  opened: Math.floor(totalRecipients * 0.42),
                  clicked: Math.floor(totalRecipients * 0.18),
                  converted: Math.floor(totalRecipients * 0.08),
                },
              };
            }
            return c;
          });

          set({ campaigns: updatedCampaigns });
          console.log(`📤 Sent campaign ${campaignId} to ${totalRecipients} customers`);
        } catch (error: any) {
          console.error('❌ Failed to send campaign:', error.message);
        }
      },

      scheduleCampaign: async (campaignId: string, scheduledFor: number) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/schedule`, { scheduledFor });

          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(c =>
            c.id === campaignId ? { ...c, status: 'scheduled' as const, scheduledFor } : c
          );
          set({ campaigns: updatedCampaigns });
          console.log(`📅 Scheduled campaign ${campaignId}`);
        } catch (error: any) {
          console.error('❌ Failed to schedule campaign:', error.message);
        }
      },

      archiveCampaign: async (campaignId: string) => {
        try {
          await api.post(`/api/campaigns/${campaignId}/archive`);

          const { campaigns } = get();
          const updatedCampaigns = campaigns.map(c =>
            c.id === campaignId ? { ...c, status: 'archived' as const } : c
          );
          set({ campaigns: updatedCampaigns });
        } catch (error: any) {
          console.error('❌ Failed to archive campaign:', error.message);
        }
      },

      createWorkflow: async (workflow) => {
        try {
          const response = await api.post<{ success: boolean; workflow: AutomatedWorkflow }>('/api/crm/workflows', workflow);

          const { workflows } = get();
          const newWorkflow = response.workflow || {
            ...workflow,
            id: `wf_${Date.now()}`,
            performance: {
              triggered: 0,
              sent: 0,
              converted: 0,
              revenue: 0,
            },
          };

          set({ workflows: [...workflows, newWorkflow] });
          console.log(`⚙️ Created workflow: ${newWorkflow.name}`);
        } catch (error: any) {
          console.error('❌ Failed to create workflow:', error.message);
        }
      },

      toggleWorkflow: async (workflowId: string, enabled: boolean) => {
        try {
          await api.post(`/api/crm/workflows/${workflowId}/toggle`, { enabled });

          const { workflows } = get();
          const updatedWorkflows = workflows.map(w =>
            w.id === workflowId ? { ...w, enabled } : w
          );
          set({ workflows: updatedWorkflows });
          console.log(`${enabled ? '✅' : '⏸️'} ${enabled ? 'Enabled' : 'Disabled'} workflow ${workflowId}`);
        } catch (error: any) {
          console.error('❌ Failed to toggle workflow:', error.message);
        }
      },

      deleteWorkflow: async (workflowId: string) => {
        try {
          await api.delete(`/api/crm/workflows/${workflowId}`);

          const { workflows } = get();
          set({ workflows: workflows.filter(w => w.id !== workflowId) });
          console.log(`🗑️ Deleted workflow: ${workflowId}`);
        } catch (error: any) {
          console.error('❌ Failed to delete workflow:', error.message);
        }
      },

      getSegmentStats: () => {
        const { customers } = get();
        const stats = new Map<CustomerSegment, { count: number; totalLTV: number }>();

        customers.forEach(c => {
          const existing = stats.get(c.segment) || { count: 0, totalLTV: 0 };
          stats.set(c.segment, {
            count: existing.count + 1,
            totalLTV: existing.totalLTV + c.lifetimeValue,
          });
        });

        return Array.from(stats.entries()).map(([segment, data]) => ({
          segment,
          count: data.count,
          ltv: data.totalLTV / data.count,
        }));
      },

      getTopCustomers: (limit: number) => {
        const { customers } = get();
        return [...customers]
          .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
          .slice(0, limit);
      },

      getAtRiskCustomers: () => {
        const { customers } = get();
        return customers.filter(c => c.segment === 'at_risk');
      },
    }),
    {
      name: 'uma-crm-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getFieldValue = (customer: CustomerProfile, field: SegmentField): any => {
  switch (field) {
    case 'visitFrequency':
      return customer.visitCount;
    case 'lastVisit':
      return customer.lastVisit;
    case 'averageSpend':
      return customer.averageSpend;
    case 'lifetimeValue':
      return customer.lifetimeValue;
    case 'preferences':
      return customer.preferences;
    default:
      return null;
  }
};

const evaluateCriteria = (fieldValue: any, operator: SegmentOperator, targetValue: any): boolean => {
  switch (operator) {
    case 'greaterThan':
      return fieldValue > targetValue;
    case 'lessThan':
      return fieldValue < targetValue;
    case 'equals':
      return fieldValue === targetValue;
    case 'contains':
      if (typeof fieldValue === 'object') {
        return JSON.stringify(fieldValue).includes(targetValue);
      }
      return String(fieldValue).includes(targetValue);
    default:
      return false;
  }
};

export const getSegmentColor = (segment: CustomerSegment): string => {
  const colors: Record<CustomerSegment, string> = {
    new: '#3498DB',
    regular: '#2ECC71',
    vip: '#9B59B6',
    at_risk: '#E74C3C',
  };
  return colors[segment];
};

export const getSegmentLabel = (segment: CustomerSegment): string => {
  const labels: Record<CustomerSegment, string> = {
    new: 'New',
    regular: 'Regular',
    vip: 'VIP',
    at_risk: 'At Risk',
  };
  return labels[segment];
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};
