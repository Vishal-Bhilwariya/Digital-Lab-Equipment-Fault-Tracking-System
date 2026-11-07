import crypto from 'crypto';

export const ROLES = Object.freeze({
  ADMIN: 'Admin',
  ASSISTANT: 'Assistant'
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
  OVERDUE: 'Overdue'
});

export const TICKET_STATUS = Object.freeze({
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  IN_REPAIR: 'In Repair',
  RESOLVED: 'Resolved'
});

/**
 * Generate unique Lab ID: e.g. "LAB-A8F21"
 */
export const generateLabId = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();
  return `LAB-${randomSuffix}`;
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
  if (!nextCalibrationDate) return { status: CALIBRATION_STATUS.OVERDUE, daysRemaining: -999 };
  
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
