import mongoose, { Document, Types } from 'mongoose';
export interface IOrder extends Document {
    buyerId: Types.ObjectId;
    farmerId: Types.ObjectId;
    cropId: Types.ObjectId;
    auctionId?: Types.ObjectId;
    quantity: number;
    totalAmount: number;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    deliveryStatus: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
//# sourceMappingURL=Order.d.ts.map