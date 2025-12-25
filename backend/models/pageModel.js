import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., "about-us"
  content: { type: String, required: true }, // Stores HTML or Text
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const Page = mongoose.model("Page", pageSchema);
export default Page;