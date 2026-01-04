/**
 * Load Testing Script
 * Run with: npx ts-node src/scripts/load_test.ts
 * 
 * Simulates concurrent users hitting various endpoints
 */

import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

interface TestResult {
    endpoint: string;
    method: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    p95DurationMs: number;
    requestsPerSecond: number;
}

interface EndpointConfig {
    method: 'GET' | 'POST';
    path: string;
    body?: object;
    headers?: Record<string, string>;
}

const ENDPOINTS: EndpointConfig[] = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/' },
    { method: 'POST', path: '/api/auth/login', body: { email: 'test@test.com', password: 'test123' } },
];

async function makeRequest(endpoint: EndpointConfig): Promise<{ duration: number; success: boolean }> {
    const start = performance.now();

    try {
        if (endpoint.method === 'GET') {
            await axios.get(`${BASE_URL}${endpoint.path}`, {
                timeout: 10000,
                validateStatus: () => true, // Don't throw on error status
            });
        } else {
            await axios.post(`${BASE_URL}${endpoint.path}`, endpoint.body, {
                timeout: 10000,
                validateStatus: () => true,
                headers: endpoint.headers,
            });
        }

        return { duration: performance.now() - start, success: true };
    } catch (error) {
        return { duration: performance.now() - start, success: false };
    }
}

async function runLoadTest(
    endpoint: EndpointConfig,
    concurrency: number,
    totalRequests: number
): Promise<TestResult> {
    const durations: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const startTime = performance.now();

    // Run in batches of concurrency
    for (let i = 0; i < totalRequests; i += concurrency) {
        const batch = Math.min(concurrency, totalRequests - i);
        const promises = Array(batch).fill(null).map(() => makeRequest(endpoint));
        const results = await Promise.all(promises);

        for (const result of results) {
            durations.push(result.duration);
            if (result.success) successCount++;
            else failCount++;
        }

        // Progress
        process.stdout.write(`\r  Progress: ${i + batch}/${totalRequests}`);
    }

    const totalTime = (performance.now() - startTime) / 1000; // seconds
    console.log(''); // New line

    const sorted = [...durations].sort((a, b) => a - b);

    return {
        endpoint: endpoint.path,
        method: endpoint.method,
        totalRequests,
        successfulRequests: successCount,
        failedRequests: failCount,
        avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        minDurationMs: Math.round(sorted[0] || 0),
        maxDurationMs: Math.round(sorted[sorted.length - 1] || 0),
        p95DurationMs: Math.round(sorted[Math.floor(sorted.length * 0.95)] || 0),
        requestsPerSecond: Math.round(totalRequests / totalTime),
    };
}

async function main() {
    console.log('🚀 Starting Load Test');
    console.log(`📍 Target: ${BASE_URL}`);
    console.log('');

    const CONCURRENCY = 10;
    const REQUESTS_PER_ENDPOINT = 100;

    const results: TestResult[] = [];

    for (const endpoint of ENDPOINTS) {
        console.log(`\n📊 Testing: ${endpoint.method} ${endpoint.path}`);
        const result = await runLoadTest(endpoint, CONCURRENCY, REQUESTS_PER_ENDPOINT);
        results.push(result);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 LOAD TEST RESULTS');
    console.log('='.repeat(60));

    for (const result of results) {
        console.log(`\n${result.method} ${result.endpoint}`);
        console.log(`  Total:    ${result.totalRequests} requests`);
        console.log(`  Success:  ${result.successfulRequests} (${Math.round(result.successfulRequests / result.totalRequests * 100)}%)`);
        console.log(`  Failed:   ${result.failedRequests}`);
        console.log(`  Avg:      ${result.avgDurationMs}ms`);
        console.log(`  Min:      ${result.minDurationMs}ms`);
        console.log(`  Max:      ${result.maxDurationMs}ms`);
        console.log(`  P95:      ${result.p95DurationMs}ms`);
        console.log(`  RPS:      ${result.requestsPerSecond}/s`);
    }

    // Check server metrics
    console.log('\n' + '='.repeat(60));
    console.log('📊 SERVER METRICS');
    console.log('='.repeat(60));

    try {
        const metricsRes = await axios.get(`${BASE_URL}/metrics`);
        console.log(JSON.stringify(metricsRes.data, null, 2));
    } catch (e) {
        console.log('Could not fetch server metrics');
    }
}

main().catch(console.error);
