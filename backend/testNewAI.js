"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ai_service_1 = require("./src/services/ai.service");
const AiInteraction_1 = require("./src/models/AiInteraction");
async function test() {
    await mongoose_1.default.connect('mongodb://localhost:27017/agribridge');
    // delete history for this dummy user
    await AiInteraction_1.AiInteraction.deleteMany({ userId: '6a56126a798409c2bcef3971' });
    const response = await (0, ai_service_1.getKrishiSathiResponse)('6a56126a798409c2bcef3971', 'What is the price of potatoes in Mumbai?', 'en');
    console.log('Success:', response);
    process.exit(0);
}
test();
