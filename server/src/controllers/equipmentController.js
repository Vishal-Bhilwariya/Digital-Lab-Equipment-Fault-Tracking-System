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
      additionDate,
      installationDate,
      calibrationIntervalDays,
      lastCalibrationDate,
      nextCalibrationDate
    } = req.body;

    if (!name || !serialNumber || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, serial number, and physical location are required'
      });
    }

    // Determine target lab — Assistant can ONLY register for their assigned laboratory
    let labId;
    if (req.user.role === ROLES.ASSISTANT) {
      labId = req.user.assignedLabId?._id || req.user.assignedLabId;
    } else {
      labId = req.body.labId || req.user.assignedLabId?._id || req.user.assignedLabId;
    }

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

    // Handle optional calibration interval (some equipment may be damaged/simple and not require calibration)
    let finalInterval = null;
    let finalLastCal = null;
    let calculatedNextDate = null;

    if (calibrationIntervalDays && Number(calibrationIntervalDays) > 0) {
      finalInterval = Number(calibrationIntervalDays);
      finalLastCal = lastCalibrationDate ? new Date(lastCalibrationDate) : new Date();
      if (nextCalibrationDate) {
        calculatedNextDate = new Date(nextCalibrationDate);
      } else {
        calculatedNextDate = new Date(finalLastCal.getTime() + finalInterval * 24 * 60 * 60 * 1000);
      }
    }

    // Ensure unique publicId
    let publicId = generatePublicId();
    while (await Equipment.findOne({ publicId })) {
      publicId = generatePublicId();
    }

    const effectiveDate = additionDate
      ? new Date(additionDate)
      : installationDate
      ? new Date(installationDate)
      : new Date();

    const equipment = await Equipment.create({
      publicId,
      labId,
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      model: model ? model.trim() : '',
      location: location.trim(),
      additionDate: effectiveDate,
      installationDate: effectiveDate,
      operationalStatus: OPERATIONAL_STATUS.READY_TO_USE,
      damageCount: 0,
      calibrationIntervalDays: finalInterval,
      lastCalibrationDate: finalLastCal,
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

    // Pre-generate and attach instant Base64 QR code and target URL for every item
    const enrichedEquipment = await Promise.all(
      equipment.map(async (eq) => {
        try {
          const qr = await generateEquipmentQR(eq.publicId);
          const obj = eq.toObject({ virtuals: true });
          obj.qrCodeDataUrl = qr.qrDataUrl;
          obj.targetUrl = qr.targetUrl;
          return obj;
        } catch (e) {
          return eq.toObject({ virtuals: true });
        }
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedEquipment.length,
      data: enrichedEquipment
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

    const qrResult = await generateEquipmentQR(equipment.publicId);

    // Format safe public view (no internal sensitive IDs)
    res.status(200).json({
      success: true,
      data: {
        publicId: equipment.publicId,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        model: equipment.model,
        location: equipment.location,
        additionDate: equipment.additionDate || equipment.installationDate,
        labName: equipment.labId?.labName,
        labBlock: equipment.labId?.labBlock,
        labId: equipment.labId?.labId,
        operationalStatus: equipment.operationalStatus,
        lastCalibrationDate: equipment.lastCalibrationDate,
        nextCalibrationDate: equipment.nextCalibrationDate,
        calibrationHealth: equipment.calibrationHealth,
        qrCodeDataUrl: qrResult.qrDataUrl,
        targetUrl: qrResult.targetUrl
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
 * @desc    Update operational status or location
 * @route   PATCH /api/v1/equipment/:id
 * @access  Private (Assistant, Admin)
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
          message: 'Access denied: You can only edit equipment in your assigned laboratory'
        });
      }
    }

    const { name, location, operationalStatus, calibrationIntervalDays, nextCalibrationDate } = req.body;

    if (name) equipment.name = name.trim();
    if (location) equipment.location = location.trim();
    if (operationalStatus) equipment.operationalStatus = operationalStatus;
    if (calibrationIntervalDays !== undefined) {
      equipment.calibrationIntervalDays = calibrationIntervalDays ? Number(calibrationIntervalDays) : null;
    }
    if (nextCalibrationDate !== undefined) {
      equipment.nextCalibrationDate = nextCalibrationDate ? new Date(nextCalibrationDate) : null;
    }

    await equipment.save();

    res.status(200).json({
      success: true,
      message: 'Equipment record updated successfully',
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate or fetch Base64 QR code and direct landing URL for Equipment
 * @route   GET /api/v1/equipment/:id/qr
 * @access  Private (Assistant, Admin)
 */
export const getEquipmentQR = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('labId', 'labName labId labBlock');

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

    const qrResult = await generateEquipmentQR(equipment.publicId);

    res.status(200).json({
      success: true,
      data: {
        publicId: equipment.publicId,
        equipmentName: equipment.name,
        serialNumber: equipment.serialNumber,
        labName: equipment.labId?.labName,
        labBlock: equipment.labId?.labBlock,
        ...qrResult
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive / Soft-delete equipment
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
          message: 'Access denied: You can only archive equipment in your assigned laboratory'
        });
      }
    }

    equipment.isActive = false;
    await equipment.save();

    res.status(200).json({
      success: true,
      message: `Equipment '${equipment.name}' archived successfully.`
    });
  } catch (error) {
    next(error);
  }
};
