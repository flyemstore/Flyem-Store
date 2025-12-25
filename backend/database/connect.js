// database/connect.js
import mongoose from 'mongoose';

export const connectDB = async () => { // Or default export if that's what you used
  try {
    // This line is where the variable is needed:
    await mongoose.connect(process.env.MONGO_URI); 

    console.log(`MongoDB Connected successfully!`);
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};