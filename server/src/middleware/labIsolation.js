import { ROLES } from '../utils/constants.js';

/**
 * Enforces strict lab-level isolation for Lab Assistants
 * An assistant can ONLY query/modify resources assigned to their specific lab.
 */
export const enforceLabIsolation = (req, res, next) => {
  // Admins have global administrative access
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  // Assistant must have an assigned lab
  const assignedLabId = req.user.assignedLabId?._id || req.user.assignedLabId;

  if (!assignedLabId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Lab assistant does not have an assigned laboratory'
    });
  }

  // Determine requested labId from body, params, or query
  const requestedLabId = req.params.labId || req.body.labId || req.query.labId;

  if (requestedLabId && requestedLabId.toString() !== assignedLabId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Security Policy Violation: You cannot access or alter resources belonging to another laboratory'
    });
  }

  // Automatically scope assistant's mutations/queries to their assigned lab
  req.assignedLabId = assignedLabId;
  next();
};
