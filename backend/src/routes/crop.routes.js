"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Crop_1 = require("../models/Crop");
const User_1 = require("../models/User");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const router = (0, express_1.Router)();
const locationSchema = zod_1.z.object({
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().optional(),
    coordinates: zod_1.z.array(zod_1.z.number()).optional(),
}).optional();
const cropSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    category: zod_1.z.string(),
    variety: zod_1.z.string().optional(),
    quantity: zod_1.z.number().positive(),
    unit: zod_1.z.string(),
    pricePerUnit: zod_1.z.number().positive(),
    isOrganic: zod_1.z.boolean().default(false),
    qualityGrade: zod_1.z.string().optional(),
    harvestDate: zod_1.z.string().optional(), // ISO date string
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(), // base64 string
    images: zod_1.z.array(zod_1.z.string()).optional(),
    location: locationSchema,
    status: zod_1.z.enum(['draft', 'listed', 'in_auction', 'sold', 'expired']).optional(),
    force: zod_1.z.boolean().optional(),
});
// Get farmer's own inventory
router.get('/inventory', auth_middleware_1.protect, async (req, res) => {
    try {
        const crops = await Crop_1.Crop.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: crops });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Add a new crop to inventory (defaults to draft, but can be published on creation)
router.post('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const validatedData = cropSchema.parse(req.body);
        // Validate Crop Image is mandatory on creation
        if (!req.body.image) {
            return res.status(400).json({ success: false, message: 'Crop image is required.' });
        }
        // Check file size and type of the base64 image
        const mimeRegex = /^data:(image\/(jpeg|png|webp));base64,/;
        const matches = req.body.image.match(mimeRegex);
        if (!matches) {
            return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' });
        }
        const sizeInBytes = req.body.image.length * 0.75;
        if (sizeInBytes > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'File size exceeds the 5 MB limit.' });
        }
        // Check duplicate crop entries
        const query = {
            farmerId: req.user.id,
            name: { $regex: new RegExp(`^${validatedData.name.trim()}$`, 'i') },
            status: { $ne: 'sold' }
        };
        if (validatedData.variety && validatedData.variety.trim() !== '') {
            query.variety = { $regex: new RegExp(`^${validatedData.variety.trim()}$`, 'i') };
        }
        else {
            query.$or = [{ variety: { $exists: false } }, { variety: '' }, { variety: null }];
        }
        if (validatedData.harvestDate) {
            const targetDate = new Date(validatedData.harvestDate);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            query.harvestDate = { $gte: startOfDay, $lte: endOfDay };
        }
        const duplicateExists = await Crop_1.Crop.findOne(query);
        if (duplicateExists && !validatedData.force) {
            return res.status(400).json({
                success: false,
                duplicate: true,
                message: 'A crop with the same name, variety, and harvest date already exists in your inventory.'
            });
        }
        // Upload image to Cloudinary
        console.log('Uploading crop image to Cloudinary...');
        const uploadResult = await cloudinary_1.default.uploader.upload(req.body.image, {
            folder: 'crops',
            resource_type: 'auto'
        });
        console.log('Upload success:', uploadResult.secure_url);
        // Initial status determined by publish flag
        const status = validatedData.status || 'draft';
        const crop = await Crop_1.Crop.create({
            name: validatedData.name,
            category: validatedData.category,
            variety: validatedData.variety,
            quantity: validatedData.quantity,
            unit: validatedData.unit,
            pricePerUnit: validatedData.pricePerUnit,
            isOrganic: validatedData.isOrganic,
            qualityGrade: validatedData.qualityGrade,
            harvestDate: validatedData.harvestDate ? new Date(validatedData.harvestDate) : undefined,
            description: validatedData.description,
            images: [uploadResult.secure_url],
            location: validatedData.location,
            farmerId: req.user.id,
            status
        });
        res.status(201).json({ success: true, data: crop });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, errors: error.issues });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
// Publish a crop (transition from draft to listed)
router.patch('/:id/publish', auth_middleware_1.protect, async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findOneAndUpdate({ _id: req.params.id, farmerId: req.user.id, status: 'draft' }, { status: 'listed' }, { new: true });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found or already published' });
        }
        res.json({ success: true, data: crop, message: 'Crop listing published successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Unpublish a crop (transition from listed to draft)
router.patch('/:id/unpublish', auth_middleware_1.protect, async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findOneAndUpdate({ _id: req.params.id, farmerId: req.user.id, status: 'listed' }, { status: 'draft' }, { new: true });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found or not listed' });
        }
        res.json({ success: true, data: crop, message: 'Crop listing unpublished successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Update a crop
router.put('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const validatedData = cropSchema.parse(req.body);
        const crop = await Crop_1.Crop.findOne({ _id: req.params.id, farmerId: req.user.id });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        if (crop.status === 'in_auction') {
            return res.status(400).json({ success: false, message: 'Cannot modify crop while it is in an active auction.' });
        }
        let imageUrl = crop.images[0];
        if (req.body.image) {
            const mimeRegex = /^data:(image\/(jpeg|png|webp));base64,/;
            const matches = req.body.image.match(mimeRegex);
            if (!matches) {
                return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' });
            }
            const sizeInBytes = req.body.image.length * 0.75;
            if (sizeInBytes > 5 * 1024 * 1024) {
                return res.status(400).json({ success: false, message: 'File size exceeds the 5 MB limit.' });
            }
            console.log('Uploading updated crop image to Cloudinary...');
            const uploadResult = await cloudinary_1.default.uploader.upload(req.body.image, {
                folder: 'crops',
                resource_type: 'auto'
            });
            imageUrl = uploadResult.secure_url;
            console.log('Upload success:', imageUrl);
        }
        crop.name = validatedData.name;
        crop.category = validatedData.category;
        crop.variety = validatedData.variety;
        crop.quantity = validatedData.quantity;
        crop.unit = validatedData.unit;
        crop.pricePerUnit = validatedData.pricePerUnit;
        crop.isOrganic = validatedData.isOrganic;
        crop.qualityGrade = validatedData.qualityGrade;
        crop.harvestDate = validatedData.harvestDate ? new Date(validatedData.harvestDate) : undefined;
        crop.description = validatedData.description;
        crop.images = [imageUrl];
        if (validatedData.location) {
            crop.location = {
                ...crop.location,
                ...validatedData.location,
                type: 'Point',
                coordinates: validatedData.location.coordinates || crop.location?.coordinates || [0, 0]
            };
        }
        if (validatedData.status) {
            crop.status = validatedData.status;
        }
        await crop.save();
        res.json({ success: true, data: crop });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, errors: error.issues });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
// Delete a crop
router.delete('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findOne({ _id: req.params.id, farmerId: req.user.id });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        if (crop.status === 'in_auction') {
            return res.status(400).json({ success: false, message: 'Cannot delete crop while it is in an active auction.' });
        }
        await crop.deleteOne();
        res.json({ success: true, message: 'Crop deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Public: Get all listed crops (for Marketplace)
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const { category, isOrganic, search, minPrice, maxPrice, minQuantity, district, state, zipCode, pincode } = req.query;
        const requester = await User_1.User.findById(req.user.id);
        const isDemo = requester ? requester.isDemoAccount === true : false;
        // Find active farmers matching location criteria
        const farmerQuery = { role: 'farmer' };
        if (isDemo) {
            farmerQuery.isDemoAccount = true;
        }
        else {
            farmerQuery.isDemoAccount = { $ne: true };
        }
        if (district)
            farmerQuery['location.district'] = { $regex: district, $options: 'i' };
        if (state)
            farmerQuery['location.state'] = { $regex: state, $options: 'i' };
        const pc = zipCode || pincode;
        if (pc)
            farmerQuery['location.zipCode'] = pc;
        const validFarmers = await User_1.User.find(farmerQuery).select('_id');
        const validFarmerIds = validFarmers.map(f => f._id);
        // Query crops that are listed, have quantity > 0, and belong to valid active farmers
        let query = {
            status: 'listed',
            quantity: { $gt: 0 },
            farmerId: { $in: validFarmerIds }
        };
        if (category && category !== 'All')
            query.category = category;
        if (isOrganic === 'true')
            query.isOrganic = true;
        if (search)
            query.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            query.pricePerUnit = {};
            if (minPrice)
                query.pricePerUnit.$gte = Number(minPrice);
            if (maxPrice)
                query.pricePerUnit.$lte = Number(maxPrice);
        }
        if (minQuantity) {
            query.quantity = { ...query.quantity, $gte: Number(minQuantity) };
        }
        const crops = await Crop_1.Crop.find(query)
            .populate({
            path: 'farmerId',
            select: 'name location trustScore isDemoAccount',
            match: { role: 'farmer' }
        })
            .sort({ createdAt: -1 });
        // Validate that farmer is active and populate succeeded
        const filteredCrops = crops.filter(c => c.farmerId !== null);
        res.json({ success: true, data: filteredCrops });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Public: Get a single crop by ID
router.get('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const crop = await Crop_1.Crop.findById(req.params.id)
            .populate('farmerId', 'name role location trustScore isDemoAccount');
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        const farmer = crop.farmerId;
        if (!farmer || farmer.role !== 'farmer') {
            return res.status(404).json({ success: false, message: 'Farmer inactive or not found' });
        }
        if (crop.status !== 'listed' && crop.status !== 'in_auction') {
            return res.status(404).json({ success: false, message: 'Listing is not active' });
        }
        const requester = await User_1.User.findById(req.user.id);
        const isDemo = requester ? requester.isDemoAccount === true : false;
        if (isDemo !== (farmer.isDemoAccount === true)) {
            return res.status(404).json({ success: false, message: 'Listing is not available' });
        }
        const cropObj = crop.toObject();
        // Look up active live auction for this crop
        const { Auction } = require('../models/Auction');
        const activeAuction = await Auction.findOne({
            cropId: crop._id,
            status: 'live',
            endTime: { $gt: new Date() }
        });
        if (activeAuction) {
            cropObj.activeAuctionId = activeAuction._id;
        }
        // Look up related crops in the same category
        const relatedCrops = await Crop_1.Crop.find({
            category: crop.category,
            _id: { $ne: crop._id },
            status: 'listed',
            quantity: { $gt: 0 }
        })
            .populate('farmerId', 'name role location trustScore isDemoAccount')
            .limit(4);
        const filteredRelated = relatedCrops.filter((c) => {
            const f = c.farmerId;
            return f && (isDemo === (f.isDemoAccount === true));
        });
        res.json({ success: true, data: cropObj, related: filteredRelated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
