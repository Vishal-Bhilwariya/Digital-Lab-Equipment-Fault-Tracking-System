import express from 'express';
import {
  createEquipment,
  getLabEquipment,
  getEquipmentByPublicId,
  getEquipmentById,
  updateEquipment,
  getEquipmentQR,
  archiveEquipment
} from '../controllers/equipmentController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// Public route for QR scan by students/Google Lens
router.get('/public/:publicId', getEquipmentByPublicId);

// Protected routes (Assistants & Admins)
router.use(protect);

router.route('/')
  .post(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), createEquipment)
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getLabEquipment);

router.route('/:id')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getEquipmentById)
  .patch(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), updateEquipment);

router.get('/:id/qr', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getEquipmentQR);
router.patch('/:id/archive', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), archiveEquipment);

export default router;
