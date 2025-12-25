import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js'; // Ensure you have this or use standard try/catch

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   GET /api/payment/key
// @desc    Send Razorpay Key ID to frontend
// @access  Public
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

// @route   POST /api/payment/create-order
// @desc    Create a new order in Razorpay
// @access  Private
router.post('/create-order', asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paisa (e.g., ₹10 = 1000 paisa)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500);
    throw new Error(error.message || 'Razorpay Order Creation Failed');
  }
}));

// @route   POST /api/payment/verify
// @desc    Verify the payment signature
// @access  Private
router.post('/verify', asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.json({ status: 'success', message: 'Payment Verified' });
  } else {
    res.status(400);
    throw new Error('Invalid Signature');
  }
}));

export default router;