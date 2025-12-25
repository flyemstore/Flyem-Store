import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    // Link to the User who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        size: { type: String, required: true },
        
        sku: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      
      // 👇 CRITICAL ADDITION: Qikink requires 'province', so we must save 'state' here
      state: { type: String, required: true, default: "Maharashtra" }, 
      
      zip: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    
    // Price Fields
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    // Coupon Fields
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    
    // 👇 NEW QIKINK FIELDS (This enables the dashboard integration)
    qikink_order_id: { type: String }, 
    qikink_status: { type: String, default: "Pending" },

    status: { type: String, default: "Processing" }, 
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;