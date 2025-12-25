import express from "express";
import Coupon from "../models/couponModel.js";
import { protect, authorize } from "../middleware/authMiddleware.js"; // <-- Use central middleware

const router = express.Router();

// 1. Validate Coupon (Public - for Checkout)
router.post("/validate", async (req, res) => {
  const { code, cartTotal } = req.body;
  
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // Comprehensive Checks:
    if (!coupon) {
        return res.status(404).json({ message: "Invalid Code" });
    }
    if (!coupon.isActive) {
        return res.status(400).json({ message: "This coupon is disabled" });
    }
    if (new Date() > new Date(coupon.expirationDate)) {
        return res.status(400).json({ message: "This coupon has expired" });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Usage limit reached" });
    }
    if (cartTotal < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order of ₹${coupon.minOrderAmount} required` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- ADMIN ROUTES (Protected by 'marketing' role) ---

// 2. Get All Coupons
router.get("/", protect, authorize('marketing'), async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
});

// 3. Create Coupon
router.post("/", protect, authorize('marketing'), async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, expirationDate, usageLimit } = req.body;
        
        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if(exists) return res.status(400).json({ message: "Coupon code already exists" });

        const coupon = await Coupon.create({
            code, discountType, discountValue, minOrderAmount, expirationDate, usageLimit
        });
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: "Invalid Coupon Data" });
    }
});

// 4. Delete Coupon
router.delete("/:id", protect, authorize('marketing'), async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon Removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting coupon" });
    }
});

export default router;