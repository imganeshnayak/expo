import { create } from 'zustand';

// ==================== TYPES ====================

export type CouponSource = 'uma_merchant' | 'desidime' | 'cashkaro' | 'magicpin' | 'user_submitted' | 'social_media';
export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'free_item';
export type DealTag = 'hidden' | 'limited_time' | 'first_order' | 'group_only' | 'app_only' | 'magic_deal' | 'viral';

export interface StackingRule {
  canStackWith: string[]; // coupon IDs or types
  stackingOrder: number; // 1 = apply first, 2 = apply second, etc.
  restrictions?: string;
}

export interface AggregatedCoupon {
  id: string;
  source: CouponSource;
  merchantId: string;
  merchantName: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  categories: string[];
  validFrom: Date;
  validUntil: Date;
  successRate: number; // 0-100
  usageCount: number;
  lastVerified: Date;
  isActive: boolean;
  terms: string;
  stackingRules: StackingRule[];
  discoveredBy?: string; // user ID
  tags: DealTag[];
  thumbnail?: string;
  viralScore?: number; // 0-100 for trending deals
}

export interface DealStackingResult {
  baseDeal: AggregatedCoupon;
  stackableCoupons: AggregatedCoupon[];
  totalSavings: number;
  savingsBreakdown: { couponId: string; savings: number; description: string }[];
  stackingInstructions: string[];
  estimatedTotal: number;
  originalTotal: number;
  confidence: number; // 0-100
}

export interface UserCouponHistory {
  userId: string;
  couponId: string;
  usedAt: Date;
  orderAmount: number;
  savings: number;
  success: boolean;
  failureReason?: string;
}

export interface CouponRecommendation {
  coupon: AggregatedCoupon;
  relevanceScore: number; // 0-100
  reasons: string[];
  expiringIn?: string;
  nearbyMerchant?: boolean;
  trendingScore?: number;
}

export interface SavingsStats {
  totalSaved: number;
  savingsThisMonth: number;
  averageSavingsPerOrder: number;
  bestDeal: { couponCode: string; savings: number; date: Date };
  couponSuccessRate: number;
  comparisonToAverage: number; // percentage above/below average user
  projectedMonthlySavings: number;
  projectedYearlySavings: number;
}

export interface CouponAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
  requirement: number;
}

export interface HiddenDeal {
  coupon: AggregatedCoupon;
  sourceUrl?: string;
  foundBy: string; // user name or "UMA AI"
  discoveredAt: Date;
  viralityRating: number; // 0-100
  shareCount: number;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_COUPONS: AggregatedCoupon[] = [
  {
    id: 'coup-1',
    source: 'uma_merchant',
    merchantId: 'merch-1',
    merchantName: 'Mario\'s Pizza Palace',
    code: 'UMAPIZZA50',
    description: '50% Off Any Large Pizza',
    discountType: 'percentage',
    discountValue: 50,
    minimumOrderValue: 500,
    maximumDiscount: 300,
    categories: ['Food & Drink', 'Pizza'],
    validFrom: new Date('2024-11-01'),
    validUntil: new Date('2025-12-31'),
    successRate: 95,
    usageCount: 1234,
    lastVerified: new Date(),
    isActive: true,
    terms: 'Valid on orders above ₹500. Maximum discount ₹300. Not valid with other offers.',
    stackingRules: [
      { canStackWith: ['ride-reimbursement'], stackingOrder: 2 }
    ],
    tags: ['limited_time'],
    viralScore: 85,
  },
  {
    id: 'coup-2',
    source: 'social_media',
    merchantId: 'merch-2',
    merchantName: 'Urban Brew Cafe',
    code: 'BOGO2024',
    description: 'Buy 1 Get 1 Free on All Coffee',
    discountType: 'bogo',
    discountValue: 100,
    categories: ['Food & Drink', 'Coffee'],
    validFrom: new Date('2024-11-01'),
    validUntil: new Date('2024-12-15'),
    successRate: 88,
    usageCount: 567,
    lastVerified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isActive: true,
    terms: 'Valid on all coffee beverages. One coupon per transaction.',
    stackingRules: [],
    discoveredBy: 'Rohan Kumar',
    tags: ['hidden', 'viral'],
    viralScore: 92,
  },
  {
    id: 'coup-3',
    source: 'desidime',
    merchantId: 'merch-3',
    merchantName: 'Serenity Wellness Spa',
    code: 'WELLNESS30',
    description: '30% Off Spa Services',
    discountType: 'percentage',
    discountValue: 30,
    minimumOrderValue: 1000,
    maximumDiscount: 500,
    categories: ['Wellness', 'Spa'],
    validFrom: new Date('2024-11-01'),
    validUntil: new Date('2025-01-31'),
    successRate: 92,
    usageCount: 890,
    lastVerified: new Date(),
    isActive: true,
    terms: 'Valid Monday-Thursday only. Advance booking required.',
    stackingRules: [
      { canStackWith: ['ride-reimbursement', 'first-order'], stackingOrder: 1 }
    ],
    tags: ['limited_time'],
    viralScore: 70,
  },
  {
    id: 'coup-4',
    source: 'user_submitted',
    merchantId: 'merch-4',
    merchantName: 'TechZone Electronics',
    code: 'TECH500',
    description: '₹500 Off on Orders Above ₹5000',
    discountType: 'fixed',
    discountValue: 500,
    minimumOrderValue: 5000,
    categories: ['Electronics', 'Shopping'],
    validFrom: new Date('2024-11-10'),
    validUntil: new Date('2024-11-30'),
    successRate: 78,
    usageCount: 234,
    lastVerified: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    isActive: true,
    terms: 'Valid on electronics only. Cannot be combined with sale items.',
    stackingRules: [],
    discoveredBy: 'Priya Sharma',
    tags: ['limited_time'],
    viralScore: 60,
  },
  {
    id: 'coup-5',
    source: 'magicpin',
    merchantId: 'merch-1',
    merchantName: 'Mario\'s Pizza Palace',
    code: 'FREEDRINKS',
    description: 'Free Drinks with Any Pizza Order',
    discountType: 'free_item',
    discountValue: 150,
    categories: ['Food & Drink', 'Pizza'],
    validFrom: new Date('2024-11-01'),
    validUntil: new Date('2024-12-31'),
    successRate: 85,
    usageCount: 456,
    lastVerified: new Date(),
    isActive: true,
    terms: '2 free soft drinks (330ml) with any pizza order.',
    stackingRules: [
      { canStackWith: ['UMAPIZZA50', 'ride-reimbursement'], stackingOrder: 3 }
    ],
    tags: ['hidden', 'magic_deal'],
    viralScore: 95,
  },
  {
    id: 'coup-6',
    source: 'uma_merchant',
    merchantId: 'ride',
    merchantName: 'UMA Ride',
    code: 'RIDEBACK100',
    description: '100% Ride Reimbursement (up to ₹100)',
    discountType: 'fixed',
    discountValue: 100,
    maximumDiscount: 100,
    categories: ['Transportation'],
    validFrom: new Date('2024-11-01'),
    validUntil: new Date('2025-12-31'),
    successRate: 100,
    usageCount: 3456,
    lastVerified: new Date(),
    isActive: true,
    terms: 'Auto-applied on rides to merchant locations. Max ₹100 per trip.',
    stackingRules: [
      { canStackWith: ['*'], stackingOrder: 1 } // Can stack with everything, apply first
    ],
    tags: ['app_only'],
    viralScore: 88,
  },
];

const SAMPLE_ACHIEVEMENTS: CouponAchievement[] = [
  {
    id: 'ach-1',
    name: 'Coupon Guru',
    description: 'Save ₹5,000 using UMA coupons',
    icon: '🏆',
    unlockedAt: new Date('2024-11-01'),
    progress: 100,
    requirement: 5000,
  },
  {
    id: 'ach-2',
    name: 'Deal Stacker',
    description: 'Successfully stack 3+ coupons in one order',
    icon: '🎯',
    progress: 100,
    requirement: 1,
    unlockedAt: new Date('2024-11-05'),
  },
  {
    id: 'ach-3',
    name: 'Community Hero',
    description: 'Submit 5 verified coupons',
    icon: '❤️',
    progress: 60,
    requirement: 5,
  },
  {
    id: 'ach-4',
    name: 'Hidden Gem Hunter',
    description: 'Discover 10 hidden deals',
    icon: '💎',
    progress: 40,
    requirement: 10,
  },
  {
    id: 'ach-5',
    name: 'Savings Champion',
    description: 'Save ₹10,000 in a single month',
    icon: '👑',
    progress: 75,
    requirement: 10000,
  },
];

// ==================== STORE ====================

interface CouponEngineState {
  // Coupons
  coupons: AggregatedCoupon[];
  userHistory: UserCouponHistory[];
  savedCoupons: string[]; // coupon IDs
  
  // Recommendations
  recommendations: CouponRecommendation[];
  hiddenDeals: HiddenDeal[];
  
  // Stats & Achievements
  savingsStats: SavingsStats;
  achievements: CouponAchievement[];
  
  // Actions
  fetchCoupons: () => void;
  searchCoupons: (query: string) => AggregatedCoupon[];
  getCouponsByMerchant: (merchantId: string) => AggregatedCoupon[];
  getCouponsByCategory: (category: string) => AggregatedCoupon[];
  
  // Stacking Engine
  findBestStack: (merchantId: string, orderAmount: number) => DealStackingResult | null;
  canStack: (couponIds: string[]) => boolean;
  calculateStackingSavings: (couponIds: string[], orderAmount: number) => number;
  
  // Auto-Apply
  autoApplyBestCoupon: (merchantId: string, orderAmount: number) => AggregatedCoupon | null;
  applyCoupon: (couponId: string, orderAmount: number) => { success: boolean; savings: number };
  
  // User Actions
  saveCoupon: (couponId: string) => void;
  unsaveCoupon: (couponId: string) => void;
  reportCouponSuccess: (couponId: string, orderAmount: number, savings: number) => void;
  reportCouponFailure: (couponId: string, reason: string) => void;
  submitCoupon: (coupon: Partial<AggregatedCoupon>) => void;
  
  // Recommendations
  getPersonalizedRecommendations: () => CouponRecommendation[];
  getExpiringCoupons: (days: number) => AggregatedCoupon[];
  getTrendingDeals: () => HiddenDeal[];
  
  // Helpers
  getCouponById: (id: string) => AggregatedCoupon | undefined;
  formatSavings: (amount: number) => string;
  getDaysUntilExpiry: (coupon: AggregatedCoupon) => number;
  calculateSingleCouponSavings: (coupon: AggregatedCoupon, orderAmount: number) => number;
  updateSavingsStats: () => void;
}

export const useCouponEngineStore = create<CouponEngineState>((set, get) => ({
  // Initial State
  coupons: SAMPLE_COUPONS,
  userHistory: [
    {
      userId: 'user-1',
      couponId: 'coup-1',
      usedAt: new Date('2024-11-10'),
      orderAmount: 800,
      savings: 300,
      success: true,
    },
    {
      userId: 'user-1',
      couponId: 'coup-2',
      usedAt: new Date('2024-11-08'),
      orderAmount: 300,
      savings: 150,
      success: true,
    },
    {
      userId: 'user-1',
      couponId: 'coup-5',
      usedAt: new Date('2024-11-10'),
      orderAmount: 800,
      savings: 150,
      success: true,
    },
  ],
  savedCoupons: ['coup-1', 'coup-2', 'coup-5'],
  recommendations: [],
  hiddenDeals: [
    {
      coupon: SAMPLE_COUPONS[1], // BOGO Coffee
      sourceUrl: 'https://instagram.com/reel/xyz',
      foundBy: 'Rohan Kumar',
      discoveredAt: new Date('2024-11-12'),
      viralityRating: 92,
      shareCount: 1234,
    },
    {
      coupon: SAMPLE_COUPONS[4], // Free Drinks
      sourceUrl: 'https://youtube.com/watch?v=abc',
      foundBy: 'UMA AI',
      discoveredAt: new Date('2024-11-11'),
      viralityRating: 95,
      shareCount: 2345,
    },
  ],
  savingsStats: {
    totalSaved: 5600,
    savingsThisMonth: 1800,
    averageSavingsPerOrder: 200,
    bestDeal: { couponCode: 'UMAPIZZA50', savings: 300, date: new Date('2024-11-10') },
    couponSuccessRate: 95,
    comparisonToAverage: 35, // 35% above average
    projectedMonthlySavings: 2400,
    projectedYearlySavings: 28800,
  },
  achievements: SAMPLE_ACHIEVEMENTS,

  // Actions
  fetchCoupons: () => {
    // In real app, fetch from API
    set({ coupons: SAMPLE_COUPONS });
  },

  searchCoupons: (query: string) => {
    const { coupons } = get();
    const lowerQuery = query.toLowerCase();
    return coupons.filter(
      c =>
        c.merchantName.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.code.toLowerCase().includes(lowerQuery) ||
        c.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  },

  getCouponsByMerchant: (merchantId: string) => {
    const { coupons } = get();
    return coupons.filter(c => c.merchantId === merchantId && c.isActive);
  },

  getCouponsByCategory: (category: string) => {
    const { coupons } = get();
    return coupons.filter(c => c.categories.includes(category) && c.isActive);
  },

  // Stacking Engine
  findBestStack: (merchantId: string, orderAmount: number) => {
    const { coupons } = get();
    const merchantCoupons = coupons.filter(
      c => c.merchantId === merchantId && c.isActive
    );

    if (merchantCoupons.length === 0) return null;

    // Find all valid stackable combinations
    const validCombinations: AggregatedCoupon[][] = [];

    // Start with each coupon as base
    merchantCoupons.forEach(baseCoupon => {
      if (baseCoupon.minimumOrderValue && orderAmount < baseCoupon.minimumOrderValue) {
        return;
      }

      const stackable: AggregatedCoupon[] = [baseCoupon];

      // Find stackable coupons
      baseCoupon.stackingRules.forEach(rule => {
        rule.canStackWith.forEach(canStackId => {
          if (canStackId === '*') {
            // Can stack with any
            merchantCoupons.forEach(otherCoupon => {
              if (
                otherCoupon.id !== baseCoupon.id &&
                (!otherCoupon.minimumOrderValue || orderAmount >= otherCoupon.minimumOrderValue)
              ) {
                stackable.push(otherCoupon);
              }
            });
          } else {
            const stackableCoupon = coupons.find(c => c.id === canStackId && c.isActive);
            if (
              stackableCoupon &&
              (!stackableCoupon.minimumOrderValue || orderAmount >= stackableCoupon.minimumOrderValue)
            ) {
              stackable.push(stackableCoupon);
            }
          }
        });
      });

      if (stackable.length > 0) {
        validCombinations.push(stackable);
      }
    });

    if (validCombinations.length === 0) {
      // No stacking possible, return best single coupon
      const bestSingle = merchantCoupons
        .filter(c => !c.minimumOrderValue || orderAmount >= c.minimumOrderValue)
        .sort((a, b) => {
          const aSavings = get().calculateSingleCouponSavings(a, orderAmount);
          const bSavings = get().calculateSingleCouponSavings(b, orderAmount);
          return bSavings - aSavings;
        })[0];

      if (!bestSingle) return null;

      const savings = get().calculateSingleCouponSavings(bestSingle, orderAmount);

      return {
        baseDeal: bestSingle,
        stackableCoupons: [],
        totalSavings: savings,
        savingsBreakdown: [
          { couponId: bestSingle.id, savings, description: bestSingle.description },
        ],
        stackingInstructions: ['Apply code at checkout'],
        estimatedTotal: orderAmount - savings,
        originalTotal: orderAmount,
        confidence: bestSingle.successRate,
      };
    }

    // Find best combination by total savings
    let bestCombination = validCombinations[0];
    let maxSavings = get().calculateStackingSavings(
      bestCombination.map(c => c.id),
      orderAmount
    );

    validCombinations.forEach(combo => {
      const savings = get().calculateStackingSavings(
        combo.map(c => c.id),
        orderAmount
      );
      if (savings > maxSavings) {
        maxSavings = savings;
        bestCombination = combo;
      }
    });

    // Sort by stacking order
    const sortedStack = bestCombination.sort((a, b) => {
      const aOrder = a.stackingRules[0]?.stackingOrder || 999;
      const bOrder = b.stackingRules[0]?.stackingOrder || 999;
      return aOrder - bOrder;
    });

    const savingsBreakdown = sortedStack.map(c => ({
      couponId: c.id,
      savings: get().calculateSingleCouponSavings(c, orderAmount),
      description: c.description,
    }));

    const instructions = sortedStack.map((c, i) => {
      if (i === 0) return `Apply code "${c.code}" first`;
      return `Then apply "${c.code}"`;
    });

    const avgSuccessRate =
      sortedStack.reduce((sum, c) => sum + c.successRate, 0) / sortedStack.length;

    return {
      baseDeal: sortedStack[0],
      stackableCoupons: sortedStack.slice(1),
      totalSavings: maxSavings,
      savingsBreakdown,
      stackingInstructions: instructions,
      estimatedTotal: orderAmount - maxSavings,
      originalTotal: orderAmount,
      confidence: avgSuccessRate,
    };
  },

  canStack: (couponIds: string[]) => {
    const { coupons } = get();
    if (couponIds.length < 2) return true;

    const couponList = couponIds.map(id => coupons.find(c => c.id === id)).filter(Boolean) as AggregatedCoupon[];

    // Check if each coupon can stack with others
    return couponList.every(coupon => {
      const otherIds = couponIds.filter(id => id !== coupon.id);
      return coupon.stackingRules.some(rule =>
        rule.canStackWith.includes('*') ||
        otherIds.every(otherId => rule.canStackWith.includes(otherId))
      );
    });
  },

  calculateStackingSavings: (couponIds: string[], orderAmount: number) => {
    const { coupons } = get();
    let totalSavings = 0;
    let currentAmount = orderAmount;

    // Sort by stacking order
    const sortedCoupons = couponIds
      .map(id => coupons.find(c => c.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const aOrder = a!.stackingRules[0]?.stackingOrder || 999;
        const bOrder = b!.stackingRules[0]?.stackingOrder || 999;
        return aOrder - bOrder;
      }) as AggregatedCoupon[];

    sortedCoupons.forEach(coupon => {
      const savings = get().calculateSingleCouponSavings(coupon, currentAmount);
      totalSavings += savings;
      currentAmount -= savings;
    });

    return totalSavings;
  },

  calculateSingleCouponSavings: (coupon: AggregatedCoupon, orderAmount: number) => {
    if (coupon.minimumOrderValue && orderAmount < coupon.minimumOrderValue) {
      return 0;
    }

    let savings = 0;

    switch (coupon.discountType) {
      case 'percentage':
        savings = (orderAmount * coupon.discountValue) / 100;
        break;
      case 'fixed':
        savings = coupon.discountValue;
        break;
      case 'bogo':
        // Assume 50% of order for BOGO
        savings = orderAmount * 0.5;
        break;
      case 'free_item':
        savings = coupon.discountValue;
        break;
    }

    if (coupon.maximumDiscount && savings > coupon.maximumDiscount) {
      savings = coupon.maximumDiscount;
    }

    return Math.min(savings, orderAmount);
  },

  // Auto-Apply
  autoApplyBestCoupon: (merchantId: string, orderAmount: number) => {
    const stackResult = get().findBestStack(merchantId, orderAmount);
    return stackResult ? stackResult.baseDeal : null;
  },

  applyCoupon: (couponId: string, orderAmount: number) => {
    const { coupons } = get();
    const coupon = coupons.find(c => c.id === couponId);

    if (!coupon || !coupon.isActive) {
      return { success: false, savings: 0 };
    }

    if (coupon.minimumOrderValue && orderAmount < coupon.minimumOrderValue) {
      return { success: false, savings: 0 };
    }

    const savings = get().calculateSingleCouponSavings(coupon, orderAmount);

    return { success: true, savings };
  },

  // User Actions
  saveCoupon: (couponId: string) => {
    set(state => ({
      savedCoupons: [...state.savedCoupons, couponId],
    }));
  },

  unsaveCoupon: (couponId: string) => {
    set(state => ({
      savedCoupons: state.savedCoupons.filter(id => id !== couponId),
    }));
  },

  reportCouponSuccess: (couponId: string, orderAmount: number, savings: number) => {
    const { coupons, userHistory } = get();

    // Update coupon success rate
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    if (couponIndex !== -1) {
      const updatedCoupons = [...coupons];
      updatedCoupons[couponIndex] = {
        ...updatedCoupons[couponIndex],
        usageCount: updatedCoupons[couponIndex].usageCount + 1,
        successRate: Math.min(100, updatedCoupons[couponIndex].successRate + 0.5),
        lastVerified: new Date(),
      };
      set({ coupons: updatedCoupons });
    }

    // Add to history
    const newHistory: UserCouponHistory = {
      userId: 'user-1',
      couponId,
      usedAt: new Date(),
      orderAmount,
      savings,
      success: true,
    };

    set({
      userHistory: [...userHistory, newHistory],
    });

    // Update stats
    get().updateSavingsStats();
  },

  reportCouponFailure: (couponId: string, reason: string) => {
    const { coupons, userHistory } = get();

    // Update coupon success rate (decrease)
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    if (couponIndex !== -1) {
      const updatedCoupons = [...coupons];
      updatedCoupons[couponIndex] = {
        ...updatedCoupons[couponIndex],
        successRate: Math.max(0, updatedCoupons[couponIndex].successRate - 2),
      };
      set({ coupons: updatedCoupons });
    }

    // Add to history
    const newHistory: UserCouponHistory = {
      userId: 'user-1',
      couponId,
      usedAt: new Date(),
      orderAmount: 0,
      savings: 0,
      success: false,
      failureReason: reason,
    };

    set({
      userHistory: [...userHistory, newHistory],
    });
  },

  submitCoupon: (coupon: Partial<AggregatedCoupon>) => {
    const newCoupon: AggregatedCoupon = {
      id: `coup-${Date.now()}`,
      source: 'user_submitted',
      merchantId: coupon.merchantId || '',
      merchantName: coupon.merchantName || '',
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      categories: coupon.categories || [],
      validFrom: coupon.validFrom || new Date(),
      validUntil: coupon.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      successRate: 50, // Start with neutral rating
      usageCount: 0,
      lastVerified: new Date(),
      isActive: true,
      terms: coupon.terms || '',
      stackingRules: [],
      discoveredBy: 'user-1',
      tags: ['limited_time'],
      viralScore: 50,
    };

    set(state => ({
      coupons: [newCoupon, ...state.coupons],
    }));
  },

  // Recommendations
  getPersonalizedRecommendations: () => {
    const { coupons, userHistory } = get();

    // Analyze user's past usage
    const usedCategories = new Set(
      userHistory.map(h => {
        const coupon = coupons.find(c => c.id === h.couponId);
        return coupon?.categories || [];
      }).flat()
    );

    const recommendations: CouponRecommendation[] = coupons
      .filter(c => c.isActive)
      .map(coupon => {
        let relevanceScore = 50;
        const reasons: string[] = [];

        // Category match
        if (coupon.categories.some(cat => usedCategories.has(cat))) {
          relevanceScore += 20;
          reasons.push(`You frequently use ${coupon.categories[0]} deals`);
        }

        // High success rate
        if (coupon.successRate > 85) {
          relevanceScore += 15;
          reasons.push(`${coupon.successRate}% success rate`);
        }

        // Expiring soon
        const daysLeft = get().getDaysUntilExpiry(coupon);
        if (daysLeft <= 7 && daysLeft > 0) {
          relevanceScore += 10;
          reasons.push(`Expires in ${daysLeft} days`);
        }

        // Hidden/viral deals
        if (coupon.tags.includes('hidden') || coupon.tags.includes('viral')) {
          relevanceScore += 15;
          reasons.push('Trending hidden deal');
        }

        // High viral score
        if (coupon.viralScore && coupon.viralScore > 80) {
          relevanceScore += 10;
          reasons.push('Going viral on social media');
        }

        return {
          coupon,
          relevanceScore: Math.min(100, relevanceScore),
          reasons,
          expiringIn: daysLeft <= 7 ? `${daysLeft} days` : undefined,
          trendingScore: coupon.viralScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    return recommendations;
  },

  getExpiringCoupons: (days: number) => {
    const { coupons } = get();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return coupons.filter(c => {
      const expiryDate = new Date(c.validUntil);
      return c.isActive && expiryDate <= futureDate && expiryDate > now;
    });
  },

  getTrendingDeals: () => {
    return get().hiddenDeals.sort((a, b) => b.viralityRating - a.viralityRating);
  },

  // Helpers
  getCouponById: (id: string) => {
    return get().coupons.find(c => c.id === id);
  },

  formatSavings: (amount: number) => {
    return `₹${amount.toFixed(0)}`;
  },

  getDaysUntilExpiry: (coupon: AggregatedCoupon) => {
    const now = new Date();
    const expiry = new Date(coupon.validUntil);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  updateSavingsStats: () => {
    const { userHistory } = get();
    const successfulOrders = userHistory.filter(h => h.success);

    const totalSaved = successfulOrders.reduce((sum, h) => sum + h.savings, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const savingsThisMonth = successfulOrders
      .filter(h => new Date(h.usedAt) >= thisMonth)
      .reduce((sum, h) => sum + h.savings, 0);

    const avgSavings = successfulOrders.length > 0
      ? totalSaved / successfulOrders.length
      : 0;

    const bestDeal = successfulOrders.reduce(
      (best, h) => (h.savings > best.savings ? h : best),
      successfulOrders[0] || { couponId: '', savings: 0, usedAt: new Date() }
    );

    const coupon = get().getCouponById(bestDeal.couponId);

    set({
      savingsStats: {
        totalSaved,
        savingsThisMonth,
        averageSavingsPerOrder: avgSavings,
        bestDeal: {
          couponCode: coupon?.code || '',
          savings: bestDeal.savings,
          date: bestDeal.usedAt,
        },
        couponSuccessRate: successfulOrders.length > 0
          ? (successfulOrders.length / userHistory.length) * 100
          : 0,
        comparisonToAverage: 35, // Mock - would calculate against all users
        projectedMonthlySavings: savingsThisMonth * 1.3,
        projectedYearlySavings: savingsThisMonth * 12,
      },
    });
  },
}));

// ==================== HELPER FUNCTIONS ====================

export const getDiscountTypeLabel = (type: DiscountType): string => {
  switch (type) {
    case 'percentage': return 'Percentage Off';
    case 'fixed': return 'Flat Discount';
    case 'bogo': return 'Buy 1 Get 1';
    case 'free_item': return 'Free Item';
  }
};

export const getSourceLabel = (source: CouponSource): string => {
  switch (source) {
    case 'uma_merchant': return 'UMA Partner';
    case 'desidime': return 'DesiDime';
    case 'cashkaro': return 'CashKaro';
    case 'magicpin': return 'MagicPin';
    case 'user_submitted': return 'Community';
    case 'social_media': return 'Social Media';
  }
};

export const getTagIcon = (tag: DealTag): string => {
  switch (tag) {
    case 'hidden': return '💎';
    case 'limited_time': return '⏰';
    case 'first_order': return '🎁';
    case 'group_only': return '👥';
    case 'app_only': return '📱';
    case 'magic_deal': return '✨';
    case 'viral': return '🔥';
  }
};

export const formatExpiryDate = (date: Date): string => {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${new Date(date).toLocaleDateString()}`;
};
