import express from 'express';
import {
  logCalibration,
  getEquipmentCalibrationHistory,
  getCalibrationSchedule
} from '../controllers/calibrationController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { validateLogCalibration, validateMongoId } from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

// Log a new calibration event (immutable record)
router.post('/', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateLogCalibration, logCalibration);

// Get calibration schedule (priority-sorted: Overdue → Due Today → Upcoming)
router.get('/schedule', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getCalibrationSchedule);

// Get full calibration history for a specific equipment item
router.get('/equipment/:id', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, getEquipmentCalibrationHistory);

export default router;
