import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICrop extends Document {
  farmerId: Types.ObjectId;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  images: string[];
  qualityGrade?: string;
  harvestDate?: Date;
  status: 'listed' | 'in_auction' | 'sold' | 'expired';
  location?: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    isOrganic: { type: Boolean, default: false },
    images: [{ type: String }],
    qualityGrade: { type: String },
    harvestDate: { type: Date },
    status: {
      type: String,
      enum: ['listed', 'in_auction', 'sold', 'expired'],
      default: 'listed',
    },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true }
);

cropSchema.index({ farmerId: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ location: '2dsphere' });

export const Crop = mongoose.model<ICrop>('Crop', cropSchema);
