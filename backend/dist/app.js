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
const ondcRetail_1 = __importDefault(require("./routes/ondcRetail"));
const rides_1 = __importDefault(require("./routes/rides"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
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
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/deals', deals_1.default);
app.use('/api/ondc/retail', ondcRetail_1.default);
app.use('/api/rides', rides_1.default);
app.use('/api/loyalty', loyalty_1.default);
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
