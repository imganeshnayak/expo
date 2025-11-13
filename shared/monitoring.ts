/**
 * Production Monitoring & Analytics Integration
 * Sentry, PostHog, Performance Monitoring
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// ==================== SENTRY CONFIGURATION ====================

export const initializeSentry = () => {
  if (!__DEV__) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || '1.0'),
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      
      // Performance monitoring
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', /^\//, /^https:\/\//],
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],
      
      // Filtering
      beforeSend: (event, hint) => {
        // Don't send events in development
        if (__DEV__) return null;
        
        // Filter out network errors
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null;
        }
        
        return event;
      },
    });
  }
};

/**
 * Set user context for crash reporting
 */
export const setUserContext = (userId: string, email?: string, username?: string) => {
  if (!__DEV__) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (!__DEV__) {
    Sentry.setUser(null);
  }
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
) => {
  if (!__DEV__) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('[ERROR]', error, context);
  }
};

/**
 * Capture message (for warnings)
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  if (!__DEV__) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'custom',
  data?: Record<string, any>
) => {
  if (!__DEV__) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }
};

// ==================== ANALYTICS (POSTHOG/MIXPANEL) ====================

interface AnalyticsConfig {
  userId?: string;
  email?: string;
  name?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private posthog: any;
  private mixpanel: any;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized || __DEV__) return;

    try {
      // Initialize PostHog
      const PostHog = require('posthog-react-native').default;
      this.posthog = await PostHog.initAsync(
        process.env.POSTHOG_API_KEY || '',
        {
          host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
        }
      );

      // Initialize Mixpanel (alternative)
      if (process.env.MIXPANEL_TOKEN) {
        const { Mixpanel } = require('mixpanel-react-native');
        this.mixpanel = await Mixpanel.init(process.env.MIXPANEL_TOKEN);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  /**
   * Identify user
   */
  identify(config: AnalyticsConfig) {
    if (!this.isInitialized || !config.userId) return;

    try {
      if (this.posthog) {
        this.posthog.identify(config.userId, config.properties);
      }

      if (this.mixpanel) {
        this.mixpanel.identify(config.userId);
        if (config.properties) {
          this.mixpanel.getPeople().set(config.properties);
        }
      }
    } catch (error) {
      console.error('Analytics identify failed:', error);
    }
  }

  /**
   * Track event
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      if (this.posthog) {
        this.posthog.capture(event, properties);
      }

      if (this.mixpanel) {
        this.mixpanel.track(event, properties);
      }
    } catch (error) {
      console.error('Analytics track failed:', error);
    }

    // Also add as breadcrumb for debugging
    addBreadcrumb(event, 'analytics', properties);
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      if (this.posthog) {
        this.posthog.setPersonProperties(properties);
      }

      if (this.mixpanel) {
        this.mixpanel.getPeople().set(properties);
      }
    } catch (error) {
      console.error('Set user properties failed:', error);
    }
  }

  /**
   * Reset analytics on logout
   */
  reset() {
    if (!this.isInitialized) return;

    try {
      if (this.posthog) {
        this.posthog.reset();
      }

      if (this.mixpanel) {
        this.mixpanel.reset();
      }
    } catch (error) {
      console.error('Analytics reset failed:', error);
    }
  }
}

export const analytics = new Analytics();

// ==================== PERFORMANCE MONITORING ====================

interface PerformanceMetric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private transactions = new Map<string, any>();

  /**
   * Start performance transaction
   */
  startTransaction(name: string): string {
    if (__DEV__) {
      const transactionId = `${name}_${Date.now()}`;
      this.transactions.set(transactionId, {
        name,
        startTime: performance.now(),
      });
      return transactionId;
    }

    if (Sentry.startTransaction) {
      const transaction = Sentry.startTransaction({ name });
      const transactionId = transaction.traceId;
      this.transactions.set(transactionId, transaction);
      return transactionId;
    }

    return '';
  }

  /**
   * Finish performance transaction
   */
  finishTransaction(transactionId: string) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    if (__DEV__) {
      const duration = performance.now() - transaction.startTime;
      console.log(`[PERF] ${transaction.name}: ${duration.toFixed(2)}ms`);
    } else {
      transaction.finish?.();
    }

    this.transactions.delete(transactionId);
  }

  /**
   * Record metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Send to analytics
    analytics.track('performance_metric', {
      metric_name: metric.name,
      metric_value: metric.value,
      ...metric.metadata,
    });

    // In development, log to console
    if (__DEV__) {
      console.log(`[METRIC] ${metric.name}: ${metric.value}`, metric.metadata);
    }
  }

  /**
   * Get app startup time
   */
  measureStartupTime() {
    const startupTime = Date.now() - (global as any).__APP_START_TIME__;
    this.recordMetric({
      name: 'app_startup_time',
      value: startupTime,
    });
  }

  /**
   * Measure screen render time
   */
  measureScreenRender(screenName: string, renderTime: number) {
    this.recordMetric({
      name: 'screen_render_time',
      value: renderTime,
      metadata: { screen: screenName },
    });
  }

  /**
   * Measure API call performance
   */
  measureAPICall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ) {
    this.recordMetric({
      name: 'api_call_duration',
      value: duration,
      metadata: {
        endpoint,
        method,
        status_code: statusCode,
      },
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ==================== BUSINESS METRICS ====================

export const trackBusinessMetric = (
  metricName: string,
  value: number,
  metadata?: Record<string, any>
) => {
  analytics.track(metricName, {
    value,
    ...metadata,
  });
};

/**
 * Track revenue event
 */
export const trackRevenue = (
  amount: number,
  currency: string = 'INR',
  metadata?: Record<string, any>
) => {
  trackBusinessMetric('revenue', amount, {
    currency,
    ...metadata,
  });
};

/**
 * Track conversion event
 */
export const trackConversion = (
  conversionType: string,
  value?: number,
  metadata?: Record<string, any>
) => {
  analytics.track('conversion', {
    conversion_type: conversionType,
    value,
    ...metadata,
  });
};

/**
 * Track user engagement
 */
export const trackEngagement = (
  action: string,
  duration?: number,
  metadata?: Record<string, any>
) => {
  analytics.track('user_engagement', {
    action,
    duration,
    ...metadata,
  });
};

// ==================== INITIALIZATION ====================

/**
 * Initialize all monitoring services
 */
export const initializeMonitoring = async () => {
  // Set app start time for startup measurement
  if (!(global as any).__APP_START_TIME__) {
    (global as any).__APP_START_TIME__ = Date.now();
  }

  // Initialize Sentry
  initializeSentry();

  // Initialize Analytics
  await analytics.initialize();

  // Measure startup time
  setTimeout(() => {
    performanceMonitor.measureStartupTime();
  }, 0);

  console.log('✅ Monitoring initialized');
};

// ==================== COMMON EVENTS ====================

export const CommonEvents = {
  // User actions
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Ride actions
  RIDE_SEARCHED: 'ride_searched',
  RIDE_BOOKED: 'ride_booked',
  RIDE_COMPLETED: 'ride_completed',
  RIDE_CANCELLED: 'ride_cancelled',
  
  // Coupon actions
  COUPON_DISCOVERED: 'coupon_discovered',
  COUPON_APPLIED: 'coupon_applied',
  COUPON_AUTO_APPLIED: 'coupon_auto_applied',
  COUPON_FAILED: 'coupon_failed',
  
  // Loyalty actions
  QR_CODE_SCANNED: 'qr_code_scanned',
  STAMPS_EARNED: 'stamps_earned',
  REWARD_REDEEMED: 'reward_redeemed',
  
  // Business actions
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_ACTIVATED: 'campaign_activated',
  CUSTOMER_ADDED: 'customer_added',
  
  // Payment actions
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  
  // Social actions
  DEAL_SHARED: 'deal_shared',
  FRIEND_INVITED: 'friend_invited',
  GROUP_JOINED: 'group_joined',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  CRASH: 'app_crashed',
};
