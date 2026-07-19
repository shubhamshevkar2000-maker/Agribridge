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
exports.Crop = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const cropSchema = new mongoose_1.Schema({
    farmerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    variety: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    isOrganic: { type: Boolean, default: false },
    images: [{ type: String }],
    qualityGrade: { type: String },
    harvestDate: { type: Date },
    description: { type: String },
    status: {
        type: String,
        enum: ['draft', 'listed', 'in_auction', 'sold', 'expired'],
        default: 'draft',
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: { type: String },
        city: { type: String },
        district: { type: String },
        state: { type: String },
        zipCode: { type: String },
    },
    isDemoAccount: { type: Boolean, default: false },
}, { timestamps: true });
cropSchema.index({ farmerId: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ location: '2dsphere' });
exports.Crop = mongoose_1.default.model('Crop', cropSchema);
