import mongoose, { Document, Types } from 'mongoose';
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
    status: 'unassigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    vehicleId?: Types.ObjectId;
    driverId?: Types.ObjectId;
    estimatedFuelCost?: number;
    earnings?: number;
    proofOfDeliveryImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Delivery: mongoose.Model<IDelivery, {}, {}, {}, Document<unknown, {}, IDelivery, {}, mongoose.DefaultSchemaOptions> & IDelivery & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDelivery>;
//# sourceMappingURL=Delivery.d.ts.map