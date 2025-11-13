/**
 * Example Unit Tests for Auto-Apply Coupon Store
 * Demonstrates testing approach for Zustand stores
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useAutoApplyCouponStore } from '../store/autoApplyCouponStore';
import { testStore, mockAPI, waitForState, cleanup } from '@/shared/testUtils';

describe('AutoApplyCouponStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAutoApplyCouponStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Merchant Integration Management', () => {
    it('should add merchant integration successfully', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.addIntegration({
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          logo: 'https://...',
          supportedMethods: ['api', 'deep_link'],
          deepLinkScheme: 'swiggy://',
          isActive: true,
        });
      });

      expect(result.current.integrations).toHaveLength(1);
      expect(result.current.integrations[0].merchantId).toBe('swiggy');
      expect(result.current.integrations[0].isActive).toBe(true);
    });

    it('should update merchant integration', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      // Add integration first
      act(() => {
        result.current.addIntegration({
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          logo: 'https://...',
          supportedMethods: ['api'],
          isActive: true,
        });
      });

      // Update it
      act(() => {
        result.current.updateIntegration('swiggy', {
          isActive: false,
        });
      });

      expect(result.current.integrations[0].isActive).toBe(false);
    });

    it('should remove merchant integration', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.addIntegration({
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          logo: 'https://...',
          supportedMethods: ['api'],
          isActive: true,
        });
      });

      expect(result.current.integrations).toHaveLength(1);

      act(() => {
        result.current.removeIntegration('swiggy');
      });

      expect(result.current.integrations).toHaveLength(0);
    });
  });

  describe('Auto-Apply Rules', () => {
    it('should add auto-apply rule', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.addRule({
          id: 'rule_1',
          merchantId: 'swiggy',
          priority: 1,
          applicationMethod: 'api',
          isEnabled: true,
          conditions: {
            minCartValue: 300,
          },
        });
      });

      expect(result.current.rules).toHaveLength(1);
      expect(result.current.rules[0].merchantId).toBe('swiggy');
    });

    it('should get rules for specific merchant', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.addRule({
          id: 'rule_1',
          merchantId: 'swiggy',
          priority: 1,
          applicationMethod: 'api',
          isEnabled: true,
        });

        result.current.addRule({
          id: 'rule_2',
          merchantId: 'zomato',
          priority: 1,
          applicationMethod: 'api',
          isEnabled: true,
        });
      });

      const swiggyRules = result.current.getRulesForMerchant('swiggy');
      expect(swiggyRules).toHaveLength(1);
      expect(swiggyRules[0].merchantId).toBe('swiggy');
    });

    it('should toggle rule enabled state', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.addRule({
          id: 'rule_1',
          merchantId: 'swiggy',
          priority: 1,
          applicationMethod: 'api',
          isEnabled: true,
        });
      });

      expect(result.current.rules[0].isEnabled).toBe(true);

      act(() => {
        result.current.toggleRule('rule_1');
      });

      expect(result.current.rules[0].isEnabled).toBe(false);
    });
  });

  describe('Coupon Attempt History', () => {
    it('should record successful coupon attempt', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      const attempt = {
        id: 'attempt_1',
        merchantId: 'swiggy',
        merchantName: 'Swiggy',
        couponCode: 'SWIGGY50',
        status: 'success' as const,
        savings: 50,
        originalPrice: 500,
        method: 'api' as const,
        timestamp: Date.now(),
      };

      act(() => {
        result.current.recordAttempt(attempt);
      });

      expect(result.current.attemptHistory).toHaveLength(1);
      expect(result.current.attemptHistory[0].status).toBe('success');
      expect(result.current.attemptHistory[0].savings).toBe(50);
    });

    it('should limit attempt history to 1000 items', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        // Add 1500 attempts
        for (let i = 0; i < 1500; i++) {
          result.current.recordAttempt({
            id: `attempt_${i}`,
            merchantId: 'swiggy',
            merchantName: 'Swiggy',
            couponCode: 'TEST',
            status: 'success' as const,
            savings: 10,
            originalPrice: 100,
            method: 'api' as const,
            timestamp: Date.now() - i,
          });
        }
      });

      expect(result.current.attemptHistory).toHaveLength(1000);
    });

    it('should calculate total savings correctly', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.recordAttempt({
          id: 'attempt_1',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'TEST1',
          status: 'success' as const,
          savings: 50,
          originalPrice: 500,
          method: 'api' as const,
          timestamp: Date.now(),
        });

        result.current.recordAttempt({
          id: 'attempt_2',
          merchantId: 'zomato',
          merchantName: 'Zomato',
          couponCode: 'TEST2',
          status: 'success' as const,
          savings: 30,
          originalPrice: 300,
          method: 'api' as const,
          timestamp: Date.now(),
        });
      });

      const totalSavings = result.current.attemptHistory
        .filter(a => a.status === 'success')
        .reduce((sum, a) => sum + a.savings, 0);

      expect(totalSavings).toBe(80);
    });
  });

  describe('Stacking Rules', () => {
    it('should allow stacking when rule permits', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.stackingRules.push({
          merchantId: 'swiggy',
          allowStacking: true,
          maxStackable: 2,
          priorityOrder: ['SWIGGY50', 'WELCOME10'],
        });
      });

      const canStack = result.current.canStackCoupons('swiggy');
      expect(canStack).toBe(true);
    });

    it('should respect max stackable limit', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.stackingRules.push({
          merchantId: 'swiggy',
          allowStacking: true,
          maxStackable: 2,
          priorityOrder: ['A', 'B', 'C'],
        });
      });

      const stackingRule = result.current.stackingRules[0];
      expect(stackingRule.maxStackable).toBe(2);
      
      // Can only stack top 2 coupons
      const applicableCoupons = stackingRule.priorityOrder.slice(0, stackingRule.maxStackable);
      expect(applicableCoupons).toHaveLength(2);
      expect(applicableCoupons).toEqual(['A', 'B']);
    });
  });

  describe('User Preferences', () => {
    it('should update user preferences', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.updatePreferences({
          autoApplyEnabled: false,
          showNotifications: false,
        });
      });

      expect(result.current.preferences.autoApplyEnabled).toBe(false);
      expect(result.current.preferences.showNotifications).toBe(false);
    });

    it('should respect auto-apply enabled preference', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        result.current.updatePreferences({
          autoApplyEnabled: false,
        });
      });

      // When auto-apply is disabled, should not attempt
      const shouldAttempt = result.current.preferences.autoApplyEnabled;
      expect(shouldAttempt).toBe(false);
    });
  });

  describe('Success Metrics', () => {
    it('should calculate success rate correctly', () => {
      const { result } = renderHook(() => useAutoApplyCouponStore());

      act(() => {
        // 3 successful, 2 failed attempts
        result.current.recordAttempt({
          id: '1',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'A',
          status: 'success' as const,
          savings: 50,
          originalPrice: 500,
          method: 'api' as const,
          timestamp: Date.now(),
        });

        result.current.recordAttempt({
          id: '2',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'B',
          status: 'success' as const,
          savings: 30,
          originalPrice: 300,
          method: 'api' as const,
          timestamp: Date.now(),
        });

        result.current.recordAttempt({
          id: '3',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'C',
          status: 'success' as const,
          savings: 20,
          originalPrice: 200,
          method: 'api' as const,
          timestamp: Date.now(),
        });

        result.current.recordAttempt({
          id: '4',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'D',
          status: 'failed' as const,
          savings: 0,
          originalPrice: 100,
          method: 'api' as const,
          timestamp: Date.now(),
        });

        result.current.recordAttempt({
          id: '5',
          merchantId: 'swiggy',
          merchantName: 'Swiggy',
          couponCode: 'E',
          status: 'failed' as const,
          savings: 0,
          originalPrice: 100,
          method: 'api' as const,
          timestamp: Date.now(),
        });
      });

      const swiggyAttempts = result.current.attemptHistory.filter(
        a => a.merchantId === 'swiggy'
      );
      const successCount = swiggyAttempts.filter(a => a.status === 'success').length;
      const successRate = (successCount / swiggyAttempts.length) * 100;

      expect(successRate).toBe(60); // 3/5 = 60%
    });
  });
});
