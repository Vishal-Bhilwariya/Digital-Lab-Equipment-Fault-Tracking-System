import Lab from '../models/Lab.js';
import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import { generateLabId, ROLES } from '../utils/constants.js';

/**
 * @desc    Create a new Laboratory
 * @route   POST /api/v1/labs
 * @access  Private (Admin only)
 */
export const createLab = async (req, res, next) => {
  try {
    const { labName, labBlock } = req.body;

    // Generate a collision-safe unique labId
    let labId = generateLabId();
    while (await Lab.findOne({ labId })) {
      labId = generateLabId();
    }

    const lab = await Lab.create({ labId, labName: labName.trim(), labBlock: labBlock.trim() });

    res.status(201).json({
      success: true,
      message: 'Laboratory created successfully',
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all laboratories
 * @route   GET /api/v1/labs
 * @access  Private (Admin, Assistant)
 */
export const getLabs = async (req, res, next) => {
  try {
    let query = {};

    // Assistants can only see their own lab
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = req.user.assignedLabId?._id || req.user.assignedLabId;
      query._id = assignedId;
    } else {
      // Admin: by default show only active, unless includeArchived flag sent
      if (req.query.includeArchived !== 'true') {
        query.isActive = true;
      }
    }

    const labs = await Lab.find(query).sort({ labName: 1 });

    // For each lab, also include equipment count
    const labsWithCounts = await Promise.all(
      labs.map(async (lab) => {
        const equipmentCount = await Equipment.countDocuments({ labId: lab._id, isActive: true });
        const assignedAssistant = await User.findOne({
          assignedLabId: lab._id,
          role: ROLES.ASSISTANT,
          isActive: true
        }).select('name email');
        return {
          ...lab.toObject(),
          equipmentCount,
          assignedAssistant: assignedAssistant || null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: labsWithCounts.length,
      data: labsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single laboratory details
 * @route   GET /api/v1/labs/:id
 * @access  Private (Admin, Assigned Assistant)
 */
export const getLabById = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    // Assistants can only view their own lab
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (lab._id.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your assigned laboratory'
        });
      }
    }

    const equipmentCount = await Equipment.countDocuments({ labId: lab._id, isActive: true });
    const assignedAssistant = await User.findOne({
      assignedLabId: lab._id,
      role: ROLES.ASSISTANT,
      isActive: true
    }).select('name email mobile');

    res.status(200).json({
      success: true,
      data: {
        ...lab.toObject(),
        equipmentCount,
        assignedAssistant: assignedAssistant || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update laboratory name or block
 * @route   PATCH /api/v1/labs/:id
 * @access  Private (Admin only)
 */
export const updateLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    const { labName, labBlock } = req.body;
    if (labName) lab.labName = labName.trim();
    if (labBlock) lab.labBlock = labBlock.trim();

    await lab.save();

    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully',
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive (soft-delete) a laboratory
 * @route   PATCH /api/v1/labs/:id/archive
 * @access  Private (Admin only)
 */
export const archiveLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    if (!lab.isActive) {
      return res.status(400).json({ success: false, message: 'Laboratory is already archived' });
    }

    // Warn if lab still has active equipment
    const activeEquipmentCount = await Equipment.countDocuments({ labId: lab._id, isActive: true });
    if (activeEquipmentCount > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        success: false,
        message: `This laboratory still has ${activeEquipmentCount} active equipment records. Add ?force=true to archive anyway.`,
        activeEquipmentCount
      });
    }

    lab.isActive = false;
    await lab.save();

    res.status(200).json({
      success: true,
      message: `Laboratory '${lab.labName}' (${lab.labId}) archived successfully`,
      data: { id: lab._id, labId: lab.labId, labName: lab.labName, isActive: lab.isActive }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reactivate an archived laboratory
 * @route   PATCH /api/v1/labs/:id/reactivate
 * @access  Private (Admin only)
 */
export const reactivateLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Laboratory not found' });
    }

    if (lab.isActive) {
      return res.status(400).json({ success: false, message: 'Laboratory is already active' });
    }

    lab.isActive = true;
    await lab.save();

    res.status(200).json({
      success: true,
      message: `Laboratory '${lab.labName}' reactivated successfully`,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};
