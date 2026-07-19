"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Auction_1 = require("../models/Auction");
const Crop_1 = require("../models/Crop");
const User_1 = require("../models/User");
const redis_1 = require("../config/redis");
const auction_service_1 = require("../services/auction.service");
const router = (0, express_1.Router)();
const createAuctionSchema = zod_1.z.object({
    cropId: zod_1.z.string(),
    startingBid: zod_1.z.number().positive(),
    minIncrement: zod_1.z.number().positive().default(100),
    reservePrice: zod_1.z.number().positive().optional(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    notes: zod_1.z.string().optional(),
});
// POST /api/auctions - Create a new auction
router.post('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const validatedData = createAuctionSchema.parse(req.body);
        // Ensure the farmer owns the crop and it is draft or listed
        const crop = await Crop_1.Crop.findOne({ _id: validatedData.cropId, farmerId: req.user.id });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found or you do not own it' });
        }
        if (crop.status !== 'listed' && crop.status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Crop is already in an auction or sold' });
        }
        // Ensure sufficient quantity is available
        if (validatedData.quantity > crop.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient quantity. Only ${crop.quantity} ${crop.unit} available.` });
        }
        const now = new Date();
        const startTime = new Date(validatedData.startTime);
        const endTime = new Date(validatedData.endTime);
        if (startTime >= endTime) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }
        const status = startTime > now ? 'scheduled' : 'live';
        // Lock quantity by subtracting it
        crop.quantity -= validatedData.quantity;
        if (crop.quantity === 0) {
            crop.status = 'in_auction';
        }
        await crop.save();
        const auction = await Auction_1.Auction.create({
            cropId: crop._id,
            farmerId: req.user.id,
            startTime,
            endTime,
            startingBid: validatedData.startingBid,
            currentHighestBid: 0,
            status,
            minIncrement: validatedData.minIncrement,
            reservePrice: validatedData.reservePrice,
            quantity: validatedData.quantity,
            notes: validatedData.notes,
        });
        // Initialize Redis state
        const redisKey = `auction:${auction._id}:highest_bid`;
        await redis_1.redisClient.set(redisKey, '0');
        res.status(201).json({ success: true, data: auction });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, errors: error.issues });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/auctions/farmer/me - Get auctions created by the logged-in farmer
router.get('/farmer/me', auth_middleware_1.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const auctions = await Auction_1.Auction.find({ farmerId: userId })
            .populate('cropId')
            .populate('farmerId', 'name location trustScore')
            .sort({ createdAt: -1 });
        // Attach real-time highest bid from Redis
        const auctionsWithBids = await Promise.all(auctions.map(async (a) => {
            const redisKey = `auction:${a._id}:highest_bid`;
            const currentRedisBid = await redis_1.redisClient.get(redisKey);
            const auctionObj = a.toObject();
            if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
                auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
            }
            return auctionObj;
        }));
        res.json({ success: true, data: auctionsWithBids });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/auctions/bids/me - Get auctions where the logged-in buyer has placed a bid
router.get('/bids/me', auth_middleware_1.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const auctions = await Auction_1.Auction.find({ 'bids.bidderId': userId })
            .populate('cropId')
            .populate('farmerId', 'name location trustScore')
            .sort({ endTime: 1 });
        // Attach real-time highest bid from Redis
        const auctionsWithBids = await Promise.all(auctions.map(async (a) => {
            const redisKey = `auction:${a._id}:highest_bid`;
            const currentRedisBid = await redis_1.redisClient.get(redisKey);
            const auctionObj = a.toObject();
            if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
                auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
            }
            return auctionObj;
        }));
        res.json({ success: true, data: auctionsWithBids });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/auctions/:id/bid - Place a bid on an auction
router.post('/:id/bid', auth_middleware_1.protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const auctionId = req.params.id;
        const buyerId = req.user.id;
        if (req.user.role !== 'buyer') {
            return res.status(403).json({ success: false, message: 'Only buyers can place bids' });
        }
        const auction = await Auction_1.Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }
        if (auction.status !== 'live') {
            return res.status(400).json({ success: false, message: 'Auction is not live' });
        }
        if (new Date() > auction.endTime) {
            return res.status(400).json({ success: false, message: 'Auction has expired' });
        }
        const redisKey = `auction:${auctionId}:highest_bid`;
        const currentRedisBid = await redis_1.redisClient.get(redisKey);
        const currentBid = currentRedisBid ? parseInt(currentRedisBid, 10) : auction.currentHighestBid;
        const minIncrement = auction.minIncrement || 100;
        const minRequiredBid = currentBid > 0 ? (currentBid + minIncrement) : auction.startingBid;
        if (amount < minRequiredBid) {
            return res.status(400).json({ success: false, message: `Bid must be at least ₹${minRequiredBid}` });
        }
        const success = await (0, auction_service_1.placeBidAtomic)(auctionId, buyerId, amount);
        if (success) {
            res.json({ success: true, message: 'Bid placed successfully' });
        }
        else {
            res.status(400).json({ success: false, message: 'Bid amount is too low' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/auctions - Get live auctions
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const farmerQuery = { role: 'farmer' };
        const validFarmers = await User_1.User.find(farmerQuery).select('_id');
        const validFarmerIds = validFarmers.map((f) => f._id);
        const auctions = await Auction_1.Auction.find({
            status: 'live',
            endTime: { $gt: new Date() },
            farmerId: { $in: validFarmerIds }
        })
            .populate('cropId')
            .populate('farmerId', 'name role location trustScore isDemoAccount')
            .sort({ endTime: 1 });
        // Attach real-time highest bid from Redis
        const auctionsWithBids = await Promise.all(auctions
            .filter(a => a.cropId !== null && a.farmerId !== null)
            .map(async (a) => {
            const redisKey = `auction:${a._id}:highest_bid`;
            const currentRedisBid = await redis_1.redisClient.get(redisKey);
            const auctionObj = a.toObject();
            if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
                auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
            }
            return auctionObj;
        }));
        res.json({ success: true, data: auctionsWithBids });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/auctions/:id - Get specific auction
router.get('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const auction = await Auction_1.Auction.findById(req.params.id)
            .populate('cropId')
            .populate('farmerId', 'name role location trustScore isDemoAccount')
            .populate('winnerId', 'name')
            .populate('bids.bidderId', 'name');
        if (!auction) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }
        const farmer = auction.farmerId;
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).json({ success: false, message: 'Farmer inactive or not found' });
        }
        const isOwner = farmer._id.toString() === req.user.id;
        const isBidder = auction.bids.some(b => b.bidderId && b.bidderId._id.toString() === req.user.id);
        const isLiveOrScheduled = auction.status === 'live' || auction.status === 'scheduled';
        if (!isLiveOrScheduled && !isOwner && !isBidder) {
            return res.status(403).json({ success: false, message: 'Access denied to ended auction details' });
        }
        const auctionObj = auction.toObject();
        const redisKey = `auction:${auction._id}:highest_bid`;
        const currentRedisBid = await redis_1.redisClient.get(redisKey);
        if (currentRedisBid && parseInt(currentRedisBid, 10) > auctionObj.currentHighestBid) {
            auctionObj.currentHighestBid = parseInt(currentRedisBid, 10);
        }
        // Populate live bids from Redis if live, merging with name mapping
        if (auction.status === 'live') {
            const historyKey = `auction:${auction._id}:history`;
            const historyData = await redis_1.redisClient.lRange(historyKey, 0, -1);
            if (historyData && historyData.length > 0) {
                auctionObj.bids = historyData.map((h) => {
                    const parts = h.split('|');
                    return {
                        bidderId: { _id: parts[0], name: parts[1] },
                        amount: parseInt(parts[2], 10),
                        timestamp: new Date()
                    };
                });
            }
        }
        res.json({ success: true, data: auctionObj });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
