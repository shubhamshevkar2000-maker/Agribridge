"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const socket_1 = require("./config/socket");
const Auction_1 = require("./models/Auction");
const auction_service_1 = require("./services/auction.service");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io
(0, socket_1.initializeSocket)(server);
// Start server and connect to databases
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        (0, redis_1.connectRedis)();
        server.listen(PORT, () => {
            console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey) {
                console.log(`Groq key loaded: ${groqKey.substring(0, 4)}...${groqKey.substring(groqKey.length - 4)}`);
            }
            else {
                console.log('Groq key NOT loaded');
            }
            const weatherKey = process.env.OPENWEATHER_API_KEY;
            if (weatherKey) {
                console.log(`OpenWeather key loaded: ${weatherKey.substring(0, 4)}...${weatherKey.substring(weatherKey.length - 4)}`);
            }
            else {
                console.log('OpenWeather key NOT loaded');
            }
            // Background Worker to manage auction states
            setInterval(async () => {
                try {
                    const now = new Date();
                    // 1. Transition scheduled auctions to live
                    const scheduledAuctions = await Auction_1.Auction.find({
                        status: 'scheduled',
                        startTime: { $lte: now }
                    });
                    for (const auction of scheduledAuctions) {
                        console.log(`Starting scheduled auction ${auction._id}`);
                        auction.status = 'live';
                        await auction.save();
                    }
                    // 2. Close expired live auctions
                    const expiredAuctions = await Auction_1.Auction.find({
                        status: 'live',
                        endTime: { $lte: now }
                    });
                    for (const auction of expiredAuctions) {
                        console.log(`Closing expired auction ${auction._id}`);
                        await (0, auction_service_1.completeAuction)(auction._id.toString());
                    }
                }
                catch (err) {
                    console.error("Error in auction background worker:", err);
                }
            }, 10000); // Check every 10 seconds
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
