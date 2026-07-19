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
    district?: string;
    state?: string;
    zipCode?: string;
  };
  trustScore?: number;
  creditScore?: number;
  walletBalance?: number;
  profilePhoto?: string;
  farmSize?: number;
  crops?: string[];
  experience?: number;
  buyerPreferences?: string;
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  isDemoAccount?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
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
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ location: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);
