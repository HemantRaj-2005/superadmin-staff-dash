



// routes/users.js
import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Admin from '../models/Admin.js';
import ActivityLog from '../models/ActivityLog.js';
import {
  authenticate,    // admin auth (populates req.admin)
  authorize,       // role-based authorize helper (if you use it)
  auth,            // regular user auth (populates req.user)
  adminAuth        // admin-only shorthand middleware (if available)
} from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';

const router = express.Router();

// Helper to get user for logging (without sensitive fields)
const getUserForLogging = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens');
};

// Apply authentication and permission population to admin routes
// NOTE: we won't apply this globally because some endpoints (like /profile) are for regular users (auth)
router.use('/',
  // only mount these middlewares for admin-protected endpoints under /users except /profile
  // we'll call them explicitly on routes instead of globally to avoid interfering with user routes
  (req, res, next) => next()
);

/**
 * ADMIN / RBAC PROTECTED ROUTES
 * These expect `authenticate` + `populateAdminPermissions` to run before requirePermission checks.
 * We'll explicitly include authenticate + populateAdminPermissions in each admin route to be explicit.
 */

/**
 * GET /users
 * List users with pagination & search
 * Permission: users:view
 */
router.get(
  '/users',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'view'),
  logActivity('VIEW_USERS', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';

      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('firstName lastName email profileImage role isActive deletedAt createdAt')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /users/export
 * Export users (csv/json)
 * Permission: users:export
 */
router.get(
  '/users/export',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'export'),
  logActivity('EXPORT_USERS', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('firstName lastName email role createdAt isActive deletedAt')
        .sort({ createdAt: -1 })
        .limit(1000);

      // Convert to CSV
      const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Created At', 'Is Active', 'Deleted At'];
      const csvRows = [headers.join(',')];

      users.forEach(user => {
        const row = [
          `"${user.firstName || ''}"`,
          `"${user.lastName || ''}"`,
          `"${user.email || ''}"`,
          `"${String(user.role || '')}"`,
          `"${user.createdAt ? user.createdAt.toISOString() : ''}"`,
          `"${Boolean(user.isActive)}"`,
          `"${user.deletedAt ? user.deletedAt.toISOString() : ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvData = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /users/:id
 * Get single user details
 * Permission: users:view
 */
router.get(
  '/users/:id',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'view'),
  logActivity('VIEW_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password -refreshTokens');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 
 * Update user with old-values logging and activity entry
 * Permission: users:edit
 */
router.put(
  '/users/:id',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'edit'),
  logUpdateWithOldValues('User', getUserForLogging), // sets req.oldData
  logActivity('UPDATE_USER', { resourceType: 'User' }), // create pending log and sets req.activityLogId
  async (req, res) => {
    try {
      const oldUser = req.oldData;

      // Perform the update
      let user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      // re-fetch to ensure latest populated fields (if any)
      user = await User.findById(req.params.id).select('-password -refreshTokens');

      if (!user) {
        // mark the activity as failed if
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_USER failed: user ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'User not found' });
      }

      try {
        const newObj = user.toObject();
        const oldObj = oldUser || null;

        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(
            req.activityLogId,
            {
              $set: {
                changes: { oldValues: oldObj, newValues: newObj },
                status: 'SUCCESS',
                description: `UPDATE_USER performed by ${req.admin?.name || 'Unknown Admin'} on user ${req.params.id}`
              }
            },
            { new: true }
          ).catch((e) => {
            console.error('Failed to update ActivityLog with changes:', e);
          });
        }
      } catch (innerErr) {
        console.error('Error while writing changes to ActivityLog:', innerErr);
      }

      return res.json(user);
    } catch (error) {
      console.error('PUT /users/:id error:', error);
      // Update activity log status if possible
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      return res.status(400).json({ message: error.message });
    }
  }
);

/**
 * DELETE /users/:id
 * Soft-delete user (admin) - schedules permanent deletion and hides user's posts
 * Permission: users:delete
 */
router.delete(
  '/users/:id',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'delete'),
  logActivity('DELETE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        // mark activity log as failed if applicable
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `DELETE_USER failed: user ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'User not found' });
      }

      // Soft delete the user
      user.isActive = false;
      user.deletedAt = new Date();
      user.scheduledForPermanentDeletion = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      await user.save();

      // Hide all user's posts
      await Post.updateMany(
        { author: user._id },
        { isVisible: false }
      );

      // update activity log success if present
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            status: 'SUCCESS',
            description: `DELETE_USER (soft) performed by ${req.admin?.name || 'Unknown Admin'} on user ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({
        message: 'User scheduled for deletion successfully',
        scheduledDeletion: user.scheduledForPermanentDeletion
      });
    } catch (error) {
      console.error('DELETE /users/:id error:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * PATCH /users/:id/restore
 * Restore a soft-deleted user
 * Permission: users:edit (or a separate 'restore' permission if you have one)
 */
router.patch(
  '/users/:id/restore',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'edit'),
  logActivity('RESTORE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: 'User not found' });

      user.isActive = true;
      user.deletedAt = null;
      user.scheduledForPermanentDeletion = null;
      await user.save();

      // Restore user's posts
      await Post.updateMany(
        { author: user._id },
        { isVisible: true }
      );

      // Update activity log if present
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            status: 'SUCCESS',
            description: `RESTORE_USER performed by ${req.admin?.name || 'Unknown Admin'} on user ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'User restored successfully' });
    } catch (error) {
      console.error('PATCH /users/:id/restore error:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * GET /users/active
 * Get all active users (for admin)
 * Permission: users:view
 */
router.get(
  '/users/active',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const users = await User.find({ deletedAt: null })
        .select('-password -refreshTokens')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({ deletedAt: null });

      res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * GET /users/deleted
 * Get soft-deleted users (for admin)
 * Permission: users:view
 */
router.get(
  '/users/deleted',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const deletedUsers = await User.find({ deletedAt: { $ne: null } })
        .select('-password -refreshTokens')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ deletedAt: -1 });

      const total = await User.countDocuments({ deletedAt: { $ne: null } });

      res.json({
        users: deletedUsers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * POST /users/bulk-action
 * Bulk actions (soft-delete, activate, deactivate)
 * Permission: users:edit
 */
router.post(
  '/users/bulk-action',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'edit'),
  logActivity('BULK_USER_ACTION', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const { userIds = [], action } = req.body;

      switch (action) {
        case 'delete':
          await User.updateMany(
            { _id: { $in: userIds } },
            {
              isActive: false,
              deletedAt: new Date(),
              scheduledForPermanentDeletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
          );
          // hide posts for those users
          await Post.updateMany({ author: { $in: userIds } }, { isVisible: false });
          break;

        case 'activate':
          await User.updateMany({ _id: { $in: userIds } }, { isActive: true });
          break;

        case 'deactivate':
          await User.updateMany({ _id: { $in: userIds } }, { isActive: false });
          break;

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      // mark activity log success if present
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            status: 'SUCCESS',
            description: `BULK_USER_ACTION "${action}" performed by ${req.admin?.name || 'Unknown Admin'}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Bulk action completed successfully' });
    } catch (error) {
      console.error('POST /users/bulk-action error:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * GET /users/stats
 * User statistics for admin dashboard
 * Permission: users:view
 */
router.get(
  '/users/stats',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true, deletedAt: null });
      const deletedUsers = await User.countDocuments({ deletedAt: { $ne: null } });

      // adminUsers count (if you store role as a string 'admin' or a role id)
      const adminUsers = await User.countDocuments({ role: 'admin' });

      // Weekly registration stats
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyRegistrations = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });

      res.json({
        totalUsers,
        activeUsers,
        deletedUsers,
        adminUsers,
        weeklyRegistrations
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * USER-FACING ROUTES
 * - /users/profile for regular authenticated users
 * These use the `auth` middleware (non-admin).
 */

// Get user profile
router.get(
  '/users/profile',
  auth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password -refreshTokens');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
