import mongoose from 'mongoose';
import dotenv from 'dotenv';
// 👇 Ensure this path matches your file structure (likely lowercase 'product.js' based on your last message)
import Product from './models/productModel.js'; 

dotenv.config();

const products = [
  {
    name: "Classic Flyem Black Tee",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    description: "Premium cotton classic fit t-shirt.",
    brand: "Flyem",
    category: "Men",
    price: 499,
    countInStock: 10,
    rating: 4.5,
    numReviews: 1,
    sku: "FLY-BLK-001" // 👈 Added SKU
  },
  {
    name: "Urban White Oversized",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    description: "Oversized fit for the ultimate street style.",
    brand: "Flyem",
    category: "Unisex",
    price: 699,
    countInStock: 15,
    rating: 5.0,
    numReviews: 2,
    sku: "FLY-WHT-002" // 👈 Added SKU
  },
  {
    name: "Midnight Blue Hoodie",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    description: "Warm, cozy, and stylish for winter nights.",
    brand: "Flyem",
    category: "Hoodies",
    price: 1299,
    countInStock: 5,
    rating: 4.0,
    numReviews: 1,
    sku: "FLY-BLU-003" // 👈 Added SKU
  }
];

const importData = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    console.log("🗑️ Clearing old products...");
    await Product.deleteMany(); 

    console.log("📤 Uploading new products...");
    await Product.insertMany(products);

    console.log("🎉 Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();