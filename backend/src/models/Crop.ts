import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICrop extends Document {
  farmerId: Types.ObjectId;
  name: string;
  category: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  images: string[];
  qualityGrade?: string;
  harvestDate?: Date;
  description?: string;
  status: 'draft' | 'listed' | 'in_auction' | 'sold' | 'expired';
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
    city?: string;
    district?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  },
  { timestamps: true }
);

cropSchema.index({ farmerId: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ location: '2dsphere' });

export const Crop = mongoose.model<ICrop>('Crop', cropSchema);
