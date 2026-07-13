import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICreditLedger extends Document {
  farmerId: Types.ObjectId;
  trustScore: number;
  creditScore: number;
  factors: {
    repaymentHistory: number;
    transactionConsistency: number;
    disputeRate: number;
    incomeStability: number;
  };
  history: {
    date: Date;
    score: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const creditLedgerSchema = new Schema<ICreditLedger>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    trustScore: { type: Number, default: 0 },
    creditScore: { type: Number, default: 0 },
    factors: {
      repaymentHistory: { type: Number, default: 0 },
      transactionConsistency: { type: Number, default: 0 },
      disputeRate: { type: Number, default: 0 },
      incomeStability: { type: Number, default: 0 },
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        score: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

creditLedgerSchema.index({ farmerId: 1 });

export const CreditLedger = mongoose.model<ICreditLedger>('CreditLedger', creditLedgerSchema);
