import CalibrationLog from '../models/CalibrationLog.js';
import Equipment from '../models/Equipment.js';
import { ROLES, calculateCalibrationHealth } from '../utils/constants.js';

/**
 * @desc    Log a completed calibration event (Historical Immutability) & update equipment
 * @route   POST /api/v1/calibrations
 * @access  Private (Assistant)
 */
export const logCalibration = async (req, res, next) => {
  try {
    const { equipmentId, calibratedBy, calibrationDate, nextDueDate, certificateUrl, remarks } = req.body;

    if (!equipmentId || !calibratedBy || !calibrationDate || !nextDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, technician/agency name, calibration date, and next due date are required'
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Enforce lab isolation for assistant
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (equipment.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Equipment belongs to another laboratory'
        });
      }
    }

    // 1. Create immutable historical log
    const log = await CalibrationLog.create({
      equipmentId: equipment._id,
      labId: equipment.labId,
      calibratedBy,
      calibrationDate: new Date(calibrationDate),
      nextDueDate: new Date(nextDueDate),
      certificateUrl,
      remarks
    });

    // 2. Update equipment calibration dates
    equipment.lastCalibrationDate = new Date(calibrationDate);
    equipment.nextCalibrationDate = new Date(nextDueDate);
    await equipment.save();

    res.status(201).json({
      success: true,
      message: 'Calibration event logged permanently and equipment schedule updated',
      data: log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete immutable calibration history for an equipment item
 * @route   GET /api/v1/calibrations/equipment/:id
 * @access  Private (Assistant, Admin)
 */
export const getEquipmentCalibrationHistory = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Verify lab isolation
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (equipment.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Equipment belongs to another laboratory'
        });
      }
    }

    const history = await CalibrationLog.find({ equipmentId: equipment._id })
      .sort({ calibrationDate: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get calibration schedule with strict urgency sorting algorithm
 * @route   GET /api/v1/calibrations/schedule
 * @access  Private (Assistant, Admin)
 * 
 * Strict Sorting Priority:
 * daysRemaining = nextCalibrationDate - today
 * Priority 1: Overdue (Negative values, sorted most urgent)
 * Priority 2: Due Today (Zero)
 * Priority 3: Upcoming (Positive values, sorted lowest to highest)
 */
export const getCalibrationSchedule = async (req, res, next) => {
  try {
    let query = { isActive: true };

    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = req.user.assignedLabId?._id || req.user.assignedLabId;
      query.labId = assignedId;
    } else if (req.query.labId) {
      query.labId = req.query.labId;
    }

    const items = await Equipment.find(query)
      .populate('labId', 'labId labName labBlock')
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute calibration health & days remaining
    const schedule = items.map((item) => {
      const target = new Date(item.nextCalibrationDate);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let priorityGroup;
      if (daysRemaining < 0) {
        priorityGroup = 1; // Priority 1: Overdue
      } else if (daysRemaining === 0) {
        priorityGroup = 2; // Priority 2: Due Today
      } else {
        priorityGroup = 3; // Priority 3: Upcoming
      }

      return {
        ...item,
        daysRemaining,
        priorityGroup,
        calibrationStatus:
          daysRemaining < 0 ? 'Overdue' : daysRemaining <= 15 ? 'Due Soon' : 'Valid'
      };
    });

    // Sort by Priority Group (1 -> 2 -> 3), then by daysRemaining ascending
    schedule.sort((a, b) => {
      if (a.priorityGroup !== b.priorityGroup) {
        return a.priorityGroup - b.priorityGroup;
      }
      return a.daysRemaining - b.daysRemaining;
    });

    res.status(200).json({
      success: true,
      count: schedule.length,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};
