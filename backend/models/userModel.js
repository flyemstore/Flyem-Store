import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  
  // Permissions
  isAdmin: { type: Boolean, required: true, default: false },
  role: { 
      type: String, 
      enum: ['superadmin', 'content', 'catalog', 'orders', 'marketing', 'customer'], 
      default: 'customer' 
  },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,

  // Password Reset Fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Check password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 👇 FIXED: Encrypt password (Async style, NO 'next' parameter)
userSchema.pre("save", async function () {
  // If password is NOT modified (e.g. just updating token), exit function
  if (!this.isModified("password")) {
    return;
  }

  // Generate salt and hash
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Hash it and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set expire (10 minutes from now)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;