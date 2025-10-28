// routes/users.route.js
import express from 'express';
import User from '../models/model.user.js';
import Post from '../models/Post.js';
import ActivityLog from '../models/ActivityLog.js';
import {
  authenticate,
  auth
} from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';

const router = express.Router();

// Helper to get user for logging (without sensitive fields)
const getUserForLogging = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens');
};

/**
 * ADMIN / RBAC PROTECTED ROUTES
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

      const query = { isDeleted: false }; // Only non-deleted users
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
      const users = await User.find({ isDeleted: false }) // Only non-deleted users
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
      const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password -refreshTokens');
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
  logUpdateWithOldValues('User', getUserForLogging),
  logActivity('UPDATE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const oldUser = req.oldData;

      // Perform the update
      let user = await User.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false }, // Only update non-deleted users
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_USER failed: user ${req.params.id} not found or deleted` }
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
 * Soft-delete user (admin)
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
      const result = await User.softDelete({ _id: req.params.id });
      
      if (result.nModified === 0) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `DELETE_USER failed: user ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'User not found' });
      }

      // Hide all user's posts using soft delete
      await Post.softDelete({ author: req.params.id });

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
        scheduledDeletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
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
 * Permission: users:edit
 */
router.patch(
  '/users/:id/restore',
  authenticate,
  populateAdminPermissions,
  requirePermission('users', 'edit'),
  logActivity('RESTORE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const result = await User.restore({ _id: req.params.id });
      
      if (result.nModified === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Restore user's posts
      await Post.restore({ author: req.params.id });

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
      const users = await User.find({ 
        isDeleted: false, 
        isActive: true 
      })
        .select('-password -refreshTokens')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments({ 
        isDeleted: false, 
        isActive: true 
      });

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
      const deletedUsers = await User.findWithDeleted({ isDeleted: true })
        .select('-password -refreshTokens')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ deletedAt: -1 });

      const total = await User.countDocuments({ isDeleted: true });

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
          await User.softDelete({ _id: { $in: userIds } });
          await Post.softDelete({ author: { $in: userIds } });
          break;

        case 'activate':
          await User.updateMany({ 
            _id: { $in: userIds }, 
            isDeleted: false 
          }, { isActive: true });
          break;

        case 'deactivate':
          await User.updateMany({ 
            _id: { $in: userIds }, 
            isDeleted: false 
          }, { isActive: false });
          break;

        case 'restore':
          await User.restore({ _id: { $in: userIds } });
          await Post.restore({ author: { $in: userIds } });
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
      const totalUsers = await User.countDocuments({ isDeleted: false });
      const activeUsers = await User.countDocuments({ 
        isActive: true, 
        isDeleted: false 
      });
      const deletedUsers = await User.countDocuments({ isDeleted: true });
      const adminUsers = await User.countDocuments({ 
        role: 'admin', 
        isDeleted: false 
      });

      // Weekly registration stats
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyRegistrations = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        isDeleted: false
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
 */

// Get user profile
router.get(
  '/users/profile',
  auth,
  async (req, res) => {
    try {
      const user = await User.findOne({ 
        _id: req.user._id, 
        isDeleted: false 
      }).select('-password -refreshTokens');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found or deleted' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;