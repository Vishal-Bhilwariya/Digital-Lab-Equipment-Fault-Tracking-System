import express from 'express';
import {
  createPublicTicket,
  getLabTickets,
  getTicketById,
  updateTicketStatus,
  trackTicket
} from '../controllers/ticketController.js';
import { protect, authorizeRole } from '../middleware/auth.js';
import {
  validateCreateTicket,
  validateUpdateTicketStatus,
  validateMongoId
} from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';
import { upload } from '../services/uploadService.js';

const router = express.Router();

// ── Public Routes (no auth required) ─────────────────────────────────────────
// Student fault submission via QR scan
router.post('/public', upload.single('photo'), validateCreateTicket, createPublicTicket);
// Student ticket status tracking
router.get('/track', trackTicket);

// ── Authenticated Routes ──────────────────────────────────────────────────────
router.use(protect);

router.route('/')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getLabTickets);

router.route('/:id')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, getTicketById);

// Both Admin and Assistant can update ticket status
router.patch(
  '/:id/status',
  authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN),
  validateMongoId,
  validateUpdateTicketStatus,
  updateTicketStatus
);

export default router;
