/**
 * PRODUCTION BUILD CONFIGURATION
 * 
 * This file removes all development artifacts for production builds
 */

// Transform console.log calls to no-ops in production
if (!__DEV__) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
  // Keep console.error for critical issues that should be logged
}

// Disable development-only features
export const IS_PRODUCTION = !__DEV__;
export const IS_DEVELOPMENT = __DEV__;

// Feature flags for production
export const PRODUCTION_CONFIG = {
  // Logging
  enableConsoleLogs: IS_DEVELOPMENT,
  enableDebugLogs: IS_DEVELOPMENT,
  enablePerformanceLogs: IS_DEVELOPMENT,
  
  // Analytics
  enableAnalytics: IS_PRODUCTION,
  enableCrashReporting: IS_PRODUCTION,
  enablePerformanceMonitoring: IS_PRODUCTION,
  
  // Development tools
  enableReduxDevTools: IS_DEVELOPMENT,
  enableReactDevTools: IS_DEVELOPMENT,
  enableNetworkInspector: IS_DEVELOPMENT,
  
  // API
  apiTimeout: IS_PRODUCTION ? 30000 : 60000,
  maxRetries: IS_PRODUCTION ? 3 : 1,
  
  // Cache
  enableCache: true,
  cacheTimeout: IS_PRODUCTION ? 300000 : 60000, // 5 min vs 1 min
  
  // Performance
  enableImageOptimization: IS_PRODUCTION,
  enableCodeSplitting: IS_PRODUCTION,
  enableLazyLoading: IS_PRODUCTION,
};

// Error handling
export const handleProductionError = (error: Error, context?: Record<string, any>) => {
  if (IS_PRODUCTION) {
    // Send to crash reporter (Sentry, etc.)
    // CrashReporter.captureException(error, { extra: context });
  } else {
    console.error('[ERROR]', error, context);
  }
};

// Performance monitoring
export const measurePerformance = (label: string, fn: () => void) => {
  if (IS_DEVELOPMENT) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};
