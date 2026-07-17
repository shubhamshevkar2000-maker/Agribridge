import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middlewares/auth.middleware';
import { Crop } from '../models/Crop';

const router = Router();

const cropSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  pricePerUnit: z.number().positive(),
  isOrganic: z.boolean().default(false),
  qualityGrade: z.string().optional(),
  harvestDate: z.string().optional(), // ISO date string
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

// Add a new crop to inventory
router.post('/', protect, async (req: any, res) => {
  try {
    const validatedData = cropSchema.parse(req.body);
    
    const crop = await Crop.create({
      ...validatedData,
      farmerId: req.user.id,
      status: 'listed'
    });
    
    res.status(201).json({ success: true, data: crop });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.issues });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a crop
router.put('/:id', protect, async (req: any, res) => {
  try {
    const validatedData = cropSchema.parse(req.body);
    
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id }, // ensure they own it
      validatedData,
      { new: true }
    );
    
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    
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
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmerId: req.user.id });
    
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    
    res.json({ success: true, message: 'Crop deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get all listed crops (for Marketplace)
router.get('/', protect, async (req, res) => {
  try {
    // Basic filter example
    const { category, isOrganic, search } = req.query;
    let query: any = { status: 'listed' };
    
    if (category && category !== 'All') query.category = category;
    if (isOrganic === 'true') query.isOrganic = true;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const crops = await Crop.find(query).populate('farmerId', 'name location trustScore').sort({ createdAt: -1 });
    res.json({ success: true, data: crops });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get a single crop by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmerId', 'name location trustScore');
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    res.json({ success: true, data: crop });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
