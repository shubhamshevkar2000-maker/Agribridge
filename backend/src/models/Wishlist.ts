import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  buyerId: Types.ObjectId;
  cropIds: Types.ObjectId[];
  isDemoAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cropIds: [{ type: Schema.Types.ObjectId, ref: 'Crop' }],
    isDemoAccount: { type: Boolean, default: false }
  },
  { timestamps: true }
);

wishlistSchema.index({ buyerId: 1 });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
