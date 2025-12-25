import express from "express";
import Page from "../models/pageModel.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all pages
router.get("/", async (req, res) => {
  try {
    const pages = await Page.find({}).sort({ title: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET single page
router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: "Page not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// CREATE / UPDATE Page
router.post("/", protect, admin, async (req, res) => {
  const { title, slug, content, isVisible } = req.body;
  console.log("📝 Saving Page:", title, slug); // Debug Log

  try {
    const exists = await Page.findOne({ slug });
    
    if (exists) {
      console.log("✏️ Updating existing page...");
      exists.title = title;
      exists.content = content;
      exists.isVisible = isVisible;
      const updatedPage = await exists.save();
      return res.json(updatedPage);
    } else {
      console.log("✨ Creating new page...");
      const page = await Page.create({ title, slug, content, isVisible });
      return res.status(201).json(page);
    }
  } catch (error) {
    console.error("🔥 Page Save Error:", error); // Shows the REAL error in terminal
    res.status(500).json({ message: error.message }); // Sends real error to frontend
  }
});

// DELETE Page
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (page) {
      await page.deleteOne();
      res.json({ message: "Page removed" });
    } else {
      res.status(404).json({ message: "Page not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;