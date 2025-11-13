/**
 * Shared TypeScript Types for UMA Ecosystem
 * Used by both Rider/User App and Business/Merchant App
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// MERCHANT TYPES
// ============================================================================

export interface Merchant {
  id: string;
  name: string;
  businessType: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email?: string;
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// DEAL/OFFER TYPES
// ============================================================================

export interface Deal {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  category: string;
  image?: string;
  validFrom: number;
  validUntil: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  termsAndConditions?: string[];
  status: 'active' | 'expired' | 'paused';
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// STAMP CARD TYPES
// ============================================================================

export interface StampCard {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  stampsRequired: number;
  stampsCollected: number;
  reward: string;
  status: 'active' | 'completed' | 'redeemed';
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  redeemedAt?: number;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  id: string;
  userId: string;
  merchantId?: string;
  merchantName?: string;
  type: 'deal_used' | 'stamp_earned' | 'reward_redeemed' | 'wallet_topup' | 'wallet_payment' | 'ride_payment';
  amount?: number;
  description: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// ============================================================================
// CAMPAIGN TYPES (for Business App)
// ============================================================================

export interface Campaign {
  id: string;
  merchantId: string;
  name: string;
  type: 'discount' | 'loyalty' | 'seasonal' | 'new_customer';
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  targetAudience: {
    segmentIds: string[];
    minAge?: number;
    maxAge?: number;
    location?: string;
  };
  budget: {
    total: number;
    spent: number;
    dailyLimit?: number;
  };
  schedule: {
    startDate: number;
    endDate: number;
    daysOfWeek?: string[];
    timeOfDay?: string;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    clickThroughRate: number;
  };
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// CUSTOMER PROFILE (for Business App CRM)
// ============================================================================

export interface CustomerProfile {
  id: string;
  userId: string;
  merchantId: string;
  phone: string;
  name?: string;
  email?: string;
  segment: 'vip' | 'regular' | 'new' | 'at_risk';
  lifetimeValue: number;
  averageSpend: number;
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  favoriteItems: string[];
  stampCards: {
    active: StampCard[];
    completed: StampCard[];
  };
  preferences: {
    timeOfDay: string;
    dayOfWeek: string[];
  };
  communication: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    lastContact: number;
  };
  tags: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// ANALYTICS TYPES (for Business App)
// ============================================================================

export interface BusinessAnalytics {
  merchantId: string;
  merchantName: string;
  period: 'today' | 'week' | 'month' | 'quarter';
  overview: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    customerAcquisitionCost: number;
    customersTrend: number;
    revenueTrend: number;
    aovTrend: number;
  };
  customerInsights: {
    demographics: any;
    behavior: any;
    loyalty: any;
  };
  campaignPerformance: {
    activeCampaigns: Campaign[];
    roiByCampaign: any[];
    bestPerformingDeals: any[];
  };
  competitiveIntelligence: {
    marketShare: number;
    marketRank: number;
    totalCompetitors: number;
    ratingComparison: any[];
    pricingComparison: any[];
    demandForecast: any[];
  };
  recommendations: any[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'campaign' | 'deal' | 'reward' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  timestamp: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
