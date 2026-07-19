import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  cropId: Types.ObjectId;
  auctionId?: Types.ObjectId;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  deliveryStatus: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  isDemoAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cropId: { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction' },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isDemoAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ buyerId: 1 });
orderSchema.index({ farmerId: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
