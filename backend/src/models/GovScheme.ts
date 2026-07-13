import mongoose, { Schema, Document } from 'mongoose';

export interface IGovScheme extends Document {
  name: string;
  eligibilityCriteria: string;
  description: string;
  applyLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const govSchemeSchema = new Schema<IGovScheme>(
  {
    name: { type: String, required: true },
    eligibilityCriteria: { type: String, required: true },
    description: { type: String, required: true },
    applyLink: { type: String, required: true },
  },
  { timestamps: true }
);

export const GovScheme = mongoose.model<IGovScheme>('GovScheme', govSchemeSchema);
