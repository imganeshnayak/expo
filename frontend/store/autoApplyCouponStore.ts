import { create } from 'zustand';

// ==================== TYPES ====================

export type IntegrationMethod = 'browser_extension' | 'deep_linking' | 'partner_api' | 'manual_override';
export type TriggerCondition = 'checkout_page' | 'cart_page' | 'payment_page' | 'product_page';
export type ApplicationMethod = 'code_injection' | 'deep_link' | 'qr_display' | 'api_call' | 'clipboard_copy';
export type VerificationMethod = 'url_change' | 'price_reduction' | 'confirmation_message' | 'dom_scan';
export type FallbackStrategy = 'try_next' | 'show_manual' | 'skip' | 'notify_user';
export type AutoApplyStatus = 'pending' | 'applying' | 'success' | 'failed' | 'skipped';
export type MerchantCategory = 'food_delivery' | 'ecommerce' | 'travel' | 'entertainment' | 'services' | 'grocery';

export interface AutoApplyRule {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: MerchantCategory;
  triggerCondition: TriggerCondition;
  applicationMethod: ApplicationMethod;
  couponPriority: number; // 1 = highest priority
  fallbackStrategy: FallbackStrategy;
  successVerification: VerificationMethod;
  urlPatterns: string[]; // Regex patterns to detect checkout pages
  domSelectors: {
    couponInput?: string;
    applyButton?: string;
    priceDisplay?: string;
    successMessage?: string;
  };
  deepLinkTemplate?: string; // Template for deep link with coupon
  apiEndpoint?: string; // For partner API integration
  enabled: boolean;
  successRate: number; // Historical success rate (0-1)
  lastUpdated: number;
}

export interface AutoApplyPreferences {
  enabled: boolean;
  requireConfirmation: boolean;
  allowedMerchants: string[];
  blockedMerchants: string[];
  maxApplicationsPerSession: number;
  autoTryMultipleCoupons: boolean; // Try multiple until best savings
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  savingsThreshold: number; // Minimum savings to auto-apply (₹)
}

export interface AutoApplyAttempt {
  id: string;
  timestamp: number;
  merchantId: string;
  merchantName: string;
  couponCode: string;
  couponId: string;
  method: ApplicationMethod;
  status: AutoApplyStatus;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  errorMessage?: string;
  verificationMethod: VerificationMethod;
  attemptDuration: number; // milliseconds
}

export interface SuccessMetric {
  merchantId: string;
  merchantName: string;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  totalSavings: number;
  averageSavings: number;
  lastAttempt: number;
  mostSuccessfulMethod: ApplicationMethod;
  mostSuccessfulCoupon?: string;
}

export interface MerchantIntegration {
  id: string;
  merchantName: string;
  category: MerchantCategory;
  logoUrl: string;
  supportedMethods: IntegrationMethod[];
  deepLinkScheme?: string; // e.g., "swiggy://", "zomato://"
  webUrl?: string;
  appPackageName?: string; // For Android deep linking
  apiIntegration: {
    enabled: boolean;
    endpoint?: string;
    authRequired: boolean;
  };
  browserIntegration: {
    enabled: boolean;
    checkoutUrls: string[];
    domSelectors: AutoApplyRule['domSelectors'];
  };
  activeCoupons: string[]; // Coupon IDs available for this merchant
  priority: number;
  enabled: boolean;
}

export interface AutoApplySession {
  id: string;
  startTime: number;
  endTime?: number;
  merchantId: string;
  attempts: AutoApplyAttempt[];
  currentStatus: AutoApplyStatus;
  bestSavings: number;
  bestCouponCode?: string;
}

export interface CouponStackingRule {
  merchantId: string;
  allowStacking: boolean;
  maxStackableCoupons: number;
  stackingOrder: string[]; // Order to apply coupons
  combinationRules: {
    coupon1: string;
    coupon2: string;
    compatible: boolean;
  }[];
}

// ==================== STORE ====================

interface AutoApplyCouponStore {
  // State
  preferences: AutoApplyPreferences;
  rules: AutoApplyRule[];
  merchantIntegrations: MerchantIntegration[];
  attemptHistory: AutoApplyAttempt[];
  successMetrics: SuccessMetric[];
  activeSessions: AutoApplySession[];
  stackingRules: CouponStackingRule[];
  isMonitoring: boolean;
  currentUrl: string | null;

  // Auto-Apply Core
  detectCheckoutPage: (url: string) => MerchantIntegration | null;
  autoApplyCoupon: (merchantId: string, cartAmount: number) => Promise<AutoApplyAttempt>;
  tryMultipleCoupons: (merchantId: string, cartAmount: number) => Promise<AutoApplyAttempt[]>;
  verifyApplication: (attemptId: string) => Promise<boolean>;
  handleFallback: (attempt: AutoApplyAttempt) => void;

  // Application Methods
  applyViaCodeInjection: (rule: AutoApplyRule, couponCode: string) => Promise<boolean>;
  applyViaDeepLink: (merchantId: string, couponCode: string) => Promise<boolean>;
  applyViaPartnerAPI: (merchantId: string, couponCode: string, cartAmount: number) => Promise<boolean>;
  applyManually: (couponCode: string) => void;

  // Browser Integration
  startDOMMonitoring: () => void;
  stopDOMMonitoring: () => void;
  injectCouponCode: (selector: string, code: string) => Promise<boolean>;
  clickApplyButton: (selector: string) => Promise<boolean>;
  detectPriceChange: (selector: string, originalPrice: number) => Promise<number | null>;

  // Deep Linking
  generateDeepLink: (merchantId: string, couponCode: string, additionalParams?: Record<string, string>) => string;
  openDeepLink: (deepLink: string) => Promise<boolean>;
  isAppInstalled: (packageName: string) => Promise<boolean>;

  // Success Tracking
  recordAttempt: (attempt: AutoApplyAttempt) => void;
  updateSuccessMetrics: (merchantId: string) => void;
  getSuccessRate: (merchantId: string) => number;
  getBestPerformingCoupons: (merchantId: string, limit: number) => string[];

  // Preferences & Controls
  updatePreferences: (preferences: Partial<AutoApplyPreferences>) => void;
  blockMerchant: (merchantId: string) => void;
  unblockMerchant: (merchantId: string) => void;
  allowMerchant: (merchantId: string) => void;
  toggleAutoApply: (enabled: boolean) => void;

  // Rules Management
  addRule: (rule: AutoApplyRule) => void;
  updateRule: (ruleId: string, updates: Partial<AutoApplyRule>) => void;
  removeRule: (ruleId: string) => void;
  getRulesForMerchant: (merchantId: string) => AutoApplyRule[];
  optimizeRulePriorities: (merchantId: string) => void;

  // Merchant Integration
  addMerchantIntegration: (integration: MerchantIntegration) => void;
  updateMerchantIntegration: (merchantId: string, updates: Partial<MerchantIntegration>) => void;
  getMerchantIntegration: (merchantId: string) => MerchantIntegration | undefined;
  getSupportedMerchants: (category?: MerchantCategory) => MerchantIntegration[];

  // Session Management
  startSession: (merchantId: string) => string;
  endSession: (sessionId: string, success: boolean) => void;
  getActiveSession: (merchantId: string) => AutoApplySession | undefined;

  // Analytics
  getTotalSavings: () => number;
  getSuccessRateOverall: () => number;
  getMostSuccessfulMerchants: (limit: number) => SuccessMetric[];
  getRecentAttempts: (limit: number) => AutoApplyAttempt[];
  getCategoryPerformance: (category: MerchantCategory) => SuccessMetric[];

  // Coupon Selection
  selectBestCoupon: (merchantId: string, cartAmount: number) => string | null;
  getCouponPriorityList: (merchantId: string, cartAmount: number) => string[];
  canStackCoupons: (merchantId: string) => boolean;
  getStackableCoupons: (merchantId: string) => string[][];

  // Utilities
  resetAttemptHistory: () => void;
  exportAnalytics: () => any;
  initializeDefaultRules: () => void;
}

export const useAutoApplyCouponStore = create<AutoApplyCouponStore>((set, get) => ({
  // ==================== INITIAL STATE ====================
  preferences: {
    enabled: true,
    requireConfirmation: false,
    allowedMerchants: [],
    blockedMerchants: [],
    maxApplicationsPerSession: 5,
    autoTryMultipleCoupons: true,
    notifyOnSuccess: true,
    notifyOnFailure: false,
    savingsThreshold: 10, // Minimum ₹10 savings
  },

  rules: [],
  merchantIntegrations: [],
  attemptHistory: [],
  successMetrics: [],
  activeSessions: [],
  stackingRules: [],
  isMonitoring: false,
  currentUrl: null,

  // ==================== AUTO-APPLY CORE ====================

  detectCheckoutPage: (url: string) => {
    const state = get();
    
    for (const integration of state.merchantIntegrations) {
      if (!integration.enabled) continue;
      
      // Check if URL matches any checkout patterns
      for (const checkoutUrl of integration.browserIntegration.checkoutUrls) {
        const pattern = new RegExp(checkoutUrl);
        if (pattern.test(url)) {
          return integration;
        }
      }
    }
    
    return null;
  },

  autoApplyCoupon: async (merchantId: string, cartAmount: number) => {
    const state = get();
    
    // Check preferences
    if (!state.preferences.enabled) {
      throw new Error('Auto-apply is disabled');
    }
    
    if (state.preferences.blockedMerchants.includes(merchantId)) {
      throw new Error('Merchant is blocked');
    }
    
    // Get merchant integration
    const integration = state.getMerchantIntegration(merchantId);
    if (!integration) {
      throw new Error('Merchant not supported');
    }
    
    // Select best coupon
    const couponCode = state.selectBestCoupon(merchantId, cartAmount);
    if (!couponCode) {
      throw new Error('No suitable coupon found');
    }
    
    // Get application rule
    const rules = state.getRulesForMerchant(merchantId);
    const rule = rules.find(r => r.enabled);
    if (!rule) {
      throw new Error('No active rules for merchant');
    }
    
    // Create attempt record
    const attempt: AutoApplyAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      merchantId,
      merchantName: integration.merchantName,
      couponCode,
      couponId: couponCode,
      method: rule.applicationMethod,
      status: 'applying',
      originalPrice: cartAmount,
      finalPrice: cartAmount,
      savings: 0,
      verificationMethod: rule.successVerification,
      attemptDuration: 0,
    };
    
    const startTime = Date.now();
    
    try {
      let success = false;
      
      // Apply based on method
      switch (rule.applicationMethod) {
        case 'code_injection':
          success = await state.applyViaCodeInjection(rule, couponCode);
          break;
        case 'deep_link':
          success = await state.applyViaDeepLink(merchantId, couponCode);
          break;
        case 'api_call':
          success = await state.applyViaPartnerAPI(merchantId, couponCode, cartAmount);
          break;
        default:
          state.applyManually(couponCode);
          attempt.status = 'skipped';
          attempt.errorMessage = 'Manual application required';
      }
      
      attempt.attemptDuration = Date.now() - startTime;
      
      if (success) {
        attempt.status = 'success';
        // Verify and get actual savings
        const verified = await state.verifyApplication(attempt.id);
        if (verified) {
          attempt.finalPrice = cartAmount * 0.9; // Placeholder - should detect actual price
          attempt.savings = attempt.originalPrice - attempt.finalPrice;
        }
      } else {
        attempt.status = 'failed';
        state.handleFallback(attempt);
      }
    } catch (error) {
      attempt.status = 'failed';
      attempt.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      attempt.attemptDuration = Date.now() - startTime;
      state.handleFallback(attempt);
    }
    
    // Record attempt
    state.recordAttempt(attempt);
    
    return attempt;
  },

  tryMultipleCoupons: async (merchantId: string, cartAmount: number) => {
    const state = get();
    const coupons = state.getCouponPriorityList(merchantId, cartAmount);
    const attempts: AutoApplyAttempt[] = [];
    
    let bestAttempt: AutoApplyAttempt | null = null;
    
    for (const couponCode of coupons.slice(0, state.preferences.maxApplicationsPerSession)) {
      try {
        const attempt = await state.autoApplyCoupon(merchantId, cartAmount);
        attempts.push(attempt);
        
        if (attempt.status === 'success') {
          if (!bestAttempt || attempt.savings > bestAttempt.savings) {
            bestAttempt = attempt;
          }
          
          // If savings are great, stop trying
          if (attempt.savings > cartAmount * 0.2) {
            break;
          }
        }
      } catch (error) {
        // Error handled silently in production
      }
    }
    
    return attempts;
  },

  verifyApplication: async (attemptId: string) => {
    // Simulate verification - in real app, would check DOM changes, price differences, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3); // 70% success rate simulation
      }, 1000);
    });
  },

  handleFallback: (attempt: AutoApplyAttempt) => {
    const state = get();
    const rules = state.getRulesForMerchant(attempt.merchantId);
    const rule = rules.find(r => r.applicationMethod === attempt.method);
    
    if (!rule) return;
    
    switch (rule.fallbackStrategy) {
      case 'try_next':
        // Would try next coupon in priority list
        break;
      case 'show_manual':
        state.applyManually(attempt.couponCode);
        break;
      case 'notify_user':
        if (state.preferences.notifyOnFailure) {
          // Notification handled by UI layer
        }
        break;
      case 'skip':
        // Do nothing
        break;
    }
  },

  // ==================== APPLICATION METHODS ====================

  applyViaCodeInjection: async (rule: AutoApplyRule, couponCode: string) => {
    const state = get();
    
    if (!rule.domSelectors.couponInput || !rule.domSelectors.applyButton) {
      return false;
    }
    
    // Inject coupon code
    const injected = await state.injectCouponCode(rule.domSelectors.couponInput, couponCode);
    if (!injected) return false;
    
    // Click apply button
    const clicked = await state.clickApplyButton(rule.domSelectors.applyButton);
    return clicked;
  },

  applyViaDeepLink: async (merchantId: string, couponCode: string) => {
    const state = get();
    const deepLink = state.generateDeepLink(merchantId, couponCode);
    return state.openDeepLink(deepLink);
  },

  applyViaPartnerAPI: async (merchantId: string, couponCode: string, cartAmount: number) => {
    const state = get();
    const integration = state.getMerchantIntegration(merchantId);
    
    if (!integration?.apiIntegration.enabled || !integration.apiIntegration.endpoint) {
      return false;
    }
    
    try {
      // Simulate API call
      const response = await fetch(integration.apiIntegration.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode,
          cartAmount,
          merchantId,
        }),
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  applyManually: (couponCode: string) => {
    // Copy to clipboard and show instruction
  },

  // ==================== BROWSER INTEGRATION ====================

  startDOMMonitoring: () => {
    set({ isMonitoring: true });
    // In real implementation, would start MutationObserver
  },

  stopDOMMonitoring: () => {
    set({ isMonitoring: false });
  },

  injectCouponCode: async (selector: string, code: string) => {
    // Simulate DOM injection
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success
      }, 300);
    });
  },

  clickApplyButton: async (selector: string) => {
    // Simulate button click
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success
      }, 500);
    });
  },

  detectPriceChange: async (selector: string, originalPrice: number) => {
    // Simulate price detection
    return new Promise((resolve) => {
      setTimeout(() => {
        const discount = Math.random() * 0.3; // 0-30% discount
        resolve(originalPrice * (1 - discount));
      }, 1000);
    });
  },

  // ==================== DEEP LINKING ====================

  generateDeepLink: (merchantId: string, couponCode: string, additionalParams = {}) => {
    const integration = get().getMerchantIntegration(merchantId);
    if (!integration?.deepLinkScheme) {
      return '';
    }
    
    const params = new URLSearchParams({
      coupon: couponCode,
      source: 'uma',
      ...additionalParams,
    });
    
    return `${integration.deepLinkScheme}?${params.toString()}`;
  },

  openDeepLink: async (deepLink: string) => {
    // In real app, would use Linking.openURL
    return Promise.resolve(true);
  },

  isAppInstalled: async (packageName: string) => {
    // In real app, would check installed apps
    return Promise.resolve(Math.random() > 0.3);
  },

  // ==================== SUCCESS TRACKING ====================

  recordAttempt: (attempt: AutoApplyAttempt) => {
    set((state) => ({
      attemptHistory: [attempt, ...state.attemptHistory].slice(0, 1000),
    }));
    
    get().updateSuccessMetrics(attempt.merchantId);
  },

  updateSuccessMetrics: (merchantId: string) => {
    const state = get();
    const attempts = state.attemptHistory.filter(a => a.merchantId === merchantId);
    
    if (attempts.length === 0) return;
    
    const successful = attempts.filter(a => a.status === 'success');
    const failed = attempts.filter(a => a.status === 'failed');
    
    // Helper function to get most successful method
    const getMostSuccessfulMethod = (attempts: AutoApplyAttempt[]): ApplicationMethod => {
      const methodCounts: Record<ApplicationMethod, number> = {
        code_injection: 0,
        deep_link: 0,
        qr_display: 0,
        api_call: 0,
        clipboard_copy: 0,
      };
      
      attempts
        .filter(a => a.status === 'success')
        .forEach(a => {
          methodCounts[a.method]++;
        });
      
      return Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0][0] as ApplicationMethod;
    };
    
    // Helper function to get most successful coupon
    const getMostSuccessfulCoupon = (attempts: AutoApplyAttempt[]): string | undefined => {
      const couponCounts: Record<string, number> = {};
      
      attempts
        .filter(a => a.status === 'success')
        .forEach(a => {
          couponCounts[a.couponCode] = (couponCounts[a.couponCode] || 0) + 1;
        });
      
      const sorted = Object.entries(couponCounts).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0];
    };
    
    const metric: SuccessMetric = {
      merchantId,
      merchantName: attempts[0].merchantName,
      totalAttempts: attempts.length,
      successfulAttempts: successful.length,
      failedAttempts: failed.length,
      successRate: successful.length / attempts.length,
      totalSavings: successful.reduce((sum, a) => sum + a.savings, 0),
      averageSavings: successful.length > 0 
        ? successful.reduce((sum, a) => sum + a.savings, 0) / successful.length 
        : 0,
      lastAttempt: attempts[0].timestamp,
      mostSuccessfulMethod: getMostSuccessfulMethod(attempts),
      mostSuccessfulCoupon: getMostSuccessfulCoupon(attempts),
    };
    
    set((state) => ({
      successMetrics: [
        ...state.successMetrics.filter(m => m.merchantId !== merchantId),
        metric,
      ],
    }));
  },

  getSuccessRate: (merchantId: string) => {
    const metric = get().successMetrics.find(m => m.merchantId === merchantId);
    return metric?.successRate || 0;
  },

  getBestPerformingCoupons: (merchantId: string, limit: number) => {
    const attempts = get().attemptHistory
      .filter(a => a.merchantId === merchantId && a.status === 'success')
      .sort((a, b) => b.savings - a.savings)
      .slice(0, limit);
    
    return attempts.map(a => a.couponCode);
  },

  // ==================== PREFERENCES & CONTROLS ====================

  updatePreferences: (preferences: Partial<AutoApplyPreferences>) => {
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    }));
  },

  blockMerchant: (merchantId: string) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        blockedMerchants: [...new Set([...state.preferences.blockedMerchants, merchantId])],
      },
    }));
  },

  unblockMerchant: (merchantId: string) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        blockedMerchants: state.preferences.blockedMerchants.filter(id => id !== merchantId),
      },
    }));
  },

  allowMerchant: (merchantId: string) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        allowedMerchants: [...new Set([...state.preferences.allowedMerchants, merchantId])],
      },
    }));
  },

  toggleAutoApply: (enabled: boolean) => {
    set((state) => ({
      preferences: { ...state.preferences, enabled },
    }));
  },

  // ==================== RULES MANAGEMENT ====================

  addRule: (rule: AutoApplyRule) => {
    set((state) => ({
      rules: [...state.rules, rule],
    }));
  },

  updateRule: (ruleId: string, updates: Partial<AutoApplyRule>) => {
    set((state) => ({
      rules: state.rules.map(r => 
        r.id === ruleId ? { ...r, ...updates, lastUpdated: Date.now() } : r
      ),
    }));
  },

  removeRule: (ruleId: string) => {
    set((state) => ({
      rules: state.rules.filter(r => r.id !== ruleId),
    }));
  },

  getRulesForMerchant: (merchantId: string) => {
    return get().rules
      .filter(r => r.merchantId === merchantId && r.enabled)
      .sort((a, b) => a.couponPriority - b.couponPriority);
  },

  optimizeRulePriorities: (merchantId: string) => {
    const state = get();
    const attempts = state.attemptHistory.filter(a => a.merchantId === merchantId);
    
    // Analyze which methods work best and update priorities
    const methodSuccess: Record<ApplicationMethod, number> = {
      code_injection: 0,
      deep_link: 0,
      qr_display: 0,
      api_call: 0,
      clipboard_copy: 0,
    };
    
    attempts.forEach(a => {
      if (a.status === 'success') {
        methodSuccess[a.method]++;
      }
    });
    
    // Update rule priorities based on success
    const rules = state.getRulesForMerchant(merchantId);
    rules.forEach((rule, index) => {
      const successCount = methodSuccess[rule.applicationMethod];
      const newPriority = successCount > 0 ? 10 - successCount : rule.couponPriority;
      state.updateRule(rule.id, { couponPriority: newPriority });
    });
  },

  // ==================== MERCHANT INTEGRATION ====================

  addMerchantIntegration: (integration: MerchantIntegration) => {
    set((state) => ({
      merchantIntegrations: [...state.merchantIntegrations, integration],
    }));
  },

  updateMerchantIntegration: (merchantId: string, updates: Partial<MerchantIntegration>) => {
    set((state) => ({
      merchantIntegrations: state.merchantIntegrations.map(m =>
        m.id === merchantId ? { ...m, ...updates } : m
      ),
    }));
  },

  getMerchantIntegration: (merchantId: string) => {
    return get().merchantIntegrations.find(m => m.id === merchantId);
  },

  getSupportedMerchants: (category?: MerchantCategory) => {
    const integrations = get().merchantIntegrations.filter(m => m.enabled);
    if (category) {
      return integrations.filter(m => m.category === category);
    }
    return integrations;
  },

  // ==================== SESSION MANAGEMENT ====================

  startSession: (merchantId: string) => {
    const sessionId = `session_${Date.now()}`;
    const session: AutoApplySession = {
      id: sessionId,
      startTime: Date.now(),
      merchantId,
      attempts: [],
      currentStatus: 'pending',
      bestSavings: 0,
    };
    
    set((state) => ({
      activeSessions: [...state.activeSessions, session],
    }));
    
    return sessionId;
  },

  endSession: (sessionId: string, success: boolean) => {
    set((state) => ({
      activeSessions: state.activeSessions.map(s =>
        s.id === sessionId
          ? { ...s, endTime: Date.now(), currentStatus: success ? 'success' : 'failed' }
          : s
      ),
    }));
  },

  getActiveSession: (merchantId: string) => {
    return get().activeSessions.find(s => s.merchantId === merchantId && !s.endTime);
  },

  // ==================== ANALYTICS ====================

  getTotalSavings: () => {
    return get().attemptHistory
      .filter(a => a.status === 'success')
      .reduce((sum, a) => sum + a.savings, 0);
  },

  getSuccessRateOverall: () => {
    const attempts = get().attemptHistory;
    if (attempts.length === 0) return 0;
    
    const successful = attempts.filter(a => a.status === 'success').length;
    return successful / attempts.length;
  },

  getMostSuccessfulMerchants: (limit: number) => {
    return get().successMetrics
      .sort((a, b) => b.totalSavings - a.totalSavings)
      .slice(0, limit);
  },

  getRecentAttempts: (limit: number) => {
    return get().attemptHistory.slice(0, limit);
  },

  getCategoryPerformance: (category: MerchantCategory) => {
    const state = get();
    const merchantIds = state.merchantIntegrations
      .filter(m => m.category === category)
      .map(m => m.id);
    
    return state.successMetrics.filter(m => merchantIds.includes(m.merchantId));
  },

  // ==================== COUPON SELECTION ====================

  selectBestCoupon: (merchantId: string, cartAmount: number) => {
    const coupons = get().getCouponPriorityList(merchantId, cartAmount);
    return coupons[0] || null;
  },

  getCouponPriorityList: (merchantId: string, cartAmount: number) => {
    const state = get();
    const integration = state.getMerchantIntegration(merchantId);
    if (!integration) return [];
    
    // Get coupons and sort by historical success and estimated savings
    const coupons = integration.activeCoupons;
    const performingCoupons = state.getBestPerformingCoupons(merchantId, coupons.length);
    
    // Prioritize historically successful coupons
    const prioritized = [
      ...performingCoupons,
      ...coupons.filter(c => !performingCoupons.includes(c)),
    ];
    
    return prioritized;
  },

  canStackCoupons: (merchantId: string) => {
    const rule = get().stackingRules.find(r => r.merchantId === merchantId);
    return rule?.allowStacking || false;
  },

  getStackableCoupons: (merchantId: string) => {
    const state = get();
    const rule = state.stackingRules.find(r => r.merchantId === merchantId);
    
    if (!rule || !rule.allowStacking) {
      return [];
    }
    
    // Return combinations of compatible coupons
    const combinations: string[][] = [];
    const coupons = state.getMerchantIntegration(merchantId)?.activeCoupons || [];
    
    // Simple 2-coupon combinations based on compatibility rules
    for (let i = 0; i < coupons.length; i++) {
      for (let j = i + 1; j < coupons.length; j++) {
        const compatible = rule.combinationRules.some(
          cr => 
            (cr.coupon1 === coupons[i] && cr.coupon2 === coupons[j] && cr.compatible) ||
            (cr.coupon1 === coupons[j] && cr.coupon2 === coupons[i] && cr.compatible)
        );
        
        if (compatible) {
          combinations.push([coupons[i], coupons[j]]);
        }
      }
    }
    
    return combinations;
  },

  // ==================== UTILITIES ====================

  resetAttemptHistory: () => {
    set({ attemptHistory: [], successMetrics: [] });
  },

  exportAnalytics: () => {
    const state = get();
    return {
      totalSavings: state.getTotalSavings(),
      successRate: state.getSuccessRateOverall(),
      totalAttempts: state.attemptHistory.length,
      merchantMetrics: state.successMetrics,
      recentAttempts: state.getRecentAttempts(50),
      preferences: state.preferences,
    };
  },

  initializeDefaultRules: () => {
    // Will be populated with default merchant integrations
  },
}));
