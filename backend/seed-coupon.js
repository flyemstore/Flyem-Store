import mongoose from "mongoose";
import Coupon from "./models/couponModel.js"; // Note: Adjust path if needed
import "dotenv/config";

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("DB Connected");
    
    try {
      await Coupon.create({
        code: "FLYEM10",
        discountPercentage: 10
      });
      console.log("✅ Coupon 'FLYEM10' Created!");
    } catch (e) {
      console.log("Error (Maybe already exists):", e.message);
    }
    
    process.exit();
  });