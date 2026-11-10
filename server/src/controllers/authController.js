import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { sendPasswordResetOtp } from '../services/emailService.js';

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
 * @desc    Authenticate user (Administrator, Lab Assistant, Student)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, rollNumber, password } = req.body;

    let user;
    if (rollNumber) {
      // Student login using Roll Number
      user = await User.findOne({
        rollNumber: rollNumber.trim().toUpperCase(),
        role: ROLES.STUDENT
      }).select('+passwordHash');
    } else if (email) {
      // Staff or Student login using Email or Assistant ID
      const cleaned = email.trim();
      user = await User.findOne({
        $or: [
          { email: cleaned.toLowerCase() },
          { assistantId: cleaned.toUpperCase() }
        ]
      })
        .select('+passwordHash')
        .populate('assignedLabId', 'labName labId labBlock isActive');
    }

    // Generic error message to prevent account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/roll number and password.'
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
        message: 'Account password has not been set yet. Please check your invitation email.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/roll number and password.'
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
        rollNumber: user.rollNumber || null,
        assistantId: user.assistantId || null,
        mustChangePassword: !!user.mustChangePassword,
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
        rollNumber: user.rollNumber || null,
        assistantId: user.assistantId || null,
        mustChangePassword: !!user.mustChangePassword,
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
 * @desc    Request 6-digit OTP for Forgot Password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const targetEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: targetEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordOtpAttempts +resetPasswordOtpCooldown'
    );

    // Security requirement: "Do not reveal whether an email exists."
    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        message: 'If this email address is registered, a 6-digit OTP code has been dispatched.'
      });
    }

    // Rate-limit resend cooldown (60 seconds)
    if (user.resetPasswordOtpCooldown && user.resetPasswordOtpCooldown > Date.now()) {
      const waitSeconds = Math.ceil((user.resetPasswordOtpCooldown - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting a new OTP.`
      });
    }

    // Generate, hash, and store 6-digit OTP
    const rawOtp = user.createPasswordResetOtp();
    await user.save();

    // Send email using reusable Nodemailer service
    await sendPasswordResetOtp({
      toEmail: user.email,
      name: user.name,
      otp: rawOtp
    });

    res.status(200).json({
      success: true,
      message: 'If this email address is registered, a 6-digit OTP code has been dispatched.',
      // In development mode, provide OTP for direct testing convenience
      ...(process.env.NODE_ENV === 'development' && { devOtpPreview: rawOtp })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 6-digit OTP for Forgot Password
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const targetEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: targetEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordOtpAttempts'
    );

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new one.'
      });
    }

    // Check expiry (5 minutes)
    if (user.resetPasswordOtpExpires < Date.now()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired (valid for 5 minutes). Please request a new one.'
      });
    }

    // Check attempt limits (max 5)
    if (user.resetPasswordOtpAttempts >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. For security, please request a fresh OTP.'
      });
    }

    // Verify hash
    const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (inputHash !== user.resetPasswordOtp) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      await user.save();
      const remainingAttempts = 5 - user.resetPasswordOtpAttempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. You have ${remainingAttempts} attempt(s) remaining.`
      });
    }

    // OTP verified successfully! Generate single-use resetToken (valid 10 mins)
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
    // OTP can only be used once
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now set your new password.',
      resetToken: rawResetToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set new password after OTP verification
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const targetEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: targetEmail }).select(
      '+passwordHash +resetPasswordToken +resetPasswordTokenExpires'
    );

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset session invalid or expired. Please request a new OTP.'
      });
    }

    if (user.resetPasswordTokenExpires < Date.now()) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Password reset session has expired. Please verify OTP again.'
      });
    }

    // Verify resetToken hash
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    if (hashedToken !== user.resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token. Please verify OTP again.'
      });
    }

    // Save new hashed password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    user.mustChangePassword = false;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new credentials.',
      token
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

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy invitation setup password
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
        message: 'Invalid or expired password setup link.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin reset password
 */
export const adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = true;
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
 * Admin resend invite
 */
export const resendInvite = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { generateTempPassword } = await import('../utils/constants.js');
    const { sendAssistantCreatedEmail } = await import('../services/emailService.js');

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(tempPassword, salt);
    user.mustChangePassword = true;
    await user.save();

    await sendAssistantCreatedEmail({
      toEmail: user.email,
      name: user.name,
      assistantId: user.assistantId || 'AST-REGEN',
      tempPassword,
      loginUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`
    });

    res.status(200).json({
      success: true,
      message: `New temporary credentials sent to ${user.email}`,
      ...(process.env.NODE_ENV === 'development' && { tempPassword })
    });
  } catch (error) {
    next(error);
  }
};
