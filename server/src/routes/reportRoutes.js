import express from 'express';
import {
  getDashboardStats,
  getAdminCalibratedReport,
  getAdminDamagedReport
} from '../controllers/reportController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/calibrated-equipment', authorizeRole(ROLES.ADMIN), getAdminCalibratedReport);
router.get('/damaged-equipment', authorizeRole(ROLES.ADMIN), getAdminDamagedReport);

export default router;
