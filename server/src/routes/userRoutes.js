import express from 'express';
import {
  createAssistant,
  getAssistants,
  toggleAssistantStatus
} from '../controllers/userController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All assistant management routes require Admin authorization
router.use(protect);
router.use(authorizeRole(ROLES.ADMIN));

router.route('/assistants')
  .post(createAssistant)
  .get(getAssistants);

router.route('/assistants/:id/status')
  .patch(toggleAssistantStatus);

export default router;
