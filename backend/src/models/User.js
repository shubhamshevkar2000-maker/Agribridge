"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'logistics', 'bank', 'admin'],
        required: true,
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_submitted'],
        default: 'not_submitted',
    },
    kycDocument: { type: String },
    profileCompletion: { type: Number, default: 0 },
    languages: [{ type: String }],
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
        address: { type: String },
        city: { type: String },
        district: { type: String },
        state: { type: String },
        zipCode: { type: String },
    },
    trustScore: { type: Number, default: 0 },
    creditScore: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    profilePhoto: { type: String },
    farmSize: { type: Number },
    crops: [{ type: String }],
    experience: { type: Number },
    buyerPreferences: { type: String },
    notificationSettings: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    isDemoAccount: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
}, { timestamps: true });
// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ location: '2dsphere' });
exports.User = mongoose_1.default.model('User', userSchema);
