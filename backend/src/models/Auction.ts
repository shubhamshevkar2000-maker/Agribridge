import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuctionBid {
  bidderId: Types.ObjectId;
  amount: number;
  timestamp: Date;
}

export interface IAuction extends Document {
  cropId: Types.ObjectId;
  farmerId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  startingBid: number;
  currentHighestBid: number;
  winnerId?: Types.ObjectId;
  status: 'scheduled' | 'live' | 'closed' | 'cancelled' | 'ended' | 'sold';
  minIncrement: number;
  reservePrice?: number;
  quantity: number;
  notes?: string;
  bids: IAuctionBid[];
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>(
  {
    cropId: { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    startingBid: { type: Number, required: true },
    currentHighestBid: { type: Number, default: 0 },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'closed', 'cancelled', 'ended', 'sold'],
      default: 'scheduled',
    },
    minIncrement: { type: Number, default: 100 },
    reservePrice: { type: Number },
    quantity: { type: Number, required: true },
    notes: { type: String },
    bids: [
      {
        bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

auctionSchema.index({ status: 1 });
auctionSchema.index({ endTime: 1 });

export const Auction = mongoose.model<IAuction>('Auction', auctionSchema);
