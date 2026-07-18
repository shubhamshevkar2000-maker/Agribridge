import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: 'farmer' | 'buyer' | 'logistics' | 'bank' | 'admin';
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  kycDocument?: string;
  profileCompletion: number;
  languages: string[];
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  trustScore?: number;
  creditScore?: number;
  walletBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
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
      state: { type: String },
      zipCode: { type: String },
    },
    trustScore: { type: Number, default: 300 },
    creditScore: { type: Number, default: 300 },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ location: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);
