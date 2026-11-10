import express from 'express';
import {
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  setupPassword,
  changePassword,
  adminResetPassword,
  resendInvite
} from '../controllers/authController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import {
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
  validateSetupPassword,
  validateChangePassword
} from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-otp', validateVerifyOtp, verifyOtp);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/setup-password', validateSetupPassword, setupPassword);

// ── Authenticated Routes ──────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.post('/change-password', protect, validateChangePassword, changePassword);

// ── Admin-only Routes ─────────────────────────────────────────────────────────
router.post('/admin/reset-password/:userId', protect, authorizeRole(ROLES.ADMIN), adminResetPassword);
router.post('/resend-invite/:userId', protect, authorizeRole(ROLES.ADMIN), resendInvite);

export default router;
