/**
 * Production-ready logging utility
 * Only logs in development, silent in production
 * Integrates with crash reporting and analytics
 */

const IS_DEV = __DEV__;

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private crashReporter?: any; // Sentry/LogRocket instance
  private analytics?: any; // Analytics instance

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Initialize crash reporting and analytics
   */
  initialize(config: { crashReporter?: any; analytics?: any }) {
    this.crashReporter = config.crashReporter;
    this.analytics = config.analytics;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext) {
    if (IS_DEV) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - development only
   */
  info(message: string, context?: LogContext) {
    if (IS_DEV) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning logs - sent to crash reporter in production
   */
  warn(message: string, context?: LogContext) {
    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, context || '');
    } else if (this.crashReporter) {
      this.crashReporter.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  /**
   * Error logs - always sent to crash reporter
   */
  error(message: string, error?: Error, context?: LogContext) {
    if (IS_DEV) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }
    
    if (this.crashReporter) {
      this.crashReporter.captureException(error || new Error(message), {
        extra: { ...context, message },
      });
    }
  }

  /**
   * Track user events for analytics
   */
  track(event: string, properties?: Record<string, any>) {
    if (IS_DEV) {
      console.log(`[TRACK] ${event}`, properties || '');
    }
    
    if (this.analytics) {
      this.analytics.track(event, properties);
    }
  }

  /**
   * Set user context for crash reporting
   */
  setUser(userId: string, email?: string, name?: string) {
    if (this.crashReporter) {
      this.crashReporter.setUser({ id: userId, email, name });
    }
    
    if (this.analytics) {
      this.analytics.identify(userId, { email, name });
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  breadcrumb(message: string, data?: Record<string, any>) {
    if (IS_DEV) {
      console.log(`[BREADCRUMB] ${message}`, data || '');
    }
    
    if (this.crashReporter) {
      this.crashReporter.addBreadcrumb({
        message,
        data,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Performance monitoring
   */
  startTransaction(name: string) {
    if (this.crashReporter?.startTransaction) {
      return this.crashReporter.startTransaction({ name });
    }
    return null;
  }

  /**
   * Log API calls
   */
  logAPI(endpoint: string, method: string, status: number, duration: number) {
    const context = { endpoint, method, status, duration };
    
    if (status >= 500) {
      this.error(`API Error: ${method} ${endpoint} - ${status}`, undefined, context);
    } else if (status >= 400) {
      this.warn(`API Warning: ${method} ${endpoint} - ${status}`, context);
    } else if (IS_DEV) {
      console.log(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
    }
  }
}

export const logger = Logger.getInstance();

// Convenience exports
export const logDebug = (msg: string, ctx?: LogContext) => logger.debug(msg, ctx);
export const logInfo = (msg: string, ctx?: LogContext) => logger.info(msg, ctx);
export const logWarn = (msg: string, ctx?: LogContext) => logger.warn(msg, ctx);
export const logError = (msg: string, err?: Error, ctx?: LogContext) => logger.error(msg, err, ctx);
export const trackEvent = (event: string, props?: Record<string, any>) => logger.track(event, props);
