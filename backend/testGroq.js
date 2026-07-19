"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ai_service_1 = require("./src/services/ai.service");
async function test() {
    await mongoose_1.default.connect('mongodb://127.0.0.1:27017/agribridge');
    // clear history for new user
    const newUserId = new mongoose_1.default.Types.ObjectId().toString();
    const response = await (0, ai_service_1.getKrishiSathiResponse)(newUserId, 'What is the price of tomatoes in Nashik?', 'en');
    console.log('Success:', response);
    process.exit(0);
}
test();
