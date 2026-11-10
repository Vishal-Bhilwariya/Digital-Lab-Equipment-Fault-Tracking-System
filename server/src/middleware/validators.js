import { body, param, query, validationResult } from 'express-validator';

/**
 * Run validation results and return 422 on first error
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth Validators ──────────────────────────────────────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

export const validateSetupPassword = [
  body('token')
    .trim()
    .notEmpty().withMessage('Setup token is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  validate
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  validate
];

// ── User Validators ───────────────────────────────────────────────────────────
export const validateCreateAssistant = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .isMobilePhone('any').withMessage('Please provide a valid mobile number'),
  body('assignedLabId')
    .trim()
    .notEmpty().withMessage('Assigned laboratory ID is required')
    .isMongoId().withMessage('Invalid laboratory ID format'),
  validate
];

// ── Lab Validators ────────────────────────────────────────────────────────────
export const validateCreateLab = [
  body('labName')
    .trim()
    .notEmpty().withMessage('Lab name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Lab name must be 2–150 characters'),
  body('labBlock')
    .trim()
    .notEmpty().withMessage('Lab block is required')
    .isLength({ min: 1, max: 50 }).withMessage('Lab block must be 1–50 characters'),
  validate
];

// ── Equipment Validators ──────────────────────────────────────────────────────
export const validateCreateEquipment = [
  body('name')
    .trim()
    .notEmpty().withMessage('Equipment name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Equipment name must be 2–200 characters'),
  body('serialNumber')
    .trim()
    .notEmpty().withMessage('Serial number is required'),
  body('location')
    .trim()
    .notEmpty().withMessage('Physical location / bench is required'),
  body('nextCalibrationDate')
    .optional()
    .isISO8601().withMessage('nextCalibrationDate must be a valid ISO date')
    .custom((val) => {
      if (new Date(val) <= new Date()) {
        throw new Error('Next calibration date must be in the future');
      }
      return true;
    }),
  body('calibrationIntervalDays')
    .optional()
    .isInt({ min: 1, max: 3650 }).withMessage('Calibration interval must be 1–3650 days'),
  validate
];

export const validateUpdateEquipment = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Equipment name must be 2–200 characters'),
  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty'),
  body('operationalStatus')
    .optional()
    .isIn(['Ready to Use', 'Under Repair', 'Damaged'])
    .withMessage('Invalid operational status'),
  validate
];

// ── Ticket Validators ─────────────────────────────────────────────────────────
export const validateCreateTicket = [
  body('publicId')
    .trim()
    .notEmpty().withMessage('Equipment public ID is required'),
  body('studentName')
    .trim()
    .notEmpty().withMessage('Student name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Student name must be 2–100 characters'),
  body('rollNumber')
    .trim()
    .notEmpty().withMessage('Roll number is required')
    .toUpperCase(),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .isMobilePhone('any').withMessage('Please provide a valid mobile number'),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('description')
    .trim()
    .notEmpty().withMessage('Fault description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Fault description must be 10–1000 characters'),
  validate
];

export const validateUpdateTicketStatus = [
  body('ticketStatus')
    .notEmpty().withMessage('Ticket status is required')
    .isIn(['Open', 'Under Review', 'In Repair', 'Resolved'])
    .withMessage('Invalid ticket status. Must be: Open, Under Review, In Repair, or Resolved'),
  body('resolutionNotes')
    .if(body('ticketStatus').equals('Resolved'))
    .notEmpty().withMessage('Resolution notes are required when resolving a ticket')
    .isLength({ min: 5, max: 500 }).withMessage('Resolution notes must be 5–500 characters'),
  validate
];

// ── Calibration Validators ────────────────────────────────────────────────────
export const validateLogCalibration = [
  body('equipmentId')
    .trim()
    .notEmpty().withMessage('Equipment ID is required')
    .isMongoId().withMessage('Invalid equipment ID format'),
  body('calibratedBy')
    .trim()
    .notEmpty().withMessage('Technician / Agency name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Technician name must be 2–200 characters'),
  body('calibrationDate')
    .notEmpty().withMessage('Calibration date is required')
    .isISO8601().withMessage('Calibration date must be a valid ISO date')
    .custom((val) => {
      if (new Date(val) > new Date()) {
        throw new Error('Calibration date cannot be in the future');
      }
      return true;
    }),
  body('nextDueDate')
    .notEmpty().withMessage('Next calibration due date is required')
    .isISO8601().withMessage('Next due date must be a valid ISO date')
    .custom((val, { req }) => {
      if (req.body.calibrationDate && new Date(val) <= new Date(req.body.calibrationDate)) {
        throw new Error('Next due date must be after the calibration date');
      }
      return true;
    }),
  body('certificateUrl')
    .optional()
    .isURL().withMessage('Certificate URL must be a valid URL'),
  validate
];

// ── Param Validators ──────────────────────────────────────────────────────────
export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];
