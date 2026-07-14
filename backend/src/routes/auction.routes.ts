import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middlewares/auth.middleware';
import { Auction } from '../models/Auction';
import { Crop } from '../models/Crop';
import { redisClient } from '../config/redis';

const router = Router();

const createAuctionSchema = z.object({
  cropId: z.string(),
  startingBid: z.number().positive(),
  durationMinutes: z.number().positive().min(5),
});

// POST /api/auctions - Create a new auction
router.post('/', protect, async (req: any, res) => {
  try {
    const validatedData = createAuctionSchema.parse(req.body);
    
    // Ensure the farmer owns the crop
    const crop = await Crop.findOne({ _id: validatedData.cropId, farmerId: req.user.id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or you do not own it' });
    }

    if (crop.status !== 'listed') {
      return res.status(400).json({ success: false, message: 'Crop is already in an auction or sold' });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + validatedData.durationMinutes * 60000);

    const auction = await Auction.create({
      cropId: crop._id,
      farmerId: req.user.id,
      startTime,
      endTime,
      startingBid: validatedData.startingBid,
      currentHighestBid: 0,
      status: 'live',
    });

    // Update crop status
    crop.status = 'in_auction';
    await crop.save();

    // Initialize Redis state
    const redisKey = `auction:${auction._id}:highest_bid`;
    await redisClient.set(redisKey, '0');

    res.status(201).json({ success: true, data: auction });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: (error as any).errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auctions - Get live auctions
router.get('/', protect, async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'live' })
      .populate('cropId')
      .populate('farmerId', 'name location trustScore')
      .sort({ endTime: 1 });
    
    // Attach real-time highest bid from Redis
    const auctionsWithBids = await Promise.all(auctions.map(async (a) => {
      const redisKey = `auction:${a._id}:highest_bid`;
      const currentRedisBid = await redisClient.get(redisKey);
      const auctionObj = a.toObject();
      if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
        auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
      }
      return auctionObj;
    }));

    res.json({ success: true, data: auctionsWithBids });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auctions/:id - Get specific auction
router.get('/:id', protect, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('cropId')
      .populate('farmerId', 'name location trustScore');
    
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    const auctionObj = auction.toObject();
    const redisKey = `auction:${auction._id}:highest_bid`;
    const currentRedisBid = await redisClient.get(redisKey);
    
    if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
      auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
    }

    res.json({ success: true, data: auctionObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
