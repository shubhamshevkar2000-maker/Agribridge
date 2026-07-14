import mongoose, { Document, Types } from 'mongoose';
export interface IReview extends Document {
    buyerId: Types.ObjectId;
    farmerId: Types.ObjectId;
    orderId: Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, Document<unknown, {}, IReview, {}, mongoose.DefaultSchemaOptions> & IReview & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IReview>;
//# sourceMappingURL=Review.d.ts.map