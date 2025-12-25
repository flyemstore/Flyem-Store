import mongoose from "mongoose";

const couponSchema = mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], // Standardized names
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  minOrderAmount: { 
    type: Number, 
    default: 0 
  },
  expirationDate: { // NEW FIELD
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageLimit: { type: Number, default: 1000 }, // NEW FIELD
  usedCount: { type: Number, default: 0 }      
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;