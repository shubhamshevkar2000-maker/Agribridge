import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDelivery extends Document {
  orderId: Types.ObjectId;
  logisticsPartnerId?: Types.ObjectId;
  pickupLocation: {
    type: string;
    coordinates: number[];
  };
  dropLocation: {
    type: string;
    coordinates: number[];
  };
  route: {
    type: string;
    coordinates: number[];
  }[];
  status: 'pending' | 'packed' | 'in_transit' | 'delivered' | 'cancelled';
  vehicleId?: Types.ObjectId;
  driverId?: Types.ObjectId; // Might reference a separate Driver model or just User if they are the driver
  estimatedFuelCost?: number;
  earnings?: number;
  proofOfDeliveryImage?: string;
  isOutForDelivery?: boolean;
  isDemoAccount?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    logisticsPartnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    dropLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    route: [
      {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'packed', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    estimatedFuelCost: { type: Number },
    earnings: { type: Number },
    proofOfDeliveryImage: { type: String },
    isOutForDelivery: { type: Boolean, default: false },
    isDemoAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

deliverySchema.index({ logisticsPartnerId: 1 });
deliverySchema.index({ status: 1 });

export const Delivery = mongoose.model<IDelivery>('Delivery', deliverySchema);
