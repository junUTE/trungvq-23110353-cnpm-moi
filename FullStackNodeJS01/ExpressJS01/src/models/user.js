const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, sparse: true },
  email: String,
  password: String,
  role: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
