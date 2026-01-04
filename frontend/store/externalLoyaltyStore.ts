import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type ProgramType = 'stamps' | 'points' | 'tiers' | 'visits';
export type RewardStatus = 'active' | 'expired' | 'redeemed' | 'near_expiry';
export type ProgramSource = 'starbucks' | 'dominos' | 'bigbazaar' | 'local' | 'other';
export type SyncMethod = 'api' | 'email_parsing' | 'receipt_scanning';

export interface ManualUpdate {
  id: string;
  date: number;
  progressChange: number;
  notes?: string;
  receiptPhoto?: string; // Base64 or URI
  location?: string;
}

export interface ExternalLoyaltyProgram {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  category: string; // 'Food & Drink', 'Retail', 'Services', etc.
  programType: ProgramType;
  currentProgress: number;
  requiredForReward: number;
  reward: string;
  pointsValue?: number; // For points-based programs
  tierLevel?: string; // For tier-based programs (Bronze, Silver, Gold, etc.)
  expirationDate?: number;
  isManual: boolean; // User manually tracks vs auto-integrated
  lastUpdated: number;
  createdAt: number;
  notes?: string;
  status: RewardStatus;
  reminderEnabled: boolean;
  // Integration metadata
  externalProgramId?: string;
  merchantWebsite?: string;
  cardNumber?: string;
  programSource: ProgramSource;
  // Manual tracking
  manualUpdates: ManualUpdate[];
  // Auto-sync configuration
  autoSync: boolean;
  syncMethod?: SyncMethod;
  lastSyncDate?: number;
}

export interface LoyaltyTemplate {
  id: string;
  merchantName: string;
  merchantLogo: string;
  category: string;
  programType: ProgramType;
  requiredForReward: number;
  defaultReward: string;
  isPopular: boolean;
}

export interface LoyaltyInsight {
  totalPrograms: number;
  activePrograms: number;
  expiringPrograms: number;
  totalPotentialSavings: number;
  topRecommendation: {
    programId: string;
    merchantName: string;
    reason: string;
    estimatedValue: number;
  } | null;
  usagePatterns: {
    mostUsedCategory: string;
    averageRedemptionTime: number; // days
    preferredProgramType: ProgramType;
  };
}

export interface LoyaltyReminder {
  id: string;
  programId: string;
  merchantName: string;
  type: 'expiring_soon' | 'milestone_reached' | 'unused_points' | 'new_reward';
  message: string;
  timestamp: number;
  isRead: boolean;
  actionRequired: boolean;
}

// ============================================================================
// POPULAR LOYALTY PROGRAM TEMPLATES
// ============================================================================

const LOYALTY_TEMPLATES: LoyaltyTemplate[] = [
  // Food & Drink
  {
    id: 'tmpl_starbucks',
    merchantName: 'Starbucks',
    merchantLogo: '☕',
    category: 'Food & Drink',
    programType: 'stamps',
    requiredForReward: 10,
    defaultReward: 'Free Beverage of Choice',
    isPopular: true,
  },
  {
    id: 'tmpl_dominos',
    merchantName: "Domino's Pizza",
    merchantLogo: '🍕',
    category: 'Food & Drink',
    programType: 'stamps',
    requiredForReward: 6,
    defaultReward: 'Free Medium Pizza',
    isPopular: true,
  },
  {
    id: 'tmpl_subway',
    merchantName: 'Subway',
    merchantLogo: '🥪',
    category: 'Food & Drink',
    programType: 'points',
    requiredForReward: 200,
    defaultReward: 'Free 6-inch Sub',
    isPopular: true,
  },
  {
    id: 'tmpl_mcdonalds',
    merchantName: "McDonald's",
    merchantLogo: '🍔',
    category: 'Food & Drink',
    programType: 'points',
    requiredForReward: 1500,
    defaultReward: 'Free Meal',
    isPopular: true,
  },
  {
    id: 'tmpl_dunkin',
    merchantName: 'Dunkin Donuts',
    merchantLogo: '🍩',
    category: 'Food & Drink',
    programType: 'stamps',
    requiredForReward: 5,
    defaultReward: 'Free Beverage',
    isPopular: true,
  },
  // Retail
  {
    id: 'tmpl_bigbazaar',
    merchantName: 'Big Bazaar',
    merchantLogo: '🛒',
    category: 'Retail',
    programType: 'points',
    requiredForReward: 500,
    defaultReward: '₹100 Off Next Purchase',
    isPopular: true,
  },
  {
    id: 'tmpl_reliance',
    merchantName: 'Reliance Fresh',
    merchantLogo: '🏪',
    category: 'Retail',
    programType: 'points',
    requiredForReward: 1000,
    defaultReward: '₹200 Cashback',
    isPopular: true,
  },
  {
    id: 'tmpl_dmart',
    merchantName: 'DMart',
    merchantLogo: '🛍️',
    category: 'Retail',
    programType: 'points',
    requiredForReward: 750,
    defaultReward: '₹150 Store Credit',
    isPopular: true,
  },
  // Fuel
  {
    id: 'tmpl_shell',
    merchantName: 'Shell',
    merchantLogo: '⛽',
    category: 'Fuel',
    programType: 'points',
    requiredForReward: 500,
    defaultReward: '₹100 Fuel Credit',
    isPopular: true,
  },
  {
    id: 'tmpl_hp',
    merchantName: 'HP Petrol',
    merchantLogo: '⛽',
    category: 'Fuel',
    programType: 'stamps',
    requiredForReward: 10,
    defaultReward: 'Free Car Wash',
    isPopular: true,
  },
  // Services
  {
    id: 'tmpl_salon',
    merchantName: 'Local Salon',
    merchantLogo: '💇',
    category: 'Beauty & Wellness',
    programType: 'stamps',
    requiredForReward: 8,
    defaultReward: 'Free Haircut',
    isPopular: false,
  },
  {
    id: 'tmpl_gym',
    merchantName: 'Fitness Center',
    merchantLogo: '🏋️',
    category: 'Health & Fitness',
    programType: 'tiers',
    requiredForReward: 12,
    defaultReward: '1 Month Free',
    isPopular: false,
  },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_PROGRAMS: ExternalLoyaltyProgram[] = [
  {
    id: 'ext_1',
    merchantName: 'Starbucks',
    merchantLogo: '☕',
    category: 'Food & Drink',
    programType: 'stamps',
    currentProgress: 7,
    requiredForReward: 10,
    reward: 'Free Beverage of Choice',
    expirationDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days
    isManual: true,
    lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    status: 'active',
    reminderEnabled: true,
    cardNumber: 'SB123456789',
    programSource: 'starbucks',
    manualUpdates: [],
    autoSync: false,
  },
  {
    id: 'ext_2',
    merchantName: "Domino's Pizza",
    merchantLogo: '🍕',
    category: 'Food & Drink',
    programType: 'stamps',
    currentProgress: 4,
    requiredForReward: 6,
    reward: 'Free Medium Pizza',
    expirationDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
    isManual: true,
    lastUpdated: Date.now() - 5 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    status: 'active',
    reminderEnabled: true,
    programSource: 'dominos',
    manualUpdates: [],
    autoSync: false,
  },
  {
    id: 'ext_3',
    merchantName: 'Big Bazaar',
    merchantLogo: '🛒',
    category: 'Retail',
    programType: 'points',
    currentProgress: 1250,
    requiredForReward: 500,
    reward: '₹100 Off Next Purchase',
    pointsValue: 1250,
    isManual: true,
    lastUpdated: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    status: 'active',
    reminderEnabled: true,
    notes: 'Check balance before next shopping trip',
    programSource: 'bigbazaar',
    manualUpdates: [],
    autoSync: false,
  },
  {
    id: 'ext_4',
    merchantName: 'Shell Fuel',
    merchantLogo: '⛽',
    category: 'Fuel',
    programType: 'points',
    currentProgress: 450,
    requiredForReward: 500,
    reward: '₹100 Fuel Credit',
    pointsValue: 450,
    expirationDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days - expiring soon!
    isManual: true,
    lastUpdated: Date.now() - 1 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    status: 'near_expiry',
    reminderEnabled: true,
    programSource: 'other',
    manualUpdates: [],
    autoSync: false,
  },
];

// ============================================================================
// STORE
// ============================================================================

interface ExternalLoyaltyStore {
  programs: ExternalLoyaltyProgram[];
  templates: LoyaltyTemplate[];
  reminders: LoyaltyReminder[];
  insights: LoyaltyInsight | null;
  isLoading: boolean;

  // Actions
  fetchPrograms: () => Promise<void>;
  addProgram: (program: Omit<ExternalLoyaltyProgram, 'id' | 'createdAt' | 'lastUpdated' | 'status'>) => void;
  updateProgram: (id: string, updates: Partial<ExternalLoyaltyProgram>) => void;
  deleteProgram: (id: string) => void;
  updateProgress: (id: string, newProgress: number) => void;
  redeemReward: (id: string) => void;

  // Manual Updates
  addManualUpdate: (programId: string, update: Omit<ManualUpdate, 'id'>) => void;
  getManualUpdateHistory: (programId: string) => ManualUpdate[];
  deleteManualUpdate: (programId: string, updateId: string) => void;

  // Templates
  getTemplates: () => LoyaltyTemplate[];
  createFromTemplate: (templateId: string, customization?: Partial<ExternalLoyaltyProgram>) => void;

  // Insights & Analytics
  calculateInsights: () => void;
  getExpiringPrograms: () => ExternalLoyaltyProgram[];
  getBestRedemptionOpportunities: () => ExternalLoyaltyProgram[];
  getTotalPortfolioValue: () => number;
  getProximityAlerts: (userLocation?: { lat: number; lng: number }) => Array<{ program: ExternalLoyaltyProgram; distance?: number }>;

  // Reminders
  generateReminders: () => void;
  fetchNotifications: () => Promise<void>;
  markReminderRead: (id: string) => void;
  markAllRemindersRead: () => void;
  dismissReminder: (id: string) => void;

  // Filters & Search
  filterByCategory: (category: string) => ExternalLoyaltyProgram[];
  filterByType: (type: ProgramType) => ExternalLoyaltyProgram[];
  searchPrograms: (query: string) => ExternalLoyaltyProgram[];
}

export const useExternalLoyaltyStore = create<ExternalLoyaltyStore>((set, get) => ({
  programs: SAMPLE_PROGRAMS,
  templates: LOYALTY_TEMPLATES,
  reminders: [],
  insights: null,
  isLoading: false,

  // ============================================================================
  // FETCH PROGRAMS
  // ============================================================================
  fetchPrograms: async () => {
    set({ isLoading: true });
    try {
      // In production, fetch from API
      // const response = await api.getExternalLoyaltyPrograms();

      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 500));

      set({ isLoading: false });
      get().calculateInsights();
      get().generateReminders();
    } catch (error) {
      console.error('Error fetching programs:', error);
      set({ isLoading: false });
    }
  },

  // ============================================================================
  // ADD PROGRAM
  // ============================================================================
  addProgram: (program) => {
    const now = Date.now();
    const newProgram: ExternalLoyaltyProgram = {
      ...program,
      id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      lastUpdated: now,
      status: determineStatus(program.currentProgress, program.requiredForReward, program.expirationDate),
    };

    set(state => ({
      programs: [...state.programs, newProgram],
    }));

    get().calculateInsights();
    get().generateReminders();
  },

  // ============================================================================
  // UPDATE PROGRAM
  // ============================================================================
  updateProgram: (id, updates) => {
    set(state => ({
      programs: state.programs.map(p =>
        p.id === id
          ? {
            ...p,
            ...updates,
            lastUpdated: Date.now(),
            status: determineStatus(
              updates.currentProgress ?? p.currentProgress,
              updates.requiredForReward ?? p.requiredForReward,
              updates.expirationDate ?? p.expirationDate
            ),
          }
          : p
      ),
    }));

    get().calculateInsights();
    get().generateReminders();
  },

  // ============================================================================
  // DELETE PROGRAM
  // ============================================================================
  deleteProgram: (id) => {
    set(state => ({
      programs: state.programs.filter(p => p.id !== id),
      reminders: state.reminders.filter(r => r.programId !== id),
    }));

    get().calculateInsights();
  },

  // ============================================================================
  // UPDATE PROGRESS
  // ============================================================================
  updateProgress: (id, newProgress) => {
    const program = get().programs.find(p => p.id === id);
    if (!program) return;

    get().updateProgram(id, { currentProgress: newProgress });

    // Check if milestone reached
    if (newProgress >= program.requiredForReward) {
      get().generateReminders();
    }
  },

  // ============================================================================
  // REDEEM REWARD
  // ============================================================================
  redeemReward: (id) => {
    get().updateProgram(id, {
      status: 'redeemed',
      currentProgress: 0,
      lastUpdated: Date.now(),
    });
  },

  // ============================================================================
  // GET TEMPLATES
  // ============================================================================
  getTemplates: () => {
    return get().templates;
  },

  // ============================================================================
  // CREATE FROM TEMPLATE
  // ============================================================================
  createFromTemplate: (templateId, customization = {}) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) return;

    const newProgram: Omit<ExternalLoyaltyProgram, 'id' | 'createdAt' | 'lastUpdated' | 'status'> = {
      merchantName: template.merchantName,
      merchantLogo: template.merchantLogo,
      category: template.category,
      programType: template.programType,
      currentProgress: 0,
      requiredForReward: template.requiredForReward,
      reward: template.defaultReward,
      isManual: true,
      reminderEnabled: true,
      programSource: 'other',
      manualUpdates: [],
      autoSync: false,
      ...customization,
    };

    get().addProgram(newProgram);
  },

  // ============================================================================
  // CALCULATE INSIGHTS
  // ============================================================================
  calculateInsights: () => {
    const programs = get().programs;

    if (programs.length === 0) {
      set({ insights: null });
      return;
    }

    const activePrograms = programs.filter(p => p.status === 'active');
    const expiringPrograms = programs.filter(p => p.status === 'near_expiry');

    // Calculate total potential savings
    const totalSavings = programs.reduce((sum, p) => {
      if (p.status === 'active' || p.status === 'near_expiry') {
        // Estimate value based on progress
        const progressPercent = p.currentProgress / p.requiredForReward;
        if (progressPercent >= 1) {
          return sum + estimateRewardValue(p);
        }
      }
      return sum;
    }, 0);

    // Find most used category
    const categoryCount: Record<string, number> = {};
    programs.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    const mostUsedCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
      , Object.keys(categoryCount)[0] || 'Unknown');

    // Find preferred program type
    const typeCount: Record<ProgramType, number> = { stamps: 0, points: 0, tiers: 0, visits: 0 };
    programs.forEach(p => {
      typeCount[p.programType]++;
    });
    const preferredType = (Object.keys(typeCount) as ProgramType[]).reduce((a, b) =>
      typeCount[a] > typeCount[b] ? a : b
    );

    // Find top recommendation
    const readyToRedeem = programs.filter(p =>
      p.currentProgress >= p.requiredForReward && p.status === 'active'
    );
    const topRecommendation = readyToRedeem.length > 0
      ? {
        programId: readyToRedeem[0].id,
        merchantName: readyToRedeem[0].merchantName,
        reason: 'Reward ready to redeem!',
        estimatedValue: estimateRewardValue(readyToRedeem[0]),
      }
      : expiringPrograms.length > 0
        ? {
          programId: expiringPrograms[0].id,
          merchantName: expiringPrograms[0].merchantName,
          reason: 'Expiring soon - use it before it expires!',
          estimatedValue: estimateRewardValue(expiringPrograms[0]),
        }
        : null;

    const insights: LoyaltyInsight = {
      totalPrograms: programs.length,
      activePrograms: activePrograms.length,
      expiringPrograms: expiringPrograms.length,
      totalPotentialSavings: totalSavings,
      topRecommendation,
      usagePatterns: {
        mostUsedCategory,
        averageRedemptionTime: 30, // Placeholder
        preferredProgramType: preferredType,
      },
    };

    set({ insights });
  },

  // ============================================================================
  // GET EXPIRING PROGRAMS
  // ============================================================================
  getExpiringPrograms: () => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return get().programs.filter(p =>
      p.expirationDate && p.expirationDate - now < sevenDays && p.status === 'active'
    );
  },

  // ============================================================================
  // GET BEST REDEMPTION OPPORTUNITIES
  // ============================================================================
  getBestRedemptionOpportunities: () => {
    return get().programs
      .filter(p => p.currentProgress >= p.requiredForReward && p.status === 'active')
      .sort((a, b) => estimateRewardValue(b) - estimateRewardValue(a));
  },

  // ============================================================================
  // GENERATE REMINDERS
  // ============================================================================
  generateReminders: () => {
    const programs = get().programs;
    const existingReminders = get().reminders;
    const generatedReminders: LoyaltyReminder[] = [];
    const now = Date.now();

    programs.forEach(program => {
      if (!program.reminderEnabled) return;

      // Expiring soon reminder
      if (program.expirationDate) {
        const daysUntilExpiry = Math.floor((program.expirationDate - now) / (24 * 60 * 60 * 1000));

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && program.status === 'active') {
          generatedReminders.push({
            id: `rem_exp_${program.id}`,
            programId: program.id,
            merchantName: program.merchantName,
            type: 'expiring_soon',
            message: `Your ${program.merchantName} reward expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
            timestamp: now,
            isRead: false,
            actionRequired: true,
          });
        }
      }

      // Milestone reached
      if (program.currentProgress >= program.requiredForReward && program.status === 'active') {
        const progressOver = Math.floor(program.currentProgress / program.requiredForReward);
        generatedReminders.push({
          id: `rem_milestone_${program.id}`,
          programId: program.id,
          merchantName: program.merchantName,
          type: 'milestone_reached',
          message: `🎉 You've earned ${progressOver} reward${progressOver === 1 ? '' : 's'} at ${program.merchantName}!`,
          timestamp: now,
          isRead: false,
          actionRequired: true,
        });
      }

      // Unused points reminder (30+ days)
      const daysSinceUpdate = Math.floor((now - program.lastUpdated) / (24 * 60 * 60 * 1000));
      if (daysSinceUpdate >= 30 && program.currentProgress > 0) {
        generatedReminders.push({
          id: `rem_unused_${program.id}`,
          programId: program.id,
          merchantName: program.merchantName,
          type: 'unused_points',
          message: `You haven't used your ${program.merchantName} ${program.programType} in ${daysSinceUpdate} days`,
          timestamp: now,
          isRead: false,
          actionRequired: false,
        });
      }

      // Almost there reminder
      const progressPercent = (program.currentProgress / program.requiredForReward) * 100;
      if (progressPercent >= 80 && progressPercent < 100) {
        const remaining = program.requiredForReward - program.currentProgress;
        generatedReminders.push({
          id: `rem_almost_${program.id}`,
          programId: program.id,
          merchantName: program.merchantName,
          type: 'new_reward',
          message: `Only ${remaining} more ${program.programType === 'stamps' ? 'stamp' : 'point'}${remaining === 1 ? '' : 's'} for ${program.reward} at ${program.merchantName}!`,
          timestamp: now,
          isRead: false,
          actionRequired: false,
        });
      }
    });

    // Merge strategy: Keep existing if ID matches (preserve isRead), otherwise use new
    const mergedReminders = generatedReminders.map(newReminder => {
      const existing = existingReminders.find(r => r.id === newReminder.id);
      if (existing) {
        return {
          ...newReminder,
          isRead: existing.isRead, // Preserve read status
          timestamp: existing.timestamp // Preserve original timestamp
        };
      }
      return newReminder;
    });

    // Also keep backend notifications that aren't in the generated list (since they come from different source)
    const backendReminders = existingReminders.filter(r => r.programId === 'backend_notification');
    // Deduplicate in case backend reminders overlap (unlikely given different logic)

    set({ reminders: [...mergedReminders, ...backendReminders] });
  },

  fetchNotifications: async () => {
    try {
      const { userService } = require('../services/api/userService');
      const response = await userService.getNotifications();

      if (response.data && response.data.notifications) {
        const backendReminders = response.data.notifications.map((n: any) => ({
          id: n._id,
          programId: 'backend_notification',
          merchantName: 'Merchant Update', // Ideally fetch merchant name, but title is fine
          type: 'new_reward', // Default icon
          message: `${n.title}: ${n.message}`,
          timestamp: new Date(n.createdAt).getTime(),
          isRead: false,
          actionRequired: false,
        }));

        set(state => {
          // Merge with existing reminders, avoiding duplicates
          const existingIds = new Set(state.reminders.map(r => r.id));
          const newReminders = backendReminders.filter((r: any) => !existingIds.has(r.id));
          return { reminders: [...newReminders, ...state.reminders] };
        });
      }
    } catch (error) {
      console.error('Error fetching backend notifications:', error);
    }
  },

  // ============================================================================
  // GENERATE MILESTONE REMINDER (called when progress updated)
  // ============================================================================
  generateMilestoneReminder: (programId: string) => {
    const program = get().programs.find(p => p.id === programId);
    if (!program) return;

    const reminder: LoyaltyReminder = {
      id: `rem_new_${Date.now()}`,
      programId,
      merchantName: program.merchantName,
      type: 'milestone_reached',
      message: `🎉 Congratulations! You've completed your ${program.merchantName} loyalty card!`,
      timestamp: Date.now(),
      isRead: false,
      actionRequired: true,
    };

    set(state => ({
      reminders: [reminder, ...state.reminders],
    }));
  },

  // ============================================================================
  // MARK REMINDER READ
  // ============================================================================
  markReminderRead: (id) => {
    set(state => ({
      reminders: state.reminders.map(r =>
        r.id === id ? { ...r, isRead: true } : r
      ),
    }));
  },

  // ============================================================================
  // MARK ALL REMINDERS READ
  // ============================================================================
  markAllRemindersRead: () => {
    set(state => ({
      reminders: state.reminders.map(r => ({ ...r, isRead: true })),
    }));
  },

  // ============================================================================
  // DISMISS REMINDER
  // ============================================================================
  dismissReminder: (id) => {
    set(state => ({
      reminders: state.reminders.filter(r => r.id !== id),
    }));
  },

  // ============================================================================
  // FILTER BY CATEGORY
  // ============================================================================
  filterByCategory: (category) => {
    return get().programs.filter(p => p.category === category);
  },

  // ============================================================================
  // FILTER BY TYPE
  // ============================================================================
  filterByType: (type) => {
    return get().programs.filter(p => p.programType === type);
  },

  // ============================================================================
  // SEARCH PROGRAMS
  // ============================================================================
  searchPrograms: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().programs.filter(p =>
      p.merchantName.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.reward.toLowerCase().includes(lowerQuery)
    );
  },

  // ============================================================================
  // MANUAL UPDATE MANAGEMENT
  // ============================================================================
  addManualUpdate: (programId, updateData) => {
    const program = get().programs.find(p => p.id === programId);
    if (!program) return;

    const newUpdate: ManualUpdate = {
      ...updateData,
      id: `upd_${Date.now()}`,
      date: updateData.date || Date.now(),
    };

    const newProgress = program.currentProgress + updateData.progressChange;

    set(state => ({
      programs: state.programs.map(p =>
        p.id === programId
          ? {
            ...p,
            currentProgress: newProgress,
            manualUpdates: [newUpdate, ...p.manualUpdates],
            lastUpdated: Date.now(),
          }
          : p
      ),
    }));

    // Recalculate insights after manual update
    get().calculateInsights();
  },

  getManualUpdateHistory: (programId) => {
    const program = get().programs.find(p => p.id === programId);
    return program?.manualUpdates || [];
  },

  deleteManualUpdate: (programId, updateId) => {
    const program = get().programs.find(p => p.id === programId);
    if (!program) return;

    const update = program.manualUpdates.find(u => u.id === updateId);
    if (!update) return;

    const newProgress = program.currentProgress - update.progressChange;

    set(state => ({
      programs: state.programs.map(p =>
        p.id === programId
          ? {
            ...p,
            currentProgress: newProgress,
            manualUpdates: p.manualUpdates.filter(u => u.id !== updateId),
            lastUpdated: Date.now(),
          }
          : p
      ),
    }));

    get().calculateInsights();
  },

  // ============================================================================
  // PORTFOLIO ANALYTICS
  // ============================================================================
  getTotalPortfolioValue: () => {
    const programs = get().programs;
    return programs.reduce((sum, p) => {
      if (p.currentProgress >= p.requiredForReward && (p.status === 'active' || p.status === 'near_expiry')) {
        return sum + estimateRewardValue(p);
      }
      return sum;
    }, 0);
  },

  getProximityAlerts: (userLocation) => {
    const programs = get().programs.filter(p => {
      const progressPercent = (p.currentProgress / p.requiredForReward) * 100;
      return progressPercent >= 80 && p.status === 'active';
    });

    // For now, return all near-completion programs
    // In production, would use actual location data
    return programs.map(p => ({
      program: p,
      distance: userLocation ? Math.random() * 5 : undefined, // Mock distance
    }));
  },
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineStatus(
  currentProgress: number,
  requiredForReward: number,
  expirationDate?: number
): RewardStatus {
  const now = Date.now();

  if (expirationDate && expirationDate < now) {
    return 'expired';
  }

  if (expirationDate) {
    const daysUntilExpiry = (expirationDate - now) / (24 * 60 * 60 * 1000);
    if (daysUntilExpiry <= 7) {
      return 'near_expiry';
    }
  }

  return 'active';
}

function estimateRewardValue(program: ExternalLoyaltyProgram): number {
  // Extract numeric value from reward string
  const match = program.reward.match(/₹(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  // Default estimates based on program type
  if (program.programType === 'stamps') {
    return 100; // Estimate ₹100 for stamp rewards
  } else if (program.programType === 'points') {
    return program.pointsValue ? program.pointsValue * 0.1 : 50; // 10 paise per point
  }

  return 50; // Default
}

// ============================================================================
// UTILITY FUNCTIONS (exported for components)
// ============================================================================

export const formatProgress = (current: number, required: number, type: ProgramType): string => {
  if (type === 'points') {
    return `${current.toLocaleString()} / ${required.toLocaleString()} points`;
  } else if (type === 'stamps') {
    return `${current} / ${required} stamps`;
  } else {
    return `Level ${current} / ${required}`;
  }
};

export const getProgressPercentage = (current: number, required: number): number => {
  return Math.min((current / required) * 100, 100);
};

export const getDaysUntilExpiry = (expirationDate?: number): number | null => {
  if (!expirationDate) return null;
  return Math.floor((expirationDate - Date.now()) / (24 * 60 * 60 * 1000));
};

export const formatExpiryDate = (expirationDate?: number): string => {
  if (!expirationDate) return 'No expiration';

  const days = getDaysUntilExpiry(expirationDate);
  if (days === null) return 'No expiration';

  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;

  return new Date(expirationDate).toLocaleDateString();
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Food & Drink': '🍔',
    'Retail': '🛒',
    'Fuel': '⛽',
    'Beauty & Wellness': '💇',
    'Health & Fitness': '🏋️',
    'Entertainment': '🎬',
    'Travel': '✈️',
    'Services': '🔧',
  };
  return icons[category] || '🏪';
};

export const getProgramTypeLabel = (type: ProgramType): string => {
  const labels: Record<ProgramType, string> = {
    stamps: 'Stamp Card',
    points: 'Points Program',
    tiers: 'Tier System',
    visits: 'Visit Tracker',
  };
  return labels[type];
};
