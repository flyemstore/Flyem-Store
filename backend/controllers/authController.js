import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

// ✅ 1. Import your new Helper (No more Nodemailer here)
import sendEmail from "../utils/sendEmail.js"; 

// (Optional) Disposable Email Blocker
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const disposableDomains = require("disposable-email-domains");

// ❌ DELETED: const transporter = ... (We don't need this anymore)

// @desc    Register user & Send Verification Email
const registerUser = asyncHandler(async (req, res) => {
  console.log("🔥🔥🔥 DEBUG: STARTING REGISTER (RESEND SDK MODE) 🔥🔥🔥"); 

  const { name, email, password } = req.body;

  // --- 🛡️ SECURITY CHECKS ---
  if (!email || !email.includes('@')) {
      res.status(400);
      throw new Error("Invalid email format.");
  }

  const domain = email.split("@")[1].trim().toLowerCase();
  const manualBlocklist = ["lawior.com", "bmail.com", "yopmail.com"]; 

  if (disposableDomains.includes(domain) || manualBlocklist.includes(domain)) {
      res.status(400);
      throw new Error("Security Alert: Temporary/Disposable emails are not allowed.");
  }

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User already exists");
  }

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false, 
    verificationToken: verifyToken
  });

  if (user) {
    console.log("✅ User created in DB. ID:", user._id);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyUrl = `${clientUrl}/verify/${verifyToken}`;
    
    const message = `
      <h1>Verify your email address</h1>
      <p>Welcome to FLYEM! Click the link below to verify your account:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;

    // ✅ CHANGED: Use sendEmail helper instead of transporter
    await sendEmail({
        email: user.email,
        subject: "Verify Your Email 🔒",
        html: message
    });

    res.status(201).json({
      message: "Registration successful! Check your email to verify."
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
       res.status(401);
       throw new Error("Please verify your email address first. Check your inbox.");
    }
    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Verify User Email
const verifyUserEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
});

// @desc    Logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

  try {
    // ✅ CHANGED: Use sendEmail helper here too
    await sendEmail({
        email: user.email,
        subject: "Password Reset Request 🔑",
        html: message
    });

    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent");
  }
};

// Placeholders
const getUserProfile = asyncHandler(async (req, res) => { res.send("profile") });
const updateUserProfile = asyncHandler(async (req, res) => { res.send("update profile") });
const getUsers = asyncHandler(async (req, res) => { res.send("get users") });
const deleteUser = asyncHandler(async (req, res) => { res.send("delete user") });
const getUserById = asyncHandler(async (req, res) => { res.send("get user by id") });
const updateUser = asyncHandler(async (req, res) => { res.send("update user") });

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  verifyUserEmail,
  forgotPassword, 
};