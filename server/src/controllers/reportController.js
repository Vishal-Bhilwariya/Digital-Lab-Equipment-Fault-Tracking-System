import Equipment from '../models/Equipment.js';
import Ticket from '../models/Ticket.js';
import Lab from '../models/Lab.js';
import { ROLES, OPERATIONAL_STATUS, TICKET_STATUS } from '../utils/constants.js';

/**
 * @desc    Get dashboard statistics for Admin or Assistant
 * @route   GET /api/v1/reports/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    let eqFilter = { isActive: true };
    let ticketFilter = {};

    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = req.user.assignedLabId?._id || req.user.assignedLabId;
      eqFilter.labId = assignedId;
      ticketFilter.labId = assignedId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEquipment,
      readyToUse,
      damaged,
      underRepair,
      overdueCalibration,
      openTickets,
      mostDamagedEquipment
    ] = await Promise.all([
      Equipment.countDocuments(eqFilter),
      Equipment.countDocuments({ ...eqFilter, operationalStatus: OPERATIONAL_STATUS.READY_TO_USE }),
      Equipment.countDocuments({ ...eqFilter, operationalStatus: OPERATIONAL_STATUS.DAMAGED }),
      Equipment.countDocuments({ ...eqFilter, operationalStatus: OPERATIONAL_STATUS.UNDER_REPAIR }),
      Equipment.countDocuments({ ...eqFilter, nextCalibrationDate: { $lt: today } }),
      Ticket.countDocuments({
        ...ticketFilter,
        ticketStatus: { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.IN_REPAIR] }
      }),
      Equipment.find(eqFilter)
        .populate('labId', 'labName labId')
        .sort({ damageCount: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEquipment,
        readyToUse,
        damaged,
        underRepair,
        overdueCalibration,
        openTickets,
        mostDamagedEquipment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Global Calibrated Equipments Report (Read-only)
 * @route   GET /api/v1/reports/calibrated-equipment
 * @access  Private (Admin only)
 */
export const getAdminCalibratedReport = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ isActive: true })
      .populate('labId', 'labName labBlock labId')
      .sort({ nextCalibrationDate: 1 });

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Global Damaged Equipments Report (Read-only)
 * @route   GET /api/v1/reports/damaged-equipment
 * @access  Private (Admin only)
 */
export const getAdminDamagedReport = async (req, res, next) => {
  try {
    const damagedEquipment = await Equipment.find({
      isActive: true,
      operationalStatus: { $in: [OPERATIONAL_STATUS.DAMAGED, OPERATIONAL_STATUS.UNDER_REPAIR] }
    })
      .populate('labId', 'labName labBlock labId')
      .sort({ damageCount: -1 });

    const activeTickets = await Ticket.find({
      ticketStatus: { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.IN_REPAIR] }
    })
      .populate('equipmentId', 'name serialNumber location operationalStatus')
      .populate('labId', 'labName labBlock labId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        damagedEquipment,
        activeTickets
      }
    });
  } catch (error) {
    next(error);
  }
};
