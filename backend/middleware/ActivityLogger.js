// middleware/activityLogger.js
import ActivityLog from '../models/activityLog.model.js';
import Admin from '../models/admin.model.js';
import { getClientIp , getIpDetails, parseUserAgent} from '../utils/ipUtils.js';
// Helper: sanitize sensitive fields before logging
const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'otpVerificationId'];
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  const copy = Array.isArray(body) ? body.slice() : { ...body };
  (Array.isArray(copy) ? Object.keys(copy) : Object.keys(copy)).forEach((k) => {
    if (sensitiveFields.includes(k)) copy[k] = '***HIDDEN***';
  });
  return copy;
};

const generateDescription = (action, req, responseData, options = {}) => {
  const adminName = req.admin?.name || 'Unknown Admin';
  const descriptions = {
    LOGIN: `${adminName} logged in`,
    LOGOUT: `${adminName} logged out`,
    NAVIGATE: `${adminName} navigated to ${req.originalUrl}`,
    VIEW_USER: `${adminName} viewed user details`,
    UPDATE_USER: `${adminName} updated user ${req.params.id}`,
    DELETE_USER: `${adminName} deleted user ${req.params.id}`,
    VIEW_POST: `${adminName} viewed post details`,
    UPDATE_POST: `${adminName} updated post ${req.params.id}`,
    DELETE_POST: `${adminName} deleted post ${req.params.id}`,
    VIEW_EVENT: `${adminName} viewed event details`,
    UPDATE_EVENT: `${adminName} updated event ${req.params.id}`,
    DELETE_EVENT: `${adminName} deleted event ${req.params.id}`,
    VIEW_ACTIVITY_LOGS: `${adminName} viewed activity logs`,
    EXPORT_DATA: `${adminName} exported data`
  };
  return descriptions[action] || `${adminName} performed ${action}`;
};

/**
 * Create a pending activity log before the route runs and attach its id on req.
 */
export const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    const start = Date.now();

    // create a pending activity log ,ID to update later
    
    try {
      const activity = await ActivityLog.create({
        adminId: req.admin?._id || null,
        action,
        resourceType: options.resourceType || null,
        resourceId: req.params?.id || options.resourceId || null,
        description: generateDescription(action, req, null, options),
         ipAddress: getClientIp(req), 
  userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        status: 'PENDING',
        metadata: { ...options.metadata }
      });

      req.activityLogId = activity._id;
    } catch (err) {
      // Don't block the route if we fail to create the log; still continue
      console.warn('logActivity: failed to create initial ActivityLog:', err);
      req.activityLogId = null;
    }

    // Wrap res.json to update the activity log after the response is prepared
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      const duration = Date.now() - start;

      // Build the update payload
      const updatePayload = {
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILED',
        description: generateDescription(action, req, data, options),
        metadata: {
          ...(options.metadata || {}),
          duration,
          query: req.query,
          body: sanitizeBody(req.body)
        }
      };

      // If action is an UPDATE and route didn't explicitly set changes, include request body as newValues.
      if (action.includes('UPDATE') && req.oldData && req.body) {
        updatePayload.changes = {
          oldValues: req.oldData, // hopefully plain object set by logUpdateWithOldValues
          newValues: sanitizeBody(req.body)
        };
      }

      // Fire-and-forget update to the ActivityLog (don't block response)
      if (req.activityLogId) {
        ActivityLog.findByIdAndUpdate(req.activityLogId, { $set: updatePayload }).catch((e) => {
          console.error('logActivity: failed to update ActivityLog after response:', e);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Fetch and attach old data (plain object) for update operations.
 * getOldDataFn(id, req) -> may return mongoose doc or plain object
 */
export const logUpdateWithOldValues = (resourceType, getOldDataFn) => {
  return async (req, res, next) => {
    try {
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const id = req.params.id;
        if (id) {
          const oldData = await getOldDataFn(id, req);
          // Ensure plain JS object, not a Mongoose document
          req.oldData = oldData && typeof oldData.toObject === 'function' ? oldData.toObject() : oldData || null;
        } else {
          req.oldData = null;
        }
      }
    } catch (error) {
      console.error('Error in logUpdateWithOldValues:', error);
      req.oldData = null;
    }
    next();
  };
};

// Login/logout/navigation helpers (unchanged behavior)
export const logLoginActivity = async (req, admin, token) => {
  const activity = new ActivityLog({
    adminId: admin._id,
    action: 'LOGIN',
    resourceType: 'System',
    description: `Admin ${admin.name} logged in successfully`,
   ipAddress: getClientIp(req), 
  userAgent: req.get('User-Agent'),
    endpoint: '/api/auth/login',
    method: 'POST',
    status: 'SUCCESS',
    metadata: { loginMethod: 'email' }
  });
  await activity.save();
};

export const logLogoutActivity = async (req, admin) => {
  const activity = new ActivityLog({
    adminId: admin._id,
    action: 'LOGOUT',
    resourceType: 'System',
    description: `Admin ${admin.name} logged out`,
    ipAddress: getClientIp(req), 
  userAgent: req.get('User-Agent'),
    endpoint: '/api/auth/logout',
    method: 'POST',
    status: 'SUCCESS'
  });
  await activity.save();
};

export const logNavigation = async (adminId, fromPage, toPage, ipAddress, userAgent) => {
  const user = await Admin.findOne({ _id: adminId });
  if (user?.role === 'admin') {
    const activity = new ActivityLog({
      adminId,
      action: 'NAVIGATE',
      resourceType: 'System',
      description: `Navigated from ${fromPage} to ${toPage}`,
     ipAddress: getClientIp(req), 
  userAgent: req.get('User-Agent'),
      endpoint: toPage,
      method: 'GET',
      status: 'SUCCESS',
      metadata: { fromPage, toPage }
    });
    await activity.save();
  }
};
