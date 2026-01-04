"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const deals_1 = __importDefault(require("./routes/deals"));
const users_1 = __importDefault(require("./routes/users"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
// Business App Routes
const merchantAuth_1 = __importDefault(require("./routes/business/merchantAuth"));
const crm_1 = __importDefault(require("./routes/business/crm"));
const campaigns_1 = __importDefault(require("./routes/business/campaigns"));
const analytics_1 = __importDefault(require("./routes/business/analytics"));
const notifications_1 = __importDefault(require("./routes/business/notifications"));
const pushNotifications_1 = __importDefault(require("./routes/business/pushNotifications"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, database_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        const body = Object.assign({}, req.body);
        if (body.password)
            body.password = '***'; // Hide password
        console.log('📦 Body:', JSON.stringify(body, null, 2));
    }
    next();
});
// Customer App Routes
app.use('/api/auth', auth_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/deals', deals_1.default);
app.use('/api/users', users_1.default);
app.use('/api/loyalty', loyalty_1.default);
// Business App Routes
app.use('/api/merchant/auth', merchantAuth_1.default);
app.use('/api/crm', crm_1.default);
app.use('/api/campaigns', campaigns_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/push-notifications', pushNotifications_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to UMA Backend API',
        status: 'active',
        version: '1.0.0'
    });
});
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
exports.default = app;
