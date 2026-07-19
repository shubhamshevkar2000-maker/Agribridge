import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILoan extends Document {
  farmerId: Types.ObjectId;
  bankId: Types.ObjectId;
  amountRequested: number;
  amountApproved?: number;
  tenure: number; // in months
  interestRate?: number;
  status: 'pending' | 'under_review' | 'approved' | 'disbursed' | 'rejected' | 'repaid' | 'defaulted';
  isDemoAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bankId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountRequested: { type: Number, required: true },
    amountApproved: { type: Number },
    tenure: { type: Number, required: true },
    interestRate: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'disbursed', 'rejected', 'repaid', 'defaulted'],
      default: 'pending',
    },
    isDemoAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

loanSchema.index({ farmerId: 1 });
loanSchema.index({ bankId: 1 });
loanSchema.index({ status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
