import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  orderId?: Types.ObjectId;
  payerId: Types.ObjectId;
  payeeId: Types.ObjectId;
  amount: number;
  mode: 'cash' | 'upi' | 'bank' | 'wallet';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  timestamp: Date;
  isDemoAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    payerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    payeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    mode: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    timestamp: { type: Date, default: Date.now },
    isDemoAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

transactionSchema.index({ orderId: 1 });
transactionSchema.index({ timestamp: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
