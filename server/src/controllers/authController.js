import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lab_fallback_secret_key_123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('assignedLabId', 'labName labId labBlock');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Account password has not been set yet. Please check your invitation email.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedLab: user.assignedLabId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        role: req.user.role,
        assignedLab: req.user.assignedLabId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set initial password via invitation token
 * @route   POST /api/v1/auth/setup-password
 * @access  Public
 */
export const setupPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      setupToken: hashedToken,
      setupTokenExpires: { $gt: Date.now() },
      isActive: true
    }).select('+setupToken +setupTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password setup token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};
