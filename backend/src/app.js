"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || '*' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        error: 'Too many requests'
    }
});
app.use(limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AgriBridge API is running' });
});
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const weather_routes_1 = __importDefault(require("./routes/weather.routes"));
const crop_routes_1 = __importDefault(require("./routes/crop.routes"));
const auction_routes_1 = __importDefault(require("./routes/auction.routes"));
const credit_routes_1 = __importDefault(require("./routes/credit.routes"));
const loan_routes_1 = __importDefault(require("./routes/loan.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/weather', weather_routes_1.default);
app.use('/api/crops', crop_routes_1.default);
app.use('/api/auctions', auction_routes_1.default);
app.use('/api/credit', credit_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/deliveries', delivery_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
// Global error handling middleware to ensure JSON is always returned
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: err.toString()
    });
});
exports.default = app;
