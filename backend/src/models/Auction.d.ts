import mongoose, { Document, Types } from 'mongoose';
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
    status: 'scheduled' | 'live' | 'closed' | 'cancelled';
    bids: IAuctionBid[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Auction: mongoose.Model<IAuction, {}, {}, {}, Document<unknown, {}, IAuction, {}, mongoose.DefaultSchemaOptions> & IAuction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuction>;
//# sourceMappingURL=Auction.d.ts.map