import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middlewares/auth.middleware';
import { Loan } from '../models/Loan';
import { User } from '../models/User';

const router = Router();

const applyLoanSchema = z.object({
  bankId: z.string().optional(),
  amountRequested: z.number().positive(),
  tenure: z.number().positive(),
});

// POST /api/loans/apply
router.post('/apply', protect, async (req: any, res) => {
  try {
    const validatedData = applyLoanSchema.parse(req.body);
    
    // Find a default bank if none provided
    let bankId = validatedData.bankId;
    if (!bankId) {
      const bank = await User.findOne({ role: 'bank' });
      if (!bank) {
        return res.status(400).json({ success: false, message: 'No banks available in the system' });
      }
      bankId = bank._id.toString();
    }

    const loan = await Loan.create({
      farmerId: req.user.id,
      bankId,
      amountRequested: validatedData.amountRequested,
      tenure: validatedData.tenure,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: (error as any).errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/loans
router.get('/', protect, async (req: any, res) => {
  try {
    // If bank, fetch all loans assigned to them. If farmer, fetch their applied loans.
    const query = req.user.role === 'bank' ? { bankId: req.user.id } : { farmerId: req.user.id };
    
    const loans = await Loan.find(query)
      .populate('farmerId', 'name email phone location')
      .populate('bankId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/loans/:id
router.put('/:id', protect, async (req: any, res) => {
  try {
    const { status, amountApproved } = req.body;
    if (req.user.role !== 'bank') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.bankId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (status) {
      loan.status = status;
    }
    if (amountApproved !== undefined) {
      loan.amountApproved = amountApproved;
    } else if (status === 'approved' && !loan.amountApproved) {
      loan.amountApproved = loan.amountRequested;
    }

    await loan.save();
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
