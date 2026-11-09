import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

// ── Helper: generate signed JWT ───────────────────────────────────────────────
const generateToken = (id) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_here') {
    console.warn('[AUTH] ⚠️  JWT_SECRET is using an insecure placeholder. Set a strong secret in .env');
  }
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'lab_fallback_secret_DO_NOT_USE_IN_PROD',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select passwordHash (excluded by default via schema)
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .populate('assignedLabId', 'labName labId labBlock isActive');

    // Use same message for missing user & wrong password (prevents user enumeration)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Account password has not been set yet. Please check your invitation email and complete the account setup.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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
        mobile: user.mobile,
        role: user.role,
        assignedLab: user.assignedLabId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware, re-fetch to ensure fresh data
    const user = await User.findById(req.user._id)
      .populate('assignedLabId', 'labName labId labBlock isActive');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        assignedLab: user.assignedLabId || null,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set initial password via invitation token (sent to new assistants by email)
 * @route   POST /api/v1/auth/setup-password
 * @access  Public
 */
export const setupPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      setupToken: hashedToken,
      setupTokenExpires: { $gt: Date.now() },
      isActive: true
    }).select('+setupToken +setupTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password setup link. Please ask your administrator to resend the invitation.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (authenticated user changes their own password)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Re-fetch user with passwordHash (excluded by default)
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Prevent setting the same password
    const isSame = await user.matchPassword(newPassword);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Issue a fresh JWT so the user doesn't get logged out
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin resets an assistant's password directly (bypasses email token flow)
 * @route   POST /api/v1/auth/admin/reset-password/:userId
 * @access  Private (Admin only)
 */
export const adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    // Clear any pending setup token
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password for ${user.name} (${user.email}) has been reset successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin resends setup invitation email to an assistant
 * @route   POST /api/v1/auth/resend-invite/:userId
 * @access  Private (Admin only)
 */
export const resendInvite = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('+setupToken +setupTokenExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'This user has already set up their password. Use "Reset Password" instead.'
      });
    }

    // Generate a fresh setup token
    const rawSetupToken = user.createSetupToken();
    await user.save();

    // Send invitation email
    const { sendAssistantSetupEmail } = await import('../services/emailService.js');
    const setupUrl = await sendAssistantSetupEmail({
      toEmail: user.email,
      name: user.name,
      setupToken: rawSetupToken
    });

    res.status(200).json({
      success: true,
      message: `Invitation email resent to ${user.email}`,
      ...(process.env.NODE_ENV === 'development' && { setupUrl })
    });
  } catch (error) {
    next(error);
  }
};
