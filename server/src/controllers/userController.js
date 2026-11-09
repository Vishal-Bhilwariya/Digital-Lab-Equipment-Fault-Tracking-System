import User from '../models/User.js';
import Lab from '../models/Lab.js';
import { ROLES } from '../utils/constants.js';
import { sendAssistantSetupEmail } from '../services/emailService.js';

/**
 * @desc    Create new Lab Assistant & send account setup email
 * @route   POST /api/v1/users/assistants
 * @access  Private (Admin only)
 */
export const createAssistant = async (req, res, next) => {
  try {
    const { name, email, mobile, assignedLabId } = req.body;

    // Verify lab exists and is active
    const lab = await Lab.findById(assignedLabId);
    if (!lab || !lab.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found or has been archived'
      });
    }

    // Prevent duplicate email
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    // Create assistant (no password yet — will be set via email token)
    const assistant = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      role: ROLES.ASSISTANT,
      assignedLabId
    });

    // Generate a one-time setup token (hashed in DB, raw sent via email)
    const rawSetupToken = assistant.createSetupToken();
    await assistant.save();

    // Send invitation email (falls back to console.log if SMTP not configured)
    const setupUrl = await sendAssistantSetupEmail({
      toEmail: assistant.email,
      name: assistant.name,
      setupToken: rawSetupToken
    });

    res.status(201).json({
      success: true,
      message: 'Lab assistant created. Invitation email sent to their address.',
      data: {
        id: assistant._id,
        name: assistant.name,
        email: assistant.email,
        mobile: assistant.mobile,
        role: assistant.role,
        isActive: assistant.isActive,
        assignedLab: {
          id: lab._id,
          labId: lab.labId,
          labName: lab.labName,
          labBlock: lab.labBlock
        },
        // Only expose setup URL in development (useful for testing without SMTP)
        ...(process.env.NODE_ENV === 'development' && { setupUrl })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lab assistants (with optional filters)
 * @route   GET /api/v1/users/assistants
 * @access  Private (Admin only)
 */
export const getAssistants = async (req, res, next) => {
  try {
    let query = { role: ROLES.ASSISTANT };

    // Filter by lab
    if (req.query.labId) {
      query.assignedLabId = req.query.labId;
    }

    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const assistants = await User.find(query)
      .populate('assignedLabId', 'labId labName labBlock isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assistants.length,
      data: assistants.map((a) => ({
        id: a._id,
        name: a.name,
        email: a.email,
        mobile: a.mobile,
        role: a.role,
        isActive: a.isActive,
        assignedLab: a.assignedLabId,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single assistant by ID
 * @route   GET /api/v1/users/assistants/:id
 * @access  Private (Admin only)
 */
export const getAssistantById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: ROLES.ASSISTANT })
      .populate('assignedLabId', 'labId labName labBlock isActive');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Lab assistant not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isActive: user.isActive,
        assignedLab: user.assignedLabId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update assistant profile (name, mobile, reassign lab)
 * @route   PATCH /api/v1/users/assistants/:id
 * @access  Private (Admin only)
 */
export const updateAssistant = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: ROLES.ASSISTANT });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Lab assistant not found' });
    }

    const { name, mobile, assignedLabId } = req.body;

    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();

    if (assignedLabId && assignedLabId !== user.assignedLabId?.toString()) {
      const lab = await Lab.findById(assignedLabId);
      if (!lab || !lab.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Target laboratory not found or has been archived'
        });
      }
      user.assignedLabId = assignedLabId;
    }

    await user.save();

    const updated = await User.findById(user._id).populate('assignedLabId', 'labId labName labBlock');

    res.status(200).json({
      success: true,
      message: 'Assistant profile updated successfully',
      data: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile,
        isActive: updated.isActive,
        assignedLab: updated.assignedLabId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle assistant active/inactive status (soft deactivate)
 * @route   PATCH /api/v1/users/assistants/:id/status
 * @access  Private (Admin only)
 */
export const toggleAssistantStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: ROLES.ASSISTANT });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Lab assistant not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Assistant account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
