"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const ai_service_1 = require("./src/services/ai.service");
async function testAI() {
    await mongoose_1.default.connect(process.env.MONGO_URI || '');
    try {
        const res = await (0, ai_service_1.getKrishiSathiResponse)('6a56126a798409c2bcef3971', 'What is the price of tomatoes in Nashik?', 'en');
        console.log('Success:', res);
    }
    catch (err) {
        console.error('Test Error:', err);
    }
    finally {
        mongoose_1.default.disconnect();
    }
}
testAI();
