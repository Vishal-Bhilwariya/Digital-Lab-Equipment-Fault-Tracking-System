import express from 'express';
import {
  createPublicTicket,
  getLabTickets,
  getTicketById,
  updateTicketStatus,
  trackTicket
} from '../controllers/ticketController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';
import { upload } from '../services/uploadService.js';

const router = express.Router();

// Public endpoints for students
router.post('/public', upload.single('photo'), createPublicTicket);
router.get('/track', trackTicket);

// Protected endpoints for Lab Assistants and Admins
router.use(protect);

router.route('/')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getLabTickets);

router.route('/:id')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getTicketById);

router.route('/:id/status')
  .patch(authorizeRole(ROLES.ASSISTANT), updateTicketStatus);

export default router;
