import { Types } from 'mongoose';
import { redisClient } from '../config/redis';
import { Auction } from '../models/Auction';
import { getIO } from '../config/socket';
import { createNotification } from './notification.service';

/**
 * Places a bid atomically using a Redis Lua script.
 * Returns true if successful, false if bid is too low.
 */
export const placeBidAtomic = async (auctionId: string, buyerId: string, bidAmount: number): Promise<boolean> => {
  const redisKey = `auction:${auctionId}:highest_bid`;
  
  // Lua script to ensure atomicity: only update if new bid > current bid
  const luaScript = `
    local current = redis.call('GET', KEYS[1])
    if current == false or tonumber(ARGV[1]) > tonumber(current) then
      redis.call('SET', KEYS[1], ARGV[1])
      redis.call('SET', KEYS[1] .. ':buyer', ARGV[2])
      return 1
    else
      return 0
    end
  `;

  // Depending on node-redis version, you might need to use eval
  const result = await redisClient.sendCommand(['EVAL', luaScript, '1', redisKey, bidAmount.toString(), buyerId]);
  
  if (result === 1) {
    // Successfully placed bid in Redis
    
    // Broadcast to all clients in the auction room
    const io = getIO();
    io.to(`auction_${auctionId}`).emit('auction:update', {
      auctionId,
      highestBid: bidAmount,
      highestBidder: buyerId,
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
    auction.highestBidder = new Types.ObjectId(highestBidderStr) as any;
    auction.status = 'completed';
    await auction.save();

    // Notify Winner
    await createNotification({
      userId: highestBidderStr,
      type: 'auction_won',
      title: 'Auction Won!',
      message: `You won the auction for crop with a bid of ₹${highestBidStr}/qtl.`,
    });

    // Notify Farmer
    await createNotification({
      userId: auction.farmerId.toString(),
      type: 'auction_completed',
      title: 'Auction Completed',
      message: `Your crop auction ended with a winning bid of ₹${highestBidStr}/qtl.`,
    });
    
    const io = getIO();
    io.to(`auction_${auctionId}`).emit('auction:completed', {
      auctionId,
      winner: highestBidderStr,
      amount: auction.currentHighestBid
    });

  } else {
    auction.status = 'cancelled';
    await auction.save();
    
    // Notify Farmer
    await createNotification({
      userId: auction.farmerId.toString(),
      type: 'auction_cancelled',
      title: 'Auction Cancelled',
      message: `Your crop auction ended without any valid bids.`,
    });
  }

  // Cleanup Redis
  await redisClient.del(redisKey);
  await redisClient.del(`${redisKey}:buyer`);

  return auction;
};
