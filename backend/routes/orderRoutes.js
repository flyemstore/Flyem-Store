import express from "express";
import axios from "axios";
import Order from "../models/orderModel.js";
import { protect, admin, authorize } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js"; 
import { createQikinkOrder } from "../utils/qikinkService.js"; 

const router = express.Router();

// ---------------------------------------------------------
//  USER ROUTES
// ---------------------------------------------------------

// 1. PLACE ORDER (Updated for Real Razorpay Logic)
router.post("/", protect, async (req, res) => {
  console.log("📝 ORDER ATTEMPT START for user:", req.user.email); 

  const { 
    orderItems, shippingAddress, paymentMethod, itemsPrice, 
    totalPrice, couponCode, discountAmount, customerEmail, customerName,
    paymentResult // 👈 NEW: Receive the payment proof from frontend
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  try {
    // 👇 UPDATED PAYMENT LOGIC
    // We default to false (Not Paid)
    let isPaid = false;
    let paidAt = null;

    // Only mark as paid if we received valid proof from Razorpay
    if (paymentMethod === "Razorpay" && paymentResult && paymentResult.status === "completed") {
       isPaid = true;
       paidAt = Date.now();
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      totalPrice,
      couponCode,
      discountAmount,
      user: req.user._id,
      
      // Payment Status
      isPaid: isPaid, 
      paidAt: paidAt,
      paymentResult: paymentResult, // Save the transaction ID
      
      // Order Status
      status: isPaid ? "Processing" : "Payment Failed" // Or "Order Placed - Pending Payment"
    });

    const createdOrder = await order.save();
    console.log("✅ DB SAVE SUCCESS! Order ID:", createdOrder._id);

    // --- 📧 SEND CONFIRMATION EMAIL ---
    if (isPaid) { // Only send email if payment was successful
        try {
            const emailSubject = `Order Confirmed: #${createdOrder._id.toString().slice(-6).toUpperCase()}`;
            const emailMessage = `Hi ${customerName || "Customer"},\n\nThank you for your order!\n\nOrder ID: ${createdOrder._id}\nTotal Amount: ₹${totalPrice}\n\nWe will notify you when it ships.\n\n- The FLYEM Team`;
            
            await sendEmail({
                email: customerEmail || req.user.email,
                subject: emailSubject,
                text: emailMessage, 
                html: `<p>${emailMessage.replace(/\n/g, '<br>')}</p>` 
            });
            console.log("📧 Order Confirmation Email Sent!");
        } catch (emailError) {
            console.error("⚠️ Email failed to send:", emailError.message);
        }
    }

    // --- 🏭 QIKINK AUTOMATION ---
    // Only send to Qikink if the user actually PAID
    if(process.env.QIKINK_CLIENT_ID && isPaid) {
        console.log("🚀 Starting Qikink Sync...");
        createdOrder.user = req.user; 

        try {
            const qikinkResponse = await createQikinkOrder(createdOrder);

            if (qikinkResponse && qikinkResponse.order_id) {
                createdOrder.qikink_order_id = qikinkResponse.order_id.toString();
                createdOrder.qikink_status = "Placed"; 
                createdOrder.status = "Processing";
                await createdOrder.save(); 
                console.log("✅ Qikink ID Saved to DB:", createdOrder.qikink_order_id);
            }
        } catch (qikinkErr) {
            console.error("⚠️ Qikink Order Failed:", qikinkErr.message);
        }
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("❌ ORDER SAVE FAILED:", error.message);
    res.status(500).json({ message: "Server Error during Order" });
  }
});

// 2. GET MY ORDERS
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

// 3. GET ORDER BY ID
router.get("/:id", protect, async (req, res, next) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(); 
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");
    
    if (order) {
        if (req.user.isAdmin || req.user.role === 'superadmin' || order.user._id.equals(req.user._id)) {
            res.json(order);
        } else {
            res.status(401).json({ message: "Not authorized" });
        }
    } else {
        res.status(404).json({ message: "Order not found" });
    }
});

// 4. CANCEL ORDER
router.put("/:id/cancel", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = "Cancelled";
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ---------------------------------------------------------
//  ADMIN ROUTES
// ---------------------------------------------------------

// 5. GET ALL ORDERS (Admin)
router.get("/", protect, authorize('orders'), async (req, res) => {
  try {
      const orders = await Order.find({}).populate("user", "id name email").sort({ createdAt: -1 });
      res.json(orders);
  } catch (error) {
      res.status(500).json({ message: "Server Error Fetching All Orders" });
  }
});

// 6. UPDATE ORDER STATUS (Admin)
router.put("/:id/status", protect, authorize('orders'), async (req, res) => {
  try {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.status = req.body.status || "Delivered";
        
        if (order.status === "Delivered") {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            
            if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
        }
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        res.status(404).json({ message: "Order not found" });
      }
  } catch (error) {
      res.status(500).json({ message: "Update Failed" });
  }
});

// URL to call: https://flyem-backend.onrender.com/api/orders/fix-revenue
router.get("/fix-revenue", async (req, res) => {
  try {
    const ordersToFix = await Order.find({ 
      paymentMethod: "Razorpay", 
      isPaid: false 
    });

    console.log(`Found ${ordersToFix.length} orders to fix.`);

    const updatedOrders = [];
    for (const order of ordersToFix) {
      order.isPaid = true;
      order.paidAt = order.createdAt; 
      order.status = "Processing";    
      
      const savedOrder = await order.save();
      updatedOrders.push(savedOrder);
    }

    res.json({
      message: "Revenue Fix Successful",
      fixedCount: updatedOrders.length,
      updatedOrders
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;