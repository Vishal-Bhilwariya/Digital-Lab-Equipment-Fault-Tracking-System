import express from 'express';
import {
  logCalibration,
  getEquipmentCalibrationHistory,
  getCalibrationSchedule
} from '../controllers/calibrationController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRole(ROLES.ASSISTANT), logCalibration);
router.get('/schedule', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getCalibrationSchedule);
router.get('/equipment/:id', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getEquipmentCalibrationHistory);

export default router;
