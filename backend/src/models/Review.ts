import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ farmerId: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
