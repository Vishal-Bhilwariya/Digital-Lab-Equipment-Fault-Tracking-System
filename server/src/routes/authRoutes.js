import express from 'express';
import { login, getMe, setupPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/setup-password', setupPassword);
router.get('/me', protect, getMe);

export default router;
