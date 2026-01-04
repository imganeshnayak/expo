import { Request, Response, NextFunction } from 'express';

/**
 * Performance Monitoring Middleware
 * Tracks request duration, logs slow queries, and provides metrics
 */

interface RequestMetrics {
    method: string;
    path: string;
    duration: number;
    statusCode: number;
    timestamp: Date;
}

// In-memory metrics store (use Redis in production)
const metricsStore: RequestMetrics[] = [];
const MAX_METRICS = 1000;

// Thresholds
const SLOW_REQUEST_MS = 500;
const VERY_SLOW_REQUEST_MS = 2000;

/**
 * Request duration tracking middleware
 */
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime.bigint();
    const startTimestamp = new Date();

    // Capture when response finishes
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const durationNs = Number(endTime - startTime);
        const durationMs = durationNs / 1_000_000;

        const metric: RequestMetrics = {
            method: req.method,
            path: req.route?.path || req.path,
            duration: Math.round(durationMs),
            statusCode: res.statusCode,
            timestamp: startTimestamp,
        };

        // Store metric
        metricsStore.push(metric);
        if (metricsStore.length > MAX_METRICS) {
            metricsStore.shift();
        }

        // Log slow requests
        if (durationMs > VERY_SLOW_REQUEST_MS) {
            console.warn(`🐌 VERY SLOW: ${req.method} ${req.path} - ${Math.round(durationMs)}ms`);
        } else if (durationMs > SLOW_REQUEST_MS) {
            console.log(`🔄 SLOW: ${req.method} ${req.path} - ${Math.round(durationMs)}ms`);
        }
    });

    next();
}

/**
 * Get performance metrics summary
 */
export function getMetricsSummary() {
    if (metricsStore.length === 0) {
        return { message: 'No metrics collected yet' };
    }

    const durations = metricsStore.map(m => m.duration);
    const sorted = [...durations].sort((a, b) => a - b);

    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    // Group by endpoint
    const byEndpoint: Record<string, { count: number; avgDuration: number }> = {};
    for (const m of metricsStore) {
        const key = `${m.method} ${m.path}`;
        if (!byEndpoint[key]) {
            byEndpoint[key] = { count: 0, avgDuration: 0 };
        }
        byEndpoint[key].count++;
        byEndpoint[key].avgDuration =
            (byEndpoint[key].avgDuration * (byEndpoint[key].count - 1) + m.duration) / byEndpoint[key].count;
    }

    // Find slow endpoints
    const slowEndpoints = Object.entries(byEndpoint)
        .filter(([_, stats]) => stats.avgDuration > SLOW_REQUEST_MS)
        .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
        .slice(0, 5);

    // Error rate
    const errors = metricsStore.filter(m => m.statusCode >= 400).length;
    const errorRate = (errors / metricsStore.length) * 100;

    return {
        summary: {
            totalRequests: metricsStore.length,
            avgDurationMs: Math.round(avg),
            p50DurationMs: p50,
            p95DurationMs: p95,
            p99DurationMs: p99,
            errorRate: `${errorRate.toFixed(2)}%`,
        },
        slowEndpoints: slowEndpoints.map(([endpoint, stats]) => ({
            endpoint,
            avgDurationMs: Math.round(stats.avgDuration),
            hitCount: stats.count,
        })),
        recentErrors: metricsStore
            .filter(m => m.statusCode >= 400)
            .slice(-10)
            .map(m => ({
                endpoint: `${m.method} ${m.path}`,
                statusCode: m.statusCode,
                timestamp: m.timestamp,
            })),
    };
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics() {
    metricsStore.length = 0;
}
