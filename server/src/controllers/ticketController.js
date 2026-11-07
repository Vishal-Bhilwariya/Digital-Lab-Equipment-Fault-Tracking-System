import Ticket from '../models/Ticket.js';
import Equipment from '../models/Equipment.js';
import { ROLES, OPERATIONAL_STATUS, TICKET_STATUS, generateTicketId } from '../utils/constants.js';
import { uploadImageToCloud } from '../services/uploadService.js';

/**
 * @desc    Submit fault ticket via public QR page
 * @route   POST /api/v1/tickets/public
 * @access  Public (Students)
 */
export const createPublicTicket = async (req, res, next) => {
  try {
    const { publicId, studentName, rollNumber, mobile, email, description } = req.body;

    if (!publicId || !studentName || !rollNumber || !mobile || !description) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, student name, roll number, mobile, and fault description are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A photograph of the damaged equipment is required'
      });
    }

    // Lookup equipment by publicId
    const equipment = await Equipment.findOne({ publicId, isActive: true });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found or is currently archived'
      });
    }

    // Upload damage photo
    const photoUrl = await uploadImageToCloud(req.file.buffer, req.file.mimetype);

    // Generate unique Ticket ID
    let ticketId = generateTicketId();
    let existingTicket = await Ticket.findOne({ ticketId });
    while (existingTicket) {
      ticketId = generateTicketId();
      existingTicket = await Ticket.findOne({ ticketId });
    }

    // Create ticket in database
    const ticket = await Ticket.create({
      ticketId,
      equipmentId: equipment._id,
      labId: equipment.labId,
      studentName,
      rollNumber: rollNumber.toUpperCase(),
      mobile,
      email,
      description,
      photoUrl,
      ticketStatus: TICKET_STATUS.OPEN
    });

    // CRUCIAL BUSINESS RULE 2: The "Damage Count" Algorithm
    // Increment damageCount by 1 (never decreases or resets)
    equipment.damageCount += 1;
    equipment.operationalStatus = OPERATIONAL_STATUS.DAMAGED;
    await equipment.save();

    res.status(201).json({
      success: true,
      message: 'Fault ticket submitted successfully. Lab technicians have been notified.',
      data: {
        ticketId: ticket.ticketId,
        equipmentName: equipment.name,
        ticketStatus: ticket.ticketStatus,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tickets for assistant's assigned lab
 * @route   GET /api/v1/tickets
 * @access  Private (Assistant, Admin)
 */
export const getLabTickets = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === ROLES.ASSISTANT) {
      const assignedLabId = req.user.assignedLabId?._id || req.user.assignedLabId;
      query.labId = assignedLabId;
    } else if (req.query.labId) {
      query.labId = req.query.labId;
    }

    // Filter by ticket status
    if (req.query.status) {
      if (req.query.status === 'active') {
        query.ticketStatus = { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.IN_REPAIR] };
      } else {
        query.ticketStatus = req.query.status;
      }
    }

    const tickets = await Ticket.find(query)
      .populate('equipmentId', 'name serialNumber location operationalStatus damageCount publicId')
      .populate('labId', 'labId labName labBlock')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single ticket details
 * @route   GET /api/v1/tickets/:id
 * @access  Private (Assistant, Admin)
 */
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('equipmentId', 'name serialNumber location operationalStatus damageCount publicId')
      .populate('labId', 'labId labName labBlock')
      .populate('resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Fault ticket not found'
      });
    }

    // Verify lab isolation
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (ticket.labId._id.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Ticket belongs to another laboratory'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket status (Open -> Under Review -> In Repair -> Resolved)
 * @route   PATCH /api/v1/tickets/:id/status
 * @access  Private (Assistant)
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketStatus, resolutionNotes, restoreOperationalStatus } = req.body;

    if (!ticketStatus || !Object.values(TICKET_STATUS).includes(ticketStatus)) {
      return res.status(400).json({
        success: false,
        message: `Valid ticket status is required: ${Object.values(TICKET_STATUS).join(', ')}`
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Enforce lab isolation
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (ticket.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Ticket belongs to another laboratory'
        });
      }
    }

    ticket.ticketStatus = ticketStatus;

    if (ticketStatus === TICKET_STATUS.RESOLVED) {
      ticket.resolutionNotes = resolutionNotes || 'Repaired and verified operational.';
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;

      // Check if equipment can be restored to Ready to Use
      const equipment = await Equipment.findById(ticket.equipmentId);
      if (equipment) {
        // Check if there are other unresolved tickets on this equipment
        const otherOpenTickets = await Ticket.countDocuments({
          equipmentId: equipment._id,
          _id: { $ne: ticket._id },
          ticketStatus: { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.IN_REPAIR] }
        });

        // If no other unresolved tickets and assistant agrees to restore
        if (otherOpenTickets === 0 && restoreOperationalStatus !== false) {
          equipment.operationalStatus = OPERATIONAL_STATUS.READY_TO_USE;
          await equipment.save();
        }
      }
    } else if (ticketStatus === TICKET_STATUS.IN_REPAIR) {
      // Set equipment to Under Repair
      const equipment = await Equipment.findById(ticket.equipmentId);
      if (equipment && equipment.operationalStatus !== OPERATIONAL_STATUS.UNDER_REPAIR) {
        equipment.operationalStatus = OPERATIONAL_STATUS.UNDER_REPAIR;
        await equipment.save();
      }
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: `Ticket transitioned to '${ticketStatus}' successfully`,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track ticket status by Ticket ID & Roll Number
 * @route   GET /api/v1/tickets/track
 * @access  Public (Students)
 */
export const trackTicket = async (req, res, next) => {
  try {
    const { ticketId, rollNumber } = req.query;

    if (!ticketId || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID and Roll Number are required for tracking'
      });
    }

    const ticket = await Ticket.findOne({
      ticketId: ticketId.trim().toUpperCase(),
      rollNumber: rollNumber.trim().toUpperCase()
    })
      .populate('equipmentId', 'name serialNumber location')
      .populate('labId', 'labName labBlock');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'No ticket found with this Ticket ID and Roll Number combination'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        equipmentName: ticket.equipmentId?.name,
        labName: ticket.labId?.labName,
        labBlock: ticket.labId?.labBlock,
        faultDescription: ticket.description,
        ticketStatus: ticket.ticketStatus,
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        resolutionNotes: ticket.resolutionNotes || null
      }
    });
  } catch (error) {
    next(error);
  }
};
