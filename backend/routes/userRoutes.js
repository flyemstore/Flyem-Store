import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";

// 1️⃣ Import Auth Logic (Login, Register, Profile)
import { 
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyUserEmail,
  forgotPassword 
} from "../controllers/authController.js"; 

// 2️⃣ Import Admin Logic (Get All Users, Delete, Update)
// 👇 THIS IS THE FIX: Import these from the new file we just made!
import {
  getUsers,
  deleteUser,
  getUserById,
  updateUser
} from "../controllers/userController.js";

const router = express.Router();

// ==========================================
//  USER ROUTES
// ==========================================

// Register Route & Get All Users (Admin)
router.route("/")
  .post(registerUser)   
  .get(protect, admin, getUsers); // 👈 Now uses the REAL DB logic from userController

// Login & Logout
router.post("/login", authUser);
router.post("/logout", logoutUser);

// Email Verification
router.post("/verify", verifyUserEmail);

// Profile Management
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Password Reset
router.post("/forgot-password", forgotPassword);

// Admin User Management (Delete, Get ID, Update)
router.route("/:id")
  .delete(protect, admin, deleteUser) // 👈 Uses userController
  .get(protect, admin, getUserById)   // 👈 Uses userController
  .put(protect, admin, updateUser);   // 👈 Uses userController

export default router;