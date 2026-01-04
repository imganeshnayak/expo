import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { performanceMiddleware, getMetricsSummary } from './middleware/performance';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import dealRoutes from './routes/deals';
import userRoutes from './routes/users';
import friendRoutes from './routes/friends';
import socialRoutes from './routes/social';
import referralRoutes from './routes/referrals';
import groupRoutes from './routes/groups';
import leaderboardRoutes from './routes/leaderboard';
import archetypeRoutes from './routes/archetype';
import gameRoutes from './routes/game';

import loyaltyRoutes from './routes/loyalty';
// Business App Routes
import merchantAuthRoutes from './routes/business/merchantAuth';
import crmRoutes from './routes/business/crm';
import campaignRoutes from './routes/business/campaigns';
import analyticsRoutes from './routes/business/analytics';
import notificationRoutes from './routes/business/notifications';
import pushNotificationRoutes from './routes/business/pushNotifications';
import uploadRoutes from './routes/uploadRoutes';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Whitelist allowed origins
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:8081',
            'http://localhost:3000',
        ];

        if (allowedOrigins.some(allowed => origin.startsWith(allowed.trim()))) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate Limiters
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_GENERAL || '1000'),
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_AUTH || '20'),
    message: { error: 'Too many auth attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve Unity WebGL BEFORE helmet (no CSP blocking)
app.use('/unity', express.static('public/unity', {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        if (path.endsWith('.unityweb')) {
            res.setHeader('Content-Encoding', 'gzip');
            if (path.includes('.data.')) {
                res.setHeader('Content-Type', 'application/octet-stream');
            } else if (path.includes('.wasm.')) {
                res.setHeader('Content-Type', 'application/wasm');
            } else if (path.includes('.framework.js.') || path.includes('.loader.')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
        }
    }
}));

// Security Middleware (after Unity to avoid CSP issues)
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for WebGL compatibility
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);
app.use(performanceMiddleware);

// Request logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        const body = { ...req.body };
        if (body.password) body.password = '***'; // Hide password
        console.log('📦 Body:', JSON.stringify(body, null, 2));
    }
    next();
});

// Customer App Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/archetype', archetypeRoutes);

app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/game', gameRoutes);

// Business App Routes
app.use('/api/merchant/auth', merchantAuthRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to UMA Backend API',
        status: 'active',
        version: '1.0.0'
    });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Performance metrics (protect in production)
app.get('/metrics', (req: Request, res: Response) => {
    // Optional: Add auth check for production
    // if (process.env.NODE_ENV === 'production' && !req.headers['x-metrics-key']) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }
    res.json(getMetricsSummary());
});

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global Error Handler - Must be last middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

    // Don't leak stack traces in production
    const isDev = process.env.NODE_ENV === 'development';

    // Handle specific error types
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: isDev ? err.message : 'Something went wrong',
        ...(isDev && { stack: err.stack }),
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

export default app;
