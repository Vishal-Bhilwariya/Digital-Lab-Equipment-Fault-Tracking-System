import express from 'express';
import {
  createAssistant,
  getAssistants,
  getAssistantById,
  updateAssistant,
  toggleAssistantStatus
} from '../controllers/userController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { validateCreateAssistant, validateMongoId } from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All user management routes require Admin authorization
router.use(protect);
router.use(authorizeRole(ROLES.ADMIN));

router.route('/assistants')
  .post(validateCreateAssistant, createAssistant)
  .get(getAssistants);

router.route('/assistants/:id')
  .get(validateMongoId, getAssistantById)
  .patch(validateMongoId, updateAssistant);

router.patch('/assistants/:id/status', validateMongoId, toggleAssistantStatus);

export default router;
