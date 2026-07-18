import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBankDetails extends Document {
  userId: Types.ObjectId;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  accountHolderName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bankDetailsSchema = new Schema<IBankDetails>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },
  },
  { timestamps: true }
);

bankDetailsSchema.index({ userId: 1 });

export const BankDetails = mongoose.model<IBankDetails>('BankDetails', bankDetailsSchema);
