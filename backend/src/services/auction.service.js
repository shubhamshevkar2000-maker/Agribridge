"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeAuction = exports.placeBidAtomic = void 0;
const mongoose_1 = require("mongoose");
const redis_1 = require("../config/redis");
const Auction_1 = require("../models/Auction");
const socket_1 = require("../config/socket");
const notification_service_1 = require("./notification.service");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const Crop_1 = require("../models/Crop");
/**
 * Places a bid atomically using a Redis Lua script.
 * Returns true if successful, false if bid is too low.
 */
const placeBidAtomic = async (auctionId, buyerId, bidAmount) => {
    const redisKey = `auction:${auctionId}:highest_bid`;
    const historyKey = `auction:${auctionId}:history`;
    // Lua script to ensure atomicity: only update if new bid > current bid
    const luaScript = `
    local current = redis.call('GET', KEYS[1])
    local currentBuyer = redis.call('GET', KEYS[1] .. ':buyer')
    if current == false or tonumber(ARGV[1]) > tonumber(current) then
      redis.call('SET', KEYS[1], ARGV[1])
      redis.call('SET', KEYS[1] .. ':buyer', ARGV[2])
      
      -- Add to history list (max 50)
      local historyEntry = ARGV[2] .. "|" .. ARGV[3] .. "|" .. ARGV[1]
      redis.call('LPUSH', KEYS[2], historyEntry)
      redis.call('LTRIM', KEYS[2], 0, 49)
      
      return currentBuyer or ""
    else
      return "0"
    end
  `;
    const user = await User_1.User.findById(buyerId);
    const bidderName = user ? user.name : 'Unknown';
    // Return value is old buyer ID, or "0" if bid too low, or "" if no previous buyer
    const result = await redis_1.redisClient.sendCommand([
        'EVAL', luaScript, '2', redisKey, historyKey,
        bidAmount.toString(), buyerId, bidderName
    ]);
    if (result !== "0") {
        // Successfully placed bid in Redis
        // If there was a previous bidder and it's not the same person, notify them
        if (result && result !== "" && result !== buyerId) {
            await (0, notification_service_1.createNotification)({
                userId: result,
                type: 'outbid',
                title: 'You were outbid!',
                message: `Someone placed a higher bid (₹${bidAmount}) on an auction you were winning.`,
            });
        }
        // Fetch latest history
        const historyData = await redis_1.redisClient.lRange(historyKey, 0, -1);
        const history = historyData.map((h) => {
            const parts = h.split('|');
            return { bidderId: parts[0], bidderName: parts[1], amount: parseInt(parts[2], 10) };
        });
        // Sync bid to MongoDB
        await Auction_1.Auction.findByIdAndUpdate(auctionId, {
            $push: {
                bids: {
                    bidderId: new mongoose_1.Types.ObjectId(buyerId),
                    amount: bidAmount,
                    timestamp: new Date()
                }
            },
            currentHighestBid: bidAmount
        });
        // Broadcast to all clients in the auction room
        const io = (0, socket_1.getIO)();
        io.to(`auction_${auctionId}`).emit('auction:update', {
            auctionId,
            highestBid: bidAmount,
            highestBidder: buyerId,
            history,
            timestamp: new Date().toISOString()
        });
        return true;
    }
    return false;
};
exports.placeBidAtomic = placeBidAtomic;
/**
 * Completes an auction, syncing Redis state back to MongoDB and notifying winner/farmer.
 */
const completeAuction = async (auctionId) => {
    const redisKey = `auction:${auctionId}:highest_bid`;
    const highestBidStr = await redis_1.redisClient.get(redisKey);
    const highestBidderStr = await redis_1.redisClient.get(`${redisKey}:buyer`);
    const auction = await Auction_1.Auction.findById(auctionId).populate('cropId').populate('farmerId');
    if (!auction)
        return null;
    if (highestBidStr && highestBidderStr) {
        auction.currentHighestBid = parseInt(highestBidStr, 10);
        auction.winnerId = new mongoose_1.Types.ObjectId(highestBidderStr);
        auction.status = 'sold';
        await auction.save();
        // Update Crop status to sold if remaining quantity is 0
        if (auction.cropId) {
            const crop = await Crop_1.Crop.findById(auction.cropId);
            if (crop && crop.quantity === 0) {
                crop.status = 'sold';
                await crop.save();
            }
        }
        // Notify Winner
        await (0, notification_service_1.createNotification)({
            userId: highestBidderStr,
            type: 'auction_won',
            title: 'Auction Won!',
            message: `You won the auction for crop with a bid of ₹${highestBidStr}/qtl.`,
        });
        // Notify Farmer
        await (0, notification_service_1.createNotification)({
            userId: auction.farmerId._id.toString(),
            type: 'auction_completed',
            title: 'Auction Completed',
            message: `Your crop auction ended with a winning bid of ₹${highestBidStr}/qtl.`,
        });
        // Create Order for winner
        if (auction.cropId) {
            const crop = auction.cropId;
            const orderQty = auction.quantity || crop.quantity;
            await Order_1.Order.create({
                buyerId: highestBidderStr,
                farmerId: auction.farmerId._id,
                cropId: crop._id,
                quantity: orderQty,
                totalAmount: orderQty * auction.currentHighestBid,
                paymentStatus: 'pending',
                deliveryStatus: 'pending'
            });
        }
        const io = (0, socket_1.getIO)();
        io.to(`auction_${auctionId}`).emit('auction:completed', {
            auctionId,
            winner: highestBidderStr,
            amount: auction.currentHighestBid
        });
    }
    else {
        auction.status = 'cancelled';
        await auction.save();
        // Release locked quantity back to the crop
        if (auction.cropId) {
            const crop = await Crop_1.Crop.findById(auction.cropId);
            if (crop) {
                crop.quantity += auction.quantity || 0;
                if (crop.status === 'in_auction') {
                    crop.status = 'listed';
                }
                await crop.save();
            }
        }
        // Notify Farmer
        await (0, notification_service_1.createNotification)({
            userId: auction.farmerId._id.toString(),
            type: 'auction_cancelled',
            title: 'Auction Cancelled',
            message: `Your crop auction ended without any valid bids.`,
        });
    }
    // Cleanup Redis
    await redis_1.redisClient.del(redisKey);
    await redis_1.redisClient.del(`${redisKey}:buyer`);
    await redis_1.redisClient.del(`auction:${auctionId}:history`);
    return auction;
};
exports.completeAuction = completeAuction;
