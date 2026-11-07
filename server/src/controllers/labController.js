import Lab from '../models/Lab.js';
import Equipment from '../models/Equipment.js';
import { generateLabId } from '../utils/constants.js';

/**
 * @desc    Create a new Laboratory with auto-generated unique Lab ID
 * @route   POST /api/v1/labs
 * @access  Private (Admin only)
 */
export const createLab = async (req, res, next) => {
  try {
    const { labName, labBlock } = req.body;

    if (!labName || !labBlock) {
      return res.status(400).json({
        success: false,
        message: 'Lab Name and Lab Block are required'
      });
    }

    // Generate unique labId (e.g. LAB-A8F21)
    let labId = generateLabId();
    let existing = await Lab.findOne({ labId });
    while (existing) {
      labId = generateLabId();
      existing = await Lab.findOne({ labId });
    }

    const lab = await Lab.create({
      labId,
      labName,
      labBlock
    });

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
    const query = req.query.includeArchived === 'true' ? {} : { isActive: true };
    const labs = await Lab.find(query).sort({ labName: 1 });

    res.status(200).json({
      success: true,
      count: labs.length,
      data: labs
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
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive / Soft-delete a Laboratory
 * @route   PATCH /api/v1/labs/:id/archive
 * @access  Private (Admin only)
 */
export const archiveLab = async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    // Soft delete rule: Set isActive to false, never deleteOne()
    lab.isActive = false;
    await lab.save();

    res.status(200).json({
      success: true,
      message: `Laboratory '${lab.labName}' (${lab.labId}) archived successfully`,
      data: lab
    });
  } catch (error) {
    next(error);
  }
};
