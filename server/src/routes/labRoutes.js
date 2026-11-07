import express from 'express';
import {
  createLab,
  getLabs,
  getLabById,
  archiveLab
} from '../controllers/labController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorizeRole(ROLES.ADMIN), createLab)
  .get(getLabs);

router.route('/:id')
  .get(getLabById);

router.route('/:id/archive')
  .patch(authorizeRole(ROLES.ADMIN), archiveLab);

export default router;
