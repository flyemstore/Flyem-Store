import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  name: { type: String }, // Original filename
  size: { type: Number }, // Size in bytes
}, { timestamps: true });

const Media = mongoose.model("Media", mediaSchema);
export default Media;