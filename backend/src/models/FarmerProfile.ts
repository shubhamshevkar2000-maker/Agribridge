import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFarmerProfile extends Document {
  userId: Types.ObjectId;
  farmName: string;
  farmSize: number;
  primaryCrops: string[];
  bankAccountDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  documents: {
    type: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const farmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmName: { type: String, required: true },
    farmSize: { type: Number, required: true },
    primaryCrops: [{ type: String }],
    bankAccountDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
    },
    documents: [
      {
        type: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', farmerProfileSchema);
