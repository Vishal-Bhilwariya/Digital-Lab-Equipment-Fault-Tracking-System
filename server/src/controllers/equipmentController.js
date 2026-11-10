import Equipment from '../models/Equipment.js';
import Lab from '../models/Lab.js';
import { ROLES, OPERATIONAL_STATUS, generatePublicId } from '../utils/constants.js';
import { generateEquipmentQR } from '../services/qrService.js';

/**
 * @desc    Add new equipment to the assistant's assigned lab
 * @route   POST /api/v1/equipment
 * @access  Private (Assistant, Admin)
 */
export const createEquipment = async (req, res, next) => {
  try {
    const {
      name,
      serialNumber,
      model,
      location,
      installationDate,
      calibrationIntervalDays = 180,
      lastCalibrationDate = new Date(),
      nextCalibrationDate
    } = req.body;

    if (!name || !serialNumber || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, serial number, and physical location are required'
      });
    }

    // Determine target lab
    const labId = req.user.role === ROLES.ADMIN ? req.body.labId : req.user.assignedLabId;

    if (!labId) {
      return res.status(400).json({
        success: false,
        message: 'Target laboratory ID is required'
      });
    }

    // Verify lab exists and is active
    const lab = await Lab.findById(labId);
    if (!lab || !lab.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Assigned laboratory does not exist or is archived'
      });
    }

    // Auto calculate nextCalibrationDate if not provided
    let calculatedNextDate = nextCalibrationDate;
    if (!calculatedNextDate) {
      const lastDate = new Date(lastCalibrationDate);
      calculatedNextDate = new Date(lastDate.getTime() + calibrationIntervalDays * 24 * 60 * 60 * 1000);
    }

    // Ensure unique publicId
    let publicId = generatePublicId();
    let existingPublic = await Equipment.findOne({ publicId });
    while (existingPublic) {
      publicId = generatePublicId();
      existingPublic = await Equipment.findOne({ publicId });
    }

    const equipment = await Equipment.create({
      publicId,
      labId,
      name,
      serialNumber,
      model,
      location,
      installationDate: installationDate || new Date(),
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays,
      lastCalibrationDate,
      nextCalibrationDate: calculatedNextDate
    });

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get equipment list for assistant's lab (Sorted by damageCount DESC by default)
 * @route   GET /api/v1/equipment
 * @access  Private (Assistant, Admin)
 */
export const getLabEquipment = async (req, res, next) => {
  try {
    let query = { isActive: true };

    if (req.user.role === ROLES.ASSISTANT) {
      const assignedLabId = req.user.assignedLabId?._id || req.user.assignedLabId;
      query.labId = assignedLabId;
    } else if (req.query.labId) {
      query.labId = req.query.labId;
    }

    if (req.query.operationalStatus) {
      query.operationalStatus = req.query.operationalStatus;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Strict Rule: Equipment List sorted by damageCount in descending order
    let sortCriteria = { damageCount: -1, createdAt: -1 };
    if (req.query.sortBy === 'calibration') {
      sortCriteria = { nextCalibrationDate: 1 };
    }

    const equipment = await Equipment.find(query)
      .populate('labId', 'labId labName labBlock')
      .sort(sortCriteria);

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
 * @desc    Public scan lookup via Google Lens or mobile camera URL
 * @route   GET /api/v1/equipment/public/:publicId
 * @access  Public (Unauthenticated)
 */
export const getEquipmentByPublicId = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    const equipment = await Equipment.findOne({ publicId, isActive: true })
      .populate('labId', 'labName labBlock labId');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found or no longer active'
      });
    }

    // Format safe public view (no internal sensitive IDs)
    res.status(200).json({
      success: true,
      data: {
        publicId: equipment.publicId,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        model: equipment.model,
        location: equipment.location,
        labName: equipment.labId?.labName,
        labBlock: equipment.labId?.labBlock,
        labId: equipment.labId?.labId,
        operationalStatus: equipment.operationalStatus,
        lastCalibrationDate: equipment.lastCalibrationDate,
        nextCalibrationDate: equipment.nextCalibrationDate,
        calibrationHealth: equipment.calibrationHealth
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get equipment details by internal ObjectId
 * @route   GET /api/v1/equipment/:id
 * @access  Private (Assistant, Admin)
 */
export const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('labId', 'labId labName labBlock');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Verify lab isolation for assistant
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (equipment.labId._id.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Equipment belongs to another laboratory'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update equipment details / operational status
 * @route   PATCH /api/v1/equipment/:id
 * @access  Private (Assistant)
 */
export const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Verify lab isolation for assistant
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (equipment.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Equipment belongs to another laboratory'
        });
      }
    }

    const { name, model, location, operationalStatus, calibrationIntervalDays } = req.body;

    if (name) equipment.name = name;
    if (model !== undefined) equipment.model = model;
    if (location) equipment.location = location;
    if (operationalStatus && Object.values(OPERATIONAL_STATUS).includes(operationalStatus)) {
      equipment.operationalStatus = operationalStatus;
    }
    if (calibrationIntervalDays) {
      equipment.calibrationIntervalDays = Number(calibrationIntervalDays);
    }

    await equipment.save();

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate printable QR Code Data URL for equipment
 * @route   GET /api/v1/equipment/:id/qr
 * @access  Private (Assistant, Admin)
 */
export const getEquipmentQR = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('labId', 'labName labId');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Generate QR
    const { targetUrl, qrDataUrl } = await generateEquipmentQR(equipment.publicId);

    res.status(200).json({
      success: true,
      data: {
        publicId: equipment.publicId,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        labName: equipment.labId?.labName,
        targetUrl,
        qrDataUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete / Archive Equipment
 * @route   PATCH /api/v1/equipment/:id/archive
 * @access  Private (Assistant, Admin)
 */
export const archiveEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Verify lab isolation for assistant
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (equipment.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Equipment belongs to another laboratory'
        });
      }
    }

    equipment.isActive = false;
    await equipment.save();

    res.status(200).json({
      success: true,
      message: `Equipment '${equipment.name}' archived successfully`,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};
