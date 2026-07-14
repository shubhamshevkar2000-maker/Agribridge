import { Types } from 'mongoose';
/**
 * Places a bid atomically using a Redis Lua script.
 * Returns true if successful, false if bid is too low.
 */
export declare const placeBidAtomic: (auctionId: string, buyerId: string, bidAmount: number) => Promise<boolean>;
/**
 * Completes an auction, syncing Redis state back to MongoDB and notifying winner/farmer.
 */
export declare const completeAuction: (auctionId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Auction").IAuction, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Auction").IAuction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
//# sourceMappingURL=auction.service.d.ts.map