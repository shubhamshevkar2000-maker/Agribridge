import { Types } from 'mongoose';
import { redisClient } from '../config/redis';
import { Auction } from '../models/Auction';
import { getIO } from '../config/socket';
import { createNotification } from './notification.service';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Crop } from '../models/Crop';

/**
 * Places a bid atomically using a Redis Lua script.
 * Returns true if successful, false if bid is too low.
 */
export const placeBidAtomic = async (auctionId: string, buyerId: string, bidAmount: number): Promise<boolean> => {
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

  const user = await User.findById(buyerId);
  const bidderName = user ? user.name : 'Unknown';

  // Return value is old buyer ID, or "0" if bid too low, or "" if no previous buyer
  const result = await redisClient.sendCommand([
    'EVAL', luaScript, '2', redisKey, historyKey, 
    bidAmount.toString(), buyerId, bidderName
  ]) as string;
  
  if (result !== "0") {
    // Successfully placed bid in Redis
    
    // If there was a previous bidder and it's not the same person, notify them
    if (result && result !== "" && result !== buyerId) {
      await createNotification({
        userId: result,
        type: 'outbid',
        title: 'You were outbid!',
        message: `Someone placed a higher bid (₹${bidAmount}) on an auction you were winning.`,
      });
    }

    // Fetch latest history
    const historyData = await redisClient.lRange(historyKey, 0, -1);
    const history = historyData.map((h: string) => {
      const parts = h.split('|');
      return { bidderId: parts[0], bidderName: parts[1], amount: parseInt(parts[2], 10) };
    });

    // Sync bid to MongoDB
    await Auction.findByIdAndUpdate(auctionId, {
      $push: {
        bids: {
          bidderId: new Types.ObjectId(buyerId),
          amount: bidAmount,
          timestamp: new Date()
        }
      },
      currentHighestBid: bidAmount
    });

    // Broadcast to all clients in the auction room
    const io = getIO();
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

/**
 * Completes an auction, syncing Redis state back to MongoDB and notifying winner/farmer.
 */
export const completeAuction = async (auctionId: string) => {
  const redisKey = `auction:${auctionId}:highest_bid`;
  const highestBidStr = await redisClient.get(redisKey);
  const highestBidderStr = await redisClient.get(`${redisKey}:buyer`);

  const auction = await Auction.findById(auctionId).populate('cropId').populate('farmerId');
  if (!auction) return null;

  if (highestBidStr && highestBidderStr) {
    auction.currentHighestBid = parseInt(highestBidStr, 10);
    auction.winnerId = new Types.ObjectId(highestBidderStr) as any;
    auction.status = 'sold';
    await auction.save();

    // Update Crop status to sold if remaining quantity is 0
    if (auction.cropId) {
      const crop = await Crop.findById(auction.cropId);
      if (crop && crop.quantity === 0) {
        crop.status = 'sold';
        await crop.save();
      }
    }

    // Notify Winner
    await createNotification({
      userId: highestBidderStr,
      type: 'auction_won',
      title: 'Auction Won!',
      message: `You won the auction for crop with a bid of ₹${highestBidStr}/qtl.`,
    });

    // Notify Farmer
    await createNotification({
      userId: (auction.farmerId as any)._id.toString(),
      type: 'auction_completed',
      title: 'Auction Completed',
      message: `Your crop auction ended with a winning bid of ₹${highestBidStr}/qtl.`,
    });

    // Create Order for winner
    if (auction.cropId) {
      const crop = auction.cropId as any;
      const orderQty = auction.quantity || crop.quantity;
      await Order.create({
        buyerId: highestBidderStr,
        farmerId: (auction.farmerId as any)._id,
        cropId: crop._id,
        quantity: orderQty,
        totalAmount: orderQty * auction.currentHighestBid,
        paymentStatus: 'pending',
        deliveryStatus: 'pending'
      });
    }

    const io = getIO();
    io.to(`auction_${auctionId}`).emit('auction:completed', {
      auctionId,
      winner: highestBidderStr,
      amount: auction.currentHighestBid
    });

  } else {
    auction.status = 'cancelled';
    await auction.save();
    
    // Release locked quantity back to the crop
    if (auction.cropId) {
      const crop = await Crop.findById(auction.cropId);
      if (crop) {
        crop.quantity += auction.quantity || 0;
        if (crop.status === 'in_auction') {
          crop.status = 'listed';
        }
        await crop.save();
      }
    }

    // Notify Farmer
    await createNotification({
      userId: (auction.farmerId as any)._id.toString(),
      type: 'auction_cancelled',
      title: 'Auction Cancelled',
      message: `Your crop auction ended without any valid bids.`,
    });
  }

  // Cleanup Redis
  await redisClient.del(redisKey);
  await redisClient.del(`${redisKey}:buyer`);
  await redisClient.del(`auction:${auctionId}:history`);

  return auction;
};
