import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
// 👇 Checking both common names for the User model. 
// If your file is named 'User.js', this will work. 
// If it's 'userModel.js', you might need to adjust this line.
import User from './models/userModel.js'; 

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Cloud...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    // 1. Delete old users (optional, keeps it clean)
    await User.deleteMany();
    console.log("🗑️ Old users cleared.");

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Create Admin User
    const adminUser = {
      name: "Yash Admin",
      email: "admin@example.com",
      password: hashedPassword,
      isAdmin: true, // 👑 THIS IS THE KEY
    };

    await User.create(adminUser);

    console.log("👑 Admin User Created Successfully!");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Pass: 123456");
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();