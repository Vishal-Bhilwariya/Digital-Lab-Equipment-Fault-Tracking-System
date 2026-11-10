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
import {
  validateCreateEquipment,
  validateUpdateEquipment,
  validateMongoId
} from '../middleware/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// ── Public Route (no auth) — QR scan by students / Google Lens ───────────────
// MUST be declared before router.use(protect) to remain public
router.get('/public/:publicId', getEquipmentByPublicId);

// ── All routes below require authentication ───────────────────────────────────
router.use(protect);

router.route('/')
  .post(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateCreateEquipment, createEquipment)
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), getLabEquipment);

// ── Specific sub-resource routes BEFORE /:id to avoid route conflict ──────────
router.get('/:id/qr', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, getEquipmentQR);
router.patch('/:id/archive', authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, archiveEquipment);

// ── Generic /:id routes LAST ──────────────────────────────────────────────────
router.route('/:id')
  .get(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, getEquipmentById)
  .patch(authorizeRole(ROLES.ASSISTANT, ROLES.ADMIN), validateMongoId, validateUpdateEquipment, updateEquipment);

export default router;
