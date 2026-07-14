import { Transaction } from '../models/Transaction';
import { Order } from '../models/Order';
import { createNotification } from './notification.service';
import crypto from 'crypto';

export const createRazorpayOrderMock = async (orderId: string, amount: number) => {
  // Mock Razorpay order creation
  const rzpOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  
  return {
    id: rzpOrderId,
    entity: 'order',
    amount: amount * 100, // Razorpay takes paise
    currency: 'INR',
    receipt: orderId,
    status: 'created',
  };
};

export const processPaymentMock = async (
  rzpOrderId: string,
  rzpPaymentId: string,
  rzpSignature: string,
  userId: string,
  amount: number,
  relatedOrderId?: string,
  relatedAuctionId?: string
) => {
  // In real implementation, verify signature:
  // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(order_id + '|' + payment_id).digest('hex');
  // if (expectedSignature !== rzpSignature) throw Error;

  const transaction = await Transaction.create({
    payerId: userId,
    payeeId: userId, 
    amount: amount,
    mode: 'upi',
    status: 'success',
    orderId: relatedOrderId
  });

  if (relatedOrderId) {
    await Order.findByIdAndUpdate(relatedOrderId, { paymentStatus: 'completed' });
  }

  // Notify user of successful payment
  await createNotification({
    userId,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of ₹${amount} was successfully processed via UPI. Txn ID: ${rzpPaymentId}`,
  });

  return transaction;
};
