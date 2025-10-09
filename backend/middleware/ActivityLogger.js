import User from '../models/User.js';


// middleware/activityLogger.js
import ActivityLog from '../models/ActivityLog.js';
import Admin from '../models/Admin.js';

// Generic activity logger
export const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    const startTime = Date.now();
    
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      // Only log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const activityData = {
          adminId: req.admin._id,
          action,
          resourceType: options.resourceType,
          resourceId: req.params.id || options.resourceId,
          description: generateDescription(action, req, data, options),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          status: 'SUCCESS',
          metadata: {
            duration,
            query: req.query,
            body: sanitizeBody(req.body),
            ...options.metadata
          }
        };

        // Add changes for update operations
        if (action.includes('UPDATE') && req.body) {
          activityData.changes = {
            newValues: sanitizeBody(req.body)
          };
        }

        // Log asynchronously without blocking response
        ActivityLog.create(activityData).catch(console.error);
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

// Special logger for update operations with old values
export const logUpdateWithOldValues = (resourceType, getOldDataFn) => {
  return async (req, res, next) => {
    try {
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const oldData = await getOldDataFn(req.params.id);
        req.oldData = oldData; // Store old data in request
      }
    } catch (error) {
      console.error('Error getting old data for logging:', error);
    }
    next();
  };
};

// Login activity logger
export const logLoginActivity = async (req, admin, token) => {
  const activityLog = new ActivityLog({
    adminId: admin._id,
    action: 'LOGIN',
    resourceType: 'System',
    description: `Admin ${admin.name} logged in successfully`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    endpoint: '/api/auth/login',
    method: 'POST',
    status: 'SUCCESS',
    metadata: {
      loginMethod: 'email'
    }
  });
  
  await activityLog.save();
};

// Logout activity logger
export const logLogoutActivity = async (req, admin) => {
  const activityLog = new ActivityLog({
    adminId: admin._id,
    action: 'LOGOUT',
    resourceType: 'System',
    description: `Admin ${admin.name} logged out`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    endpoint: '/api/auth/logout',
    method: 'POST',
    status: 'SUCCESS'
  });
  
  await activityLog.save();
};

// Navigation logger (to be called from frontend)
export const logNavigation = async (adminId, fromPage, toPage, ipAddress, userAgent) => {
  let user=await Admin.findOne({_id:adminId})
  if(user?.role=='admin')
{
  const activityLog = new ActivityLog({
    adminId,
    action: 'NAVIGATE',
    resourceType: 'System',
    description: `Navigated from ${fromPage} to ${toPage}`,
    ipAddress,
    userAgent,
    endpoint: toPage,
    method: 'GET',
    status: 'SUCCESS',
    metadata: {
      fromPage,
      toPage
    }
  });

  await activityLog.save();
   }
};

// Helper function to generate descriptive messages
const generateDescription = (action, req, responseData, options) => {
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
    REMOVE_REACTION: `${adminName} removed reaction from post ${req.params.postId}`,
    VIEW_EVENT: `${adminName} viewed event details`,
    UPDATE_EVENT: `${adminName} updated event ${req.params.id}`,
    DELETE_EVENT: `${adminName} deleted event ${req.params.id}`,
    VIEW_ACTIVITY_LOGS: `${adminName} viewed activity logs`,
    EXPORT_DATA: `${adminName} exported data`
  };
  
  return descriptions[action] || `${adminName} performed ${action}`;
};

// Sanitize sensitive data from request body
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'otpVerificationId'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***HIDDEN***';
    }
  });
  
  return sanitized;
};