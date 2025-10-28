// middleware/permissions.js
import Admin from '../models/admin.model.js';

// Middleware to check permissions
export const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Super admins have all permissions
      if (req.admin.role.name ==='Super Admin') {
        return next();
      }

      // Check if admin has the required permission
      const hasPermission = req.admin.can(resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({
          message: `Access denied. Required permission: ${action} ${resource}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

// Middleware to check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role.name !== 'Super Admin') {
    return res.status(403).json({
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Middleware to populate admin with role and permissions
export const populateAdminPermissions = async (req, res, next) => {
  try {
    // Admin is already populated in auth middleware, but we ensure it's there
    if (!req.admin.role || typeof req.admin.role === 'string') {
      const adminWithRole = await Admin.findById(req.admin._id)
        .populate('role')
        .select('-password');
      
      if (!adminWithRole) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      req.admin = adminWithRole;
    }
    next();
  } catch (error) {
    console.error('Error populating admin permissions:', error);
    res.status(500).json({ message: 'Failed to load admin permissions' });
  }
};