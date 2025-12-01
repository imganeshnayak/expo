import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import dealRoutes from './routes/deals';
import ondcRetailRoutes from './routes/ondcRetail';
import rideRoutes from './routes/rides';
import loyaltyRoutes from './routes/loyalty';
// Business App Routes
import merchantAuthRoutes from './routes/business/merchantAuth';
import crmRoutes from './routes/business/crm';
import campaignRoutes from './routes/business/campaigns';
import analyticsRoutes from './routes/business/analytics';
import notificationRoutes from './routes/business/notifications';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Customer App Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/ondc/retail', ondcRetailRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// Business App Routes
app.use('/api/merchant/auth', merchantAuthRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

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
