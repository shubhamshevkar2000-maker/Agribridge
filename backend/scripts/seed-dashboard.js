"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const seed_service_1 = require("../src/services/seed.service");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI is required in .env');
    process.exit(1);
}
const run = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        await (0, seed_service_1.seedDemoData)();
        console.log('Seed completed successfully!');
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};
run();
