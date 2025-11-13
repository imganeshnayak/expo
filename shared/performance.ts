/**
 * Performance Optimization Utilities
 * React.memo, useMemo, useCallback helpers
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

// ==================== DEBOUNCE & THROTTLE ====================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ==================== HOOKS ====================

/**
 * useDebounce - Debounce a value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useThrottle - Throttle a value
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * usePrevious - Get previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * useInteraction - Run callback after interactions complete
 * Improves perceived performance for non-critical operations
 */
export const useInteraction = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(callback);
    return () => handle.cancel();
  }, deps);
};

/**
 * useMemoCompare - useMemo with custom comparison
 */
export const useMemoCompare = <T>(
  next: T,
  compare: (prev: T | undefined, next: T) => boolean
): T => {
  const previousRef = useRef<T>();
  const previous = previousRef.current;

  const isEqual = compare(previous, next);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });

  return isEqual ? (previous as T) : next;
};

// ==================== MEMOIZATION HELPERS ====================

/**
 * Deep comparison for objects
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Shallow comparison for objects
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

// ==================== ARRAY HELPERS ====================

/**
 * Chunk array into smaller arrays
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Remove duplicates from array
 */
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ==================== LAZY LOADING ====================

/**
 * Lazy load component after delay
 */
export const lazyWithDelay = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  delay: number = 0
): React.LazyExoticComponent<T> => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        factory().then(resolve);
      }, delay);
    });
  });
};

/**
 * Preload lazy component
 */
export const preloadLazy = <T extends React.ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>
) => {
  const Component = LazyComponent as any;
  if (Component._payload && Component._payload._result == null) {
    Component._payload._result;
  }
};

// ==================== IMAGE OPTIMIZATION ====================

/**
 * Get optimized image size
 */
export const getOptimizedImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

/**
 * Generate image srcset for different resolutions
 */
export const generateImageSrcSet = (
  baseUrl: string,
  sizes: number[]
): string => {
  return sizes
    .map((size) => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

// ==================== PERFORMANCE MONITORING ====================

/**
 * Measure component render time
 */
export const measureRender = (componentName: string) => {
  if (!__DEV__) return;
  
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16.67) {  // Slower than 60fps
      console.warn(
        `[PERF] ${componentName} render took ${duration.toFixed(2)}ms (>16.67ms)`
      );
    }
  };
};

/**
 * Track expensive calculations
 */
export const trackCalculation = (label: string, fn: () => any) => {
  if (!__DEV__) return fn();
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[CALC] ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
};

// ==================== CACHE ====================

class SimpleCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const createCache = <K, V>(maxSize?: number) => {
  return new SimpleCache<K, V>(maxSize);
};

// ==================== MEMOIZE FUNCTION ====================

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getCacheKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getCacheKey
      ? getCacheKey(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// React import
import * as React from 'react';
