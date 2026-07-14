import mongoose, { Document, Types } from 'mongoose';
export interface ITransaction extends Document {
    orderId?: Types.ObjectId;
    payerId: Types.ObjectId;
    payeeId: Types.ObjectId;
    amount: number;
    mode: 'cash' | 'upi' | 'bank' | 'wallet';
    status: 'pending' | 'success' | 'failed' | 'refunded';
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, Document<unknown, {}, ITransaction, {}, mongoose.DefaultSchemaOptions> & ITransaction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITransaction>;
//# sourceMappingURL=Transaction.d.ts.map