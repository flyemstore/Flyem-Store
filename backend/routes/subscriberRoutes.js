import express from "express";
import Subscriber from "../models/subscriberModel.js";
import nodemailer from "nodemailer";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ZOHO EMAIL CONFIGURATION ---
// We use the environment variables we just set
const transporter = process.env.EMAIL_USER ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.zoho.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
}) : null;

// @desc    Subscribe to newsletter (Public)
// @route   POST /api/subscribers
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email." });
  }

  try {
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // 1. Save to Database
    await Subscriber.create({ email });

    // 2. Send Welcome Email (via Zoho)
    if (transporter) {
        const mailOptions = {
          from: `"FLYEM Store" <${process.env.EMAIL_USER}>`, // Must match your Zoho email
          to: email,
          subject: "Welcome to the Inner Circle! 🚀",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h1 style="text-transform: uppercase;">Welcome to FLYEM.</h1>
              <p>You're officially on the list.</p>
              <p>Watch out for exclusive drops and secret sales.</p>
              <br/>
              <p style="font-size: 12px; color: #888;">© FLYEM Store</p>
            </div>
          `,
        };
        
        // Send and log success/error
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Zoho Email Failed:", err);
            else console.log("Zoho Email Sent:", info.response);
        });
    } else {
        console.log(`[Simulation] Email would be sent to: ${email}`);
    }

    res.status(201).json({ message: "Success! You are subscribed." });

  } catch (error) {
    console.error("Subscriber Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/subscribers
router.get("/", protect, admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

export default router;