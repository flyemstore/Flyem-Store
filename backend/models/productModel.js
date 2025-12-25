import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { type: String, required: true },
    image: { type: String, required: true }, // Main Image
    brand: { type: String, default: "FLYEM" },
    
    // 👇 ADDED THIS FIELD (Critical Fix)
    color: { type: String, required: false, default: "" }, 
    
    category: { type: String, required: true },
    description: { type: String, required: true },
    
    // 👇 NEW: Size Chart & Gallery
    sizeChart: { type: String }, 
    gallery: [{ type: String }],

    // 👇 NEW: Reviews
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    
    price: { type: Number, required: true, default: 0 },
    
    // 👇 NEW: Variants System (Critical for Qikink)
    variants: [
      {
        size: { type: String, required: true }, // S, M, L, XL
        sku: { type: String, required: true },  // Store SKU
        stock: { type: Number, required: true, default: 0 }
      }
    ],

    // Backward compatibility (Auto-calculated from variants)
    countInStock: { type: Number, required: true, default: 0 },
    
    saleDeadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;