"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai_service_1 = require("./src/services/ai.service");
async function test() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const dummyUserId = new mongoose_1.default.Types.ObjectId().toString();
    console.log('Testing AI for user:', dummyUserId);
    const response = await (0, ai_service_1.getKrishiSathiResponse)(dummyUserId, 'I would like to check crop prices.', 'en');
    console.log('--- AI Response ---');
    console.log(response);
    process.exit(0);
}
test().catch(console.error);
