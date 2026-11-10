import express from 'express';
import {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  archiveLab,
  reactivateLab
} from '../controllers/labController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { validateCreateLab, validateMongoId } from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorizeRole(ROLES.ADMIN), validateCreateLab, createLab)
  .get(getLabs);

router.route('/:id')
  .get(validateMongoId, getLabById)
  .patch(authorizeRole(ROLES.ADMIN), validateMongoId, updateLab);

router.patch('/:id/archive', authorizeRole(ROLES.ADMIN), validateMongoId, archiveLab);
router.patch('/:id/reactivate', authorizeRole(ROLES.ADMIN), validateMongoId, reactivateLab);

export default router;
