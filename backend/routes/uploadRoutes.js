import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
// 👇 1. IMPORT SECURITY MIDDLEWARE
import { protect, admin } from '../middleware/authMiddleware.js'; 

dotenv.config();

const router = express.Router();

// Test Route (Optional: You can keep this public or protect it too)
router.get('/', (req, res) => {
  res.send('✅ Upload route is WORKING!');
});

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'flyem_store', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// 3. Initialize Multer
const upload = multer({ storage });

// 4. Create the Upload Route (SECURED)
// 👇 Added 'protect' and 'admin' here. 
// Now, only logged-in Admins can upload files.
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  res.send({
    message: 'Image uploaded',
    image: req.file.path, 
  });
});

export default router;