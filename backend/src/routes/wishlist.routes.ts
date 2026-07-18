import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Wishlist } from '../models/Wishlist';
import { Crop } from '../models/Crop';

const router = Router();

// GET /api/wishlist - Get buyer's wishlist
router.get('/', protect, async (req: any, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyerId: req.user.id }).populate({
      path: 'cropIds',
      populate: {
        path: 'farmerId',
        select: 'name location trustScore'
      }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ buyerId: req.user.id, cropIds: [] });
    }

    // Filter out any crops that might have been deleted but still in the wishlist array
    const validCrops = wishlist.cropIds.filter(c => c !== null);

    res.json({ success: true, data: validCrops });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wishlist/toggle - Toggle a crop in wishlist
router.post('/toggle', protect, async (req: any, res) => {
  try {
    const { cropId } = req.body;
    if (!cropId) {
      return res.status(400).json({ success: false, message: 'cropId is required' });
    }

    // Ensure crop exists
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    let wishlist = await Wishlist.findOne({ buyerId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ buyerId: req.user.id, cropIds: [] });
    }

    const index = wishlist.cropIds.indexOf(cropId);
    let wishlisted = false;
    if (index > -1) {
      wishlist.cropIds.splice(index, 1);
    } else {
      wishlist.cropIds.push(cropId);
      wishlisted = true;
    }

    await wishlist.save();
    res.json({ success: true, wishlisted, message: wishlisted ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wishlist/add - Add a crop to wishlist
router.post('/add', protect, async (req: any, res) => {
  try {
    const { cropId } = req.body;
    if (!cropId) {
      return res.status(400).json({ success: false, message: 'cropId is required' });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    let wishlist = await Wishlist.findOne({ buyerId: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ buyerId: req.user.id, cropIds: [] });
    }

    if (!wishlist.cropIds.includes(cropId)) {
      wishlist.cropIds.push(cropId);
      await wishlist.save();
    }

    res.json({ success: true, message: 'Added to wishlist', wishlisted: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wishlist/remove - Remove a crop from wishlist
router.post('/remove', protect, async (req: any, res) => {
  try {
    const { cropId } = req.body;
    if (!cropId) {
      return res.status(400).json({ success: false, message: 'cropId is required' });
    }

    let wishlist = await Wishlist.findOne({ buyerId: req.user.id });
    if (wishlist) {
      const index = wishlist.cropIds.indexOf(cropId);
      if (index > -1) {
        wishlist.cropIds.splice(index, 1);
        await wishlist.save();
      }
    }

    res.json({ success: true, message: 'Removed from wishlist', wishlisted: false });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
