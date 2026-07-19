import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middlewares/auth.middleware';
import { Crop } from '../models/Crop';
import { User } from '../models/User';
import cloudinary, { safeUpload } from '../config/cloudinary';

const router = Router();

const emitMarketplaceUpdate = () => {
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    if (io) {
      io.emit('marketplace:update');
      console.log('[Socket] Emitted marketplace:update');
    }
  } catch (err: any) {
    console.error('[Socket] Failed to emit marketplace:update:', err.message);
  }
};


const locationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  coordinates: z.array(z.number()).optional(),
}).optional();

const cropSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  variety: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  pricePerUnit: z.number().positive(),
  isOrganic: z.boolean().default(false),
  qualityGrade: z.string().optional(),
  harvestDate: z.string().optional(), // ISO date string
  description: z.string().optional(),
  image: z.string().optional(), // base64 string
  images: z.array(z.string()).optional(),
  location: locationSchema,
  status: z.enum(['draft', 'listed', 'in_auction', 'sold', 'expired']).optional(),
  force: z.boolean().optional(),
});

// Get farmer's own inventory
router.get('/inventory', protect, async (req: any, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: crops });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new crop to inventory (defaults to draft, but can be published on creation)
router.post('/', protect, async (req: any, res) => {
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
    const query: any = {
      farmerId: req.user.id,
      name: { $regex: new RegExp(`^${validatedData.name.trim()}$`, 'i') },
      status: { $ne: 'sold' }
    };
    if (validatedData.variety && validatedData.variety.trim() !== '') {
      query.variety = { $regex: new RegExp(`^${validatedData.variety.trim()}$`, 'i') };
    } else {
      query.$or = [{ variety: { $exists: false } }, { variety: '' }, { variety: null }];
    }
    if (validatedData.harvestDate) {
      const targetDate = new Date(validatedData.harvestDate);
      const startOfDay = new Date(targetDate.setHours(0,0,0,0));
      const endOfDay = new Date(targetDate.setHours(23,59,59,999));
      query.harvestDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const duplicateExists = await Crop.findOne(query);
    if (duplicateExists && !validatedData.force) {
      return res.status(400).json({
        success: false,
        duplicate: true,
        message: 'A crop with the same name, variety, and harvest date already exists in your inventory.'
      });
    }

    // Upload image to Cloudinary or use base64 fallback
    let imageUrl = req.body.image;
    try {
      console.log('Uploading crop image...');
      const uploadResult = await safeUpload(req.body.image, {
        folder: 'crops',
        resource_type: 'auto'
      });
      imageUrl = uploadResult.secure_url;
      console.log('Upload success:', imageUrl);
    } catch (uploadError: any) {
      console.error('Image upload failed, falling back to base64.', uploadError.message);
    }

    // Initial status determined by publish flag
    const status = validatedData.status || 'draft';

    const crop = await Crop.create({
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
      images: [imageUrl],
      location: validatedData.location,
      farmerId: req.user.id,
      status
    });
    
    if (process.env.MARKETPLACE_DEBUG === 'true') {
      console.log(`[Marketplace Debug] [Lifecycle: Created] Crop Created: ID=${crop._id}, Name="${crop.name}", FarmerID=${crop.farmerId}, Status=${crop.status}, Price=${crop.pricePerUnit}, Qty=${crop.quantity}, ImagesCount=${crop.images?.length || 0}`);
    }

    emitMarketplaceUpdate();
    res.status(201).json({ success: true, data: crop });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.issues });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Publish a crop (transition from draft to listed)
router.patch('/:id/publish', protect, async (req: any, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id, status: 'draft' },
      { status: 'listed' },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or already published' });
    }

    if (process.env.MARKETPLACE_DEBUG === 'true') {
      console.log(`[Marketplace Debug] [Lifecycle: Published] Crop Published: ID=${crop._id}, Name="${crop.name}", FarmerID=${crop.farmerId}, Status=${crop.status}`);
    }

    emitMarketplaceUpdate();
    res.json({ success: true, data: crop, message: 'Crop listing published successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unpublish a crop (transition from listed to draft)
router.patch('/:id/unpublish', protect, async (req: any, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id, status: 'listed' },
      { status: 'draft' },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found or not listed' });
    }

    if (process.env.MARKETPLACE_DEBUG === 'true') {
      console.log(`[Marketplace Debug] [Lifecycle: Unpublished] Crop Unpublished: ID=${crop._id}, Name="${crop.name}", FarmerID=${crop.farmerId}, Status=${crop.status}`);
    }

    emitMarketplaceUpdate();
    res.json({ success: true, data: crop, message: 'Crop listing unpublished successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a crop
router.put('/:id', protect, async (req: any, res) => {
  try {
    const validatedData = cropSchema.parse(req.body);
    
    const crop = await Crop.findOne({ _id: req.params.id, farmerId: req.user.id });
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

      try {
        console.log('Uploading updated crop image...');
        const uploadResult = await safeUpload(req.body.image, {
          folder: 'crops',
          resource_type: 'auto'
        });
        imageUrl = uploadResult.secure_url;
        console.log('Upload success:', imageUrl);
      } catch (uploadError: any) {
        console.error('Image upload failed, using base64 instead.', uploadError.message);
        imageUrl = req.body.image;
      }
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
    
    if (process.env.MARKETPLACE_DEBUG === 'true') {
      console.log(`[Marketplace Debug] [Lifecycle: Updated] Crop Updated: ID=${crop._id}, Name="${crop.name}", FarmerID=${crop.farmerId}, Status=${crop.status}, Price=${crop.pricePerUnit}, Qty=${crop.quantity}`);
    }

    emitMarketplaceUpdate();
    res.json({ success: true, data: crop });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.issues });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a crop
router.delete('/:id', protect, async (req: any, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, farmerId: req.user.id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    if (crop.status === 'in_auction') {
      return res.status(400).json({ success: false, message: 'Cannot delete crop while it is in an active auction.' });
    }

    await crop.deleteOne();
    
    if (process.env.MARKETPLACE_DEBUG === 'true') {
      console.log(`[Marketplace Debug] [Lifecycle: Deleted] Crop Deleted: ID=${crop._id}, Name="${crop.name}", FarmerID=${crop.farmerId}`);
    }

    emitMarketplaceUpdate();
    res.json({ success: true, message: 'Crop deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get all listed crops (for Marketplace)
router.get('/', protect, async (req: any, res) => {
  try {
    const { category, isOrganic, search, minPrice, maxPrice, minQuantity, district, state, zipCode, pincode } = req.query;
    
    // Find active farmers matching location criteria (removed isDemoAccount segregation)
    const farmerQuery: any = { role: 'farmer' };
    
    if (district) farmerQuery['location.district'] = { $regex: district as string, $options: 'i' };
    if (state) farmerQuery['location.state'] = { $regex: state as string, $options: 'i' };
    const pc = zipCode || pincode;
    if (pc) farmerQuery['location.zipCode'] = pc;

    const validFarmers = await User.find(farmerQuery).select('_id');
    const validFarmerIds = validFarmers.map(f => f._id);

    // Query crops that are listed, have quantity > 0, and belong to valid active farmers
    let query: any = {
      status: 'listed',
      quantity: { $gt: 0 },
      farmerId: { $in: validFarmerIds }
    };
    
    if (category && category !== 'All') query.category = category;
    if (isOrganic === 'true') query.isOrganic = true;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }
    
    if (minQuantity) {
      query.quantity = { ...query.quantity, $gte: Number(minQuantity) };
    }
    
    const crops = await Crop.find(query)
      .populate({
        path: 'farmerId',
        select: 'name location trustScore isDemoAccount',
        match: { role: 'farmer' }
      })
      .sort({ createdAt: -1 });

    // Validate that farmer is active and populate succeeded
    const filteredCrops = crops.filter(c => {
      if (!c.farmerId) {
        console.warn(`[Marketplace API Warning] Crop ${c._id} has an invalid or missing farmer reference (farmerId: ${c.farmerId}).`);
        return false;
      }
      return true;
    });

    if (process.env.MARKETPLACE_DEBUG === 'true') {
      const totalCropsCount = await Crop.countDocuments();
      const totalPublishedCount = await Crop.countDocuments({ status: 'listed' });
      console.log(`[Marketplace Debug] [Retrieval] Total crops in DB: ${totalCropsCount}`);
      console.log(`[Marketplace Debug] [Retrieval] Total published (listed) crops: ${totalPublishedCount}`);
      console.log(`[Marketplace Debug] [Retrieval] Applied query filters:`, JSON.stringify(query));
      console.log(`[Marketplace Debug] [Retrieval] Price range received: minPrice = ${minPrice || 'none'}, maxPrice = ${maxPrice || 'none'}`);
      console.log(`[Marketplace Debug] [Retrieval] Crops matched by DB query: ${crops.length}`);
      console.log(`[Marketplace Debug] [Retrieval] Final crops returned after user validation: ${filteredCrops.length}`);

      // Perform complete filtered-out crop analysis
      const allCropsInDb = await Crop.find({}).populate({
        path: 'farmerId',
        select: 'name role location trustScore isDemoAccount'
      });
      const returnedCropsSet = new Set(filteredCrops.map(c => c._id.toString()));

      for (const c of allCropsInDb) {
        if (!returnedCropsSet.has(c._id.toString())) {
          let reason = '';
          const farmer = c.farmerId as any;
          if (c.status !== 'listed') {
            reason = `unpublished (status: '${c.status}')`;
          } else if (c.quantity <= 0) {
            reason = `quantity <= 0 (${c.quantity})`;
          } else if (!farmer) {
            reason = 'invalid or deleted farmer reference';
          } else if (farmer.role !== 'farmer') {
            reason = `farmer has invalid role: '${farmer.role}'`;
          } else if (minPrice && c.pricePerUnit < Number(minPrice)) {
            reason = `price (${c.pricePerUnit}) below minPrice (${minPrice})`;
          } else if (maxPrice && c.pricePerUnit > Number(maxPrice)) {
            reason = `price (${c.pricePerUnit}) above maxPrice (${maxPrice})`;
          } else if (category && category !== 'All' && c.category !== category) {
            reason = `category mismatch (crop category: '${c.category}', filter category: '${category}')`;
          } else if (isOrganic === 'true' && !c.isOrganic) {
            reason = 'organic mismatch (crop is not organic)';
          } else if (search && !new RegExp(search as string, 'i').test(c.name)) {
            reason = `search name mismatch (crop name: "${c.name}", search: "${search}")`;
          } else if (minQuantity && c.quantity < Number(minQuantity)) {
            reason = `quantity (${c.quantity}) below minQuantity (${minQuantity})`;
          } else if (district || state || zipCode || pincode) {
            const districtMatch = !district || (farmer.location?.district && new RegExp(district as string, 'i').test(farmer.location.district));
            const stateMatch = !state || (farmer.location?.state && new RegExp(state as string, 'i').test(farmer.location.state));
            const zipMatch = !(zipCode || pincode) || (farmer.location?.zipCode === (zipCode || pincode));
            if (!districtMatch || !stateMatch || !zipMatch) {
              reason = `location filter mismatch (districtMatch: ${!!districtMatch}, stateMatch: ${!!stateMatch}, zipMatch: ${!!zipMatch})`;
            } else {
              reason = 'filtered out by location constraints';
            }
          } else {
            reason = 'other query constraints';
          }
          console.log(`[Marketplace Debug] Crop "${c.name}" (ID: ${c._id}, price: ${c.pricePerUnit}) was filtered out because: ${reason}`);
        } else {
          // Log data consistency comparison showing stored vs response price
          const imagesCount = c.images?.length || 0;
          console.log(`[Marketplace Debug] Crop "${c.name}" (ID: ${c._id}) price & consistency verification: Stored DB price: ${c.pricePerUnit}, API response price: ${c.pricePerUnit}, Farmer ID: ${c.farmerId?._id || 'null'}, status: ${c.status}, quantity: ${c.quantity}, imagesCount: ${imagesCount}, published: true`);
        }
      }
    }

    res.json({ success: true, data: filteredCrops });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get a single crop by ID
router.get('/:id', protect, async (req: any, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmerId', 'name role location trustScore isDemoAccount');
    
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    const farmer = crop.farmerId as any;
    if (!farmer) {
      console.warn(`[Crop Details API Warning] Crop ${crop._id} is orphaned. Referenced farmer user does not exist.`);
      return res.status(404).json({ success: false, message: 'Farmer inactive or not found' });
    }
    if (farmer.role !== 'farmer') {
      console.warn(`[Crop Details API Warning] Crop ${crop._id} owner ${farmer._id} does not have the farmer role (role: ${farmer.role}).`);
      return res.status(404).json({ success: false, message: 'Farmer inactive or not found' });
    }

    if (crop.status !== 'listed' && crop.status !== 'in_auction') {
      return res.status(404).json({ success: false, message: 'Listing is not active' });
    }

    const cropObj: any = crop.toObject();

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
    const relatedCrops = await Crop.find({
      category: crop.category,
      _id: { $ne: crop._id },
      status: 'listed',
      quantity: { $gt: 0 }
    })
    .populate('farmerId', 'name role location trustScore isDemoAccount')
    .limit(4);

    const filteredRelated = relatedCrops.filter((c: any) => c.farmerId !== null);

    res.json({ success: true, data: cropObj, related: filteredRelated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
