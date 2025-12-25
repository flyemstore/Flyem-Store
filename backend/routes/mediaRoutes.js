import express from "express";
import Media from "../models/mediaModel.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
// Note: We assume you have the upload middleware logic in your main server or a separate utility. 
// For simplicity, we'll reuse the logic you likely have in your upload route, 
// but wrapping it here for the Media Manager.

const router = express.Router();

// Middleware to check Admin
const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "flyem_secret_123");
      const user = await User.findById(decoded.id);
      if (user && user.isAdmin) {
        req.user = user;
        next();
      } else res.status(401).json({ message: "Not authorized as admin" });
    } catch (error) { res.status(401).json({ message: "Token failed" }); }
  } else res.status(401).json({ message: "No token" });
};

// 1. GET ALL MEDIA
router.get("/", protectAdmin, async (req, res) => {
  try {
    const files = await Media.find({}).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

// 2. SAVE MEDIA (After upload)
// This route is called AFTER the file is physically uploaded to /uploads
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { url, type, name, size } = req.body;
    const media = new Media({ url, type, name, size });
    const savedMedia = await media.save();
    res.status(201).json(savedMedia);
  } catch (error) { res.status(500).json({ message: "Failed to save media" }); }
});

// 3. DELETE MEDIA
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    // Optional: You would also delete the physical file using fs.unlink here
    res.json({ message: "File removed" });
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

export default router;