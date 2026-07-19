"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("./src/models/User");
const Crop_1 = require("./src/models/Crop");
dotenv_1.default.config();
async function run() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const farmer = await User_1.User.findOne({ role: 'farmer' });
    if (!farmer)
        throw new Error('No farmer found');
    let crop = await Crop_1.Crop.findOne({ farmerId: farmer._id, status: 'listed' });
    if (!crop) {
        crop = await Crop_1.Crop.create({
            farmerId: farmer._id,
            name: 'Wheat',
            category: 'cereal',
            quantity: 100,
            unit: 'kg',
            pricePerUnit: 200,
            status: 'listed'
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: farmer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const payload = {
        cropId: crop._id.toString(),
        startingBid: 1000,
        minIncrement: 100,
        reservePrice: 1500,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        quantity: 10,
        notes: 'Test auction'
    };
    console.log('Sending POST /api/auctions', payload);
    const res = await fetch('http://localhost:5000/api/auctions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
    process.exit(0);
}
run().catch(console.error);
