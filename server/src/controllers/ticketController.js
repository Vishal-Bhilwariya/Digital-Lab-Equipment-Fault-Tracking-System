import bcrypt from 'bcryptjs';
import Ticket from '../models/Ticket.js';
import Equipment from '../models/Equipment.js';
import Lab from '../models/Lab.js';
import User from '../models/User.js';
import {
  ROLES,
  OPERATIONAL_STATUS,
  TICKET_STATUS,
  generateTicketId,
  generateTempPassword
} from '../utils/constants.js';
import { uploadImageToCloud } from '../services/uploadService.js';
import {
  sendTicketRaisedAssistantNotification,
  sendTicketStatusChangedEmail,
  sendStudentAccountCreatedEmail
} from '../services/emailService.js';

/**
 * @desc    Submit fault ticket via public QR page
 * @route   POST /api/v1/tickets/public
 * @access  Public (Students)
 */
export const createPublicTicket = async (req, res, next) => {
  try {
    const { publicId, studentName, rollNumber, mobile, email, description } = req.body;

    if (!publicId || !studentName || !rollNumber || !mobile || !description || !email) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, student name, roll number, mobile, email, and fault description are required'
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

    // ── Check or Auto-Create Student Account ────────────────────────────────
    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    let studentUser = await User.findOne({
      $or: [{ rollNumber: cleanRoll }, { email: cleanEmail }]
    });

    if (!studentUser) {
      // Create new Student account
      const tempPassword = generateTempPassword();
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      studentUser = await User.create({
        name: studentName.trim(),
        email: cleanEmail,
        mobile: mobile.trim(),
        rollNumber: cleanRoll,
        role: ROLES.STUDENT,
        passwordHash,
        mustChangePassword: true,
        isActive: true
      });

      // Send credentials email to student
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      await sendStudentAccountCreatedEmail({
        toEmail: studentUser.email,
        name: studentUser.name,
        rollNumber: studentUser.rollNumber,
        tempPassword,
        loginUrl: `${clientUrl}/login`
      });
    }

    // Generate unique Ticket ID
    let ticketId = generateTicketId();
    while (await Ticket.findOne({ ticketId })) {
      ticketId = generateTicketId();
    }

    // Create ticket in database
    const ticket = await Ticket.create({
      ticketId,
      equipmentId: equipment._id,
      labId: equipment.labId,
      studentId: studentUser._id,
      studentName: studentName.trim(),
      rollNumber: cleanRoll,
      mobile: mobile.trim(),
      email: cleanEmail,
      description: description.trim(),
      photoUrl,
      ticketStatus: TICKET_STATUS.OPEN
    });

    // CRUCIAL BUSINESS RULE: Increment damageCount by 1 and mark DAMAGED
    equipment.damageCount += 1;
    equipment.operationalStatus = OPERATIONAL_STATUS.DAMAGED;
    await equipment.save();

    // ── Automated Email to Assigned Lab Assistant ───────────────────────────
    const labAssistant = await User.findOne({
      assignedLabId: equipment.labId,
      role: ROLES.ASSISTANT,
      isActive: true
    });
    const lab = await Lab.findById(equipment.labId);

    if (labAssistant) {
      await sendTicketRaisedAssistantNotification({
        toEmail: labAssistant.email,
        assistantName: labAssistant.name,
        ticketId: ticket.ticketId,
        equipmentName: equipment.name,
        labName: lab ? lab.labName : 'Laboratory',
        studentName: ticket.studentName,
        studentRollNumber: ticket.rollNumber,
        description: ticket.description,
        createdAt: ticket.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Fault ticket submitted successfully. Assigned Lab Assistant has been notified.',
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
    } else if (req.user.role === ROLES.STUDENT) {
      // Students should use /my-tickets, but guard here as well
      query.$or = [
        { studentId: req.user._id },
        { rollNumber: req.user.rollNumber },
        { email: req.user.email }
      ];
    } else if (req.query.labId) {
      query.labId = req.query.labId;
    }

    if (req.query.status) {
      query.ticketStatus = req.query.status;
    }

    const tickets = await Ticket.find(query)
      .populate('equipmentId', 'name serialNumber location operationalStatus')
      .populate('labId', 'labName labId labBlock')
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
 * @desc    Get all tickets raised by the logged-in Student
 * @route   GET /api/v1/tickets/my-tickets
 * @access  Private (Student)
 */
export const getStudentTickets = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { studentId: req.user._id },
        { rollNumber: req.user.rollNumber },
        { email: req.user.email }
      ]
    };

    const tickets = await Ticket.find(query)
      .populate('equipmentId', 'name serialNumber location operationalStatus')
      .populate('labId', 'labName labId labBlock')
      .sort({ createdAt: -1 });

    // Compute student stats
    const stats = {
      total: tickets.length,
      pending: tickets.filter((t) => t.ticketStatus === TICKET_STATUS.OPEN).length,
      underRepair: tickets.filter(
        (t) =>
          t.ticketStatus === TICKET_STATUS.UNDER_REVIEW ||
          t.ticketStatus === TICKET_STATUS.IN_REPAIR
      ).length,
      resolved: tickets.filter((t) => t.ticketStatus === TICKET_STATUS.RESOLVED).length,
      expired: tickets.filter((t) => t.ticketStatus === TICKET_STATUS.EXPIRED).length
    };

    res.status(200).json({
      success: true,
      stats,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public ticket tracking by ticketId & rollNumber
 * @route   GET /api/v1/tickets/track
 * @access  Public
 */
export const trackTicket = async (req, res, next) => {
  try {
    const { ticketId, rollNumber } = req.query;

    if (!ticketId || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Both Ticket ID and Student Roll Number are required for tracking'
      });
    }

    const ticket = await Ticket.findOne({
      ticketId: ticketId.trim(),
      rollNumber: rollNumber.trim().toUpperCase()
    })
      .populate('equipmentId', 'name serialNumber location operationalStatus')
      .populate('labId', 'labName labId labBlock');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'No fault ticket found matching the provided Ticket ID and Roll Number'
      });
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
 * @desc    Get single ticket details
 * @route   GET /api/v1/tickets/:id
 * @access  Private (Assistant, Admin, Student)
 */
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('equipmentId', 'name serialNumber location operationalStatus')
      .populate('labId', 'labName labId labBlock')
      .populate('resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Fault ticket not found'
      });
    }

    // Verify isolation
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (ticket.labId._id.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Ticket belongs to another laboratory'
        });
      }
    } else if (req.user.role === ROLES.STUDENT) {
      const isOwner =
        (ticket.studentId && ticket.studentId.toString() === req.user._id.toString()) ||
        ticket.rollNumber === req.user.rollNumber ||
        ticket.email === req.user.email;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own tickets'
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
 * @desc    Update ticket status & notify student
 * @route   PATCH /api/v1/tickets/:id/status
 * @access  Private (Assistant, Admin)
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

    // Enforce lab isolation for Assistant
    if (req.user.role === ROLES.ASSISTANT) {
      const assignedId = (req.user.assignedLabId?._id || req.user.assignedLabId).toString();
      if (ticket.labId.toString() !== assignedId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Ticket belongs to another laboratory'
        });
      }
    }

    const oldStatus = ticket.ticketStatus;
    const isTransition = oldStatus !== ticketStatus;

    ticket.ticketStatus = ticketStatus;

    if (ticketStatus === TICKET_STATUS.RESOLVED) {
      ticket.resolutionNotes = resolutionNotes || 'Repaired and verified operational.';
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;

      // Check if equipment can be restored to Ready to Use
      const equipment = await Equipment.findById(ticket.equipmentId);
      if (equipment) {
        const otherOpenTickets = await Ticket.countDocuments({
          equipmentId: equipment._id,
          _id: { $ne: ticket._id },
          ticketStatus: {
            $in: [TICKET_STATUS.OPEN, TICKET_STATUS.UNDER_REVIEW, TICKET_STATUS.IN_REPAIR]
          }
        });

        if (otherOpenTickets === 0 && restoreOperationalStatus !== false) {
          equipment.operationalStatus = OPERATIONAL_STATUS.READY_TO_USE;
          await equipment.save();
        }
      }
    } else if (ticketStatus === TICKET_STATUS.IN_REPAIR) {
      const equipment = await Equipment.findById(ticket.equipmentId);
      if (equipment && equipment.operationalStatus !== OPERATIONAL_STATUS.UNDER_REPAIR) {
        equipment.operationalStatus = OPERATIONAL_STATUS.UNDER_REPAIR;
        await equipment.save();
      }
    }

    await ticket.save();

    // ── Send Email Notification to Student ONLY when status transition occurs ───
    if (isTransition && ticket.email) {
      const equipment = await Equipment.findById(ticket.equipmentId);
      await sendTicketStatusChangedEmail({
        toEmail: ticket.email,
        studentName: ticket.studentName,
        ticketId: ticket.ticketId,
        equipmentName: equipment ? equipment.name : 'Laboratory Equipment',
        oldStatus,
        newStatus: ticketStatus,
        resolutionNotes: ticket.resolutionNotes,
        updatedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Ticket status successfully changed to '${ticketStatus}'`,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};
