import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKYC extends Document {
  userId: Types.ObjectId;
  aadhaarNumber?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  createdAt: Date;
  updatedAt: Date;
}

const kycSchema = new Schema<IKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    aadhaarNumber: { type: String },
    aadhaarFront: { type: String },
    aadhaarBack: { type: String },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not_submitted'],
      default: 'not_submitted',
    },
  },
  { timestamps: true }
);

kycSchema.index({ userId: 1 });

export const KYC = mongoose.model<IKYC>('KYC', kycSchema);
