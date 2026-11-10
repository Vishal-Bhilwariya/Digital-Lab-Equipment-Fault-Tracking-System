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
    assignedLabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: function () {
        return this.role === ROLES.ASSISTANT;
      }
    },
    setupToken: {
      type: String,
      select: false
    },
    setupTokenExpires: {
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
  // Token valid for 48 hours
  this.setupTokenExpires = Date.now() + 48 * 60 * 60 * 1000;
  return setupTokenRaw;
};

const User = mongoose.model('User', userSchema);
export default User;
