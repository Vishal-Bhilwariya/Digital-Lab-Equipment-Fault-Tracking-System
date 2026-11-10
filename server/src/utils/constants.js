import crypto from 'crypto';

export const ROLES = Object.freeze({
  ADMIN: 'Admin',
  ASSISTANT: 'Assistant',
  STUDENT: 'Student'
});

// The Three Strictly Independent Statuses
export const OPERATIONAL_STATUS = Object.freeze({
  READY_TO_USE: 'Ready to Use',
  UNDER_REPAIR: 'Under Repair',
  DAMAGED: 'Damaged'
});

export const CALIBRATION_STATUS = Object.freeze({
  VALID: 'Valid',
  DUE_SOON: 'Due Soon',
  OVERDUE: 'Overdue',
  NOT_APPLICABLE: 'Not Applicable'
});

export const TICKET_STATUS = Object.freeze({
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  IN_REPAIR: 'In Repair',
  RESOLVED: 'Resolved',
  EXPIRED: 'Expired'
});

/**
 * Generate unique Lab ID: e.g. "LAB-A8F21"
 */
export const generateLabId = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();
  return `LAB-${randomSuffix}`;
};

/**
 * Generate unique Assistant ID: e.g. "AST-4B9F2"
 */
export const generateAssistantId = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();
  return `AST-${randomSuffix}`;
};

/**
 * Generate a secure random temporary password (e.g. "Lab#782914")
 */
export const generateTempPassword = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `Lab#${randomNum}`;
};

/**
 * Generate unique URL-safe Public ID for Equipment QR code
 */
export const generatePublicId = () => {
  return crypto.randomBytes(6).toString('hex'); // 12-char hex string
};

/**
 * Generate unique Ticket ID: e.g. "TKT-20261107-A9B2"
 */
export const generateTicketId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TKT-${dateStr}-${randomSuffix}`;
};

/**
 * Calculate dynamic Calibration Status and Days Remaining
 * daysRemaining = nextCalibrationDate - today
 * Negative -> Overdue
 * 0 -> Due Today
 * Positive -> Upcoming
 */
export const calculateCalibrationHealth = (nextCalibrationDate, dueSoonThresholdDays = 15) => {
  if (!nextCalibrationDate) return { status: CALIBRATION_STATUS.NOT_APPLICABLE, daysRemaining: null };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(nextCalibrationDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let status;
  if (daysRemaining < 0) {
    status = CALIBRATION_STATUS.OVERDUE;
  } else if (daysRemaining <= dueSoonThresholdDays) {
    status = CALIBRATION_STATUS.DUE_SOON;
  } else {
    status = CALIBRATION_STATUS.VALID;
  }
  
  return { status, daysRemaining };
};
