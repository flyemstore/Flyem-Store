import express from "express";
import SiteSettings from "../models/siteModel.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET Settings (With Auto-Cleanup)
router.get("/", async (req, res) => {
  try {
    // 1. Fetch ALL settings documents, sorted by newest first
    const allSettings = await SiteSettings.find().sort({ createdAt: -1 });

    // Case A: No settings exist? Create one.
    if (allSettings.length === 0) {
        const newSettings = await SiteSettings.create({});
        return res.json(newSettings);
    }

    // Case B: Duplicates found? (The source of your bug!)
    if (allSettings.length > 1) {
        console.log(`⚠️ Found ${allSettings.length} settings documents. Deleting duplicates...`);
        
        // Keep the newest one ([0]), delete the rest
        const [newest, ...duplicates] = allSettings;
        const idsToDelete = duplicates.map(doc => doc._id);
        
        await SiteSettings.deleteMany({ _id: { $in: idsToDelete } });
        
        // Return the one survivor
        return res.json(newest);
    }

    // Case C: Normal (Only 1 exists)
    res.json(allSettings[0]);

  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE Settings
router.put("/", protect, admin, async (req, res) => {
  try {
    // 1. Clean data (Remove ID to prevent crashes)
    const data = { ...req.body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.__v;

    // 2. Update the SINGLE remaining document
    // We use sort: { createdAt: -1 } just to be safe, but now there should only be one.
    const updatedSettings = await SiteSettings.findOneAndUpdate(
        {}, 
        { $set: data }, 
        { new: true, upsert: true, sort: { createdAt: -1 } }
    );
    
    res.json(updatedSettings);
  } catch (error) {
    console.error("Settings Update Failed:", error);
    res.status(400).json({ message: "Update Failed", error: error.message });
  }
});

export default router;