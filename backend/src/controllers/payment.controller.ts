import { Request, Response } from 'express';
import { createRazorpayOrderMock, processPaymentMock } from '../services/payment.service';

export const createOrder = async (req: any, res: Response) => {
  try {
    const { amount, internalOrderId } = req.body;
    // req.user from auth middleware
    const rzpOrder = await createRazorpayOrderMock(internalOrderId, amount);
    
    res.json({ success: true, data: rzpOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: any, res: Response) => {
  try {
    const { rzpOrderId, rzpPaymentId, rzpSignature, amount, relatedOrderId, relatedAuctionId } = req.body;
    
    const transaction = await processPaymentMock(
      rzpOrderId, 
      rzpPaymentId, 
      rzpSignature, 
      req.user.id, // from auth middleware
      amount,
      relatedOrderId,
      relatedAuctionId
    );

    res.json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
