import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    passwordHash: {
      type: String,
      select: false // Exclude from queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required']
    },
    rollNumber: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    assistantId: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    assignedLabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: function () {
        return this.role === ROLES.ASSISTANT;
      }
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    // Setup token for invitation links (legacy / fallback)
    setupToken: {
      type: String,
      select: false
    },
    setupTokenExpires: {
      type: Date,
      select: false
    },
    // Forgot Password OTP fields
    resetPasswordOtp: {
      type: String,
      select: false
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false
    },
    resetPasswordOtpAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    resetPasswordOtpCooldown: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Generate setup token for invited assistants
userSchema.methods.createSetupToken = function () {
  const setupTokenRaw = crypto.randomBytes(32).toString('hex');
  this.setupToken = crypto.createHash('sha256').update(setupTokenRaw).digest('hex');
  this.setupTokenExpires = Date.now() + 48 * 60 * 60 * 1000;
  return setupTokenRaw;
};

// Generate 6-digit OTP for Forgot Password
userSchema.methods.createPasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetPasswordOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
  this.resetPasswordOtpAttempts = 0;
  this.resetPasswordOtpCooldown = Date.now() + 60 * 1000; // 60s cooldown for resend
  return otp;
};

const User = mongoose.model('User', userSchema);
export default User;
