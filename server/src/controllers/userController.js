import User from '../models/User.js';
import Lab from '../models/Lab.js';
import { ROLES } from '../utils/constants.js';
import { sendAssistantSetupEmail } from '../services/emailService.js';

/**
 * @desc    Create new Lab Assistant & send account setup link
 * @route   POST /api/v1/users/assistants
 * @access  Private (Admin only)
 */
export const createAssistant = async (req, res, next) => {
  try {
    const { name, email, mobile, assignedLabId } = req.body;

    if (!name || !email || !mobile || !assignedLabId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile, and assigned laboratory are required'
      });
    }

    // Check if lab exists and is active
    const lab = await Lab.findById(assignedLabId);
    if (!lab || !lab.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Assigned laboratory does not exist or has been archived'
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // Instantiate assistant user
    const assistant = new User({
      name,
      email: email.toLowerCase(),
      mobile,
      role: ROLES.ASSISTANT,
      assignedLabId
    });

    // Generate setup token
    const rawSetupToken = assistant.createSetupToken();
    await assistant.save();

    // Trigger Nodemailer invite email
    const setupUrl = await sendAssistantSetupEmail({
      toEmail: assistant.email,
      name: assistant.name,
      setupToken: rawSetupToken
    });

    res.status(201).json({
      success: true,
      message: 'Lab assistant added successfully. Invitation email sent.',
      data: {
        id: assistant._id,
        name: assistant.name,
        email: assistant.email,
        mobile: assistant.mobile,
        assignedLab: {
          id: lab._id,
          labId: lab.labId,
          labName: lab.labName
        },
        setupUrl // returned for dev/demo convenience
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lab assistants
 * @route   GET /api/v1/users/assistants
 * @access  Private (Admin only)
 */
export const getAssistants = async (req, res, next) => {
  try {
    const assistants = await User.find({ role: ROLES.ASSISTANT })
      .populate('assignedLabId', 'labId labName labBlock isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assistants.length,
      data: assistants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate/Activate an assistant (Soft status toggle)
 * @route   PATCH /api/v1/users/assistants/:id/status
 * @access  Private (Admin only)
 */
export const toggleAssistantStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== ROLES.ASSISTANT) {
      return res.status(404).json({
        success: false,
        message: 'Lab assistant not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Assistant account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
