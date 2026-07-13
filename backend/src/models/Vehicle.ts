import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVehicle extends Document {
  logisticsPartnerId: Types.ObjectId;
  type: string;
  capacity: number;
  registrationNumber: string;
  insuranceDoc: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    logisticsPartnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    capacity: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    insuranceDoc: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
