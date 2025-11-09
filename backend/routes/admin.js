
// // routes/admin.js 
// import express from 'express';
// import { authenticate } from '../middleware/auth.js';
// import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
// import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
// import User from '../models/User.js';
// import Admin from '../models/Admin.js';
// import ActivityLog from '../models/ActivityLog.js';

// const router = express.Router();

// // Helper: Get user for logging (without sensitive fields)
// const getUserForLogging = async (userId) => {
//   return await User.findById(userId).select('-password -refreshTokens');
// };

// // Apply authentication and permission population to all routes
// router.use(authenticate, populateAdminPermissions);

// /**
//  * GET /users
//  * List users with pagination & search
//  * Permissions: users:view
//  */
// router.get(
//   '/users',
//   authenticate,
//     requirePermission('users', 'view'),


  
  
//   async (req, res) => {
//     try {
//       const page = parseInt(req.query.page, 10) || 1;
//       const limit = parseInt(req.query.limit, 10) || 10;
//       const search = req.query.search || '';

//       const query = {};
//       if (search) {
//         query.$or = [
//           { firstName: { $regex: search, $options: 'i' } },
//           { lastName: { $regex: search, $options: 'i' } },
//           { email: { $regex: search, $options: 'i' } }
//         ];
//       }

//       const users = await User.find(query)
//         .select('firstName lastName email profileImage role createdAt')
//         .limit(limit)
//         .skip((page - 1) * limit)
//         .sort({ createdAt: -1 });

//       const total = await User.countDocuments(query);

//       res.json({
//         users,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         total
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// /**
//  * GET /users/:id
//  * Get single user details
//  * Permissions: users:view
//  */
// router.get(
//   '/users/:id',
//   requirePermission('users', 'view'),
//   logActivity('VIEW_USER', { resourceType: 'User' }),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).select('-password -refreshTokens');
//       if (!user) return res.status(404).json({ message: 'User not found' });
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// /**
//  * PUT /users/:id
//  * Update user with old-values logging and activity entry
//  * Permissions: users:edit
//  */
// router.put(
//   '/users/:id',
//   requirePermission('users', 'edit'),
//   logUpdateWithOldValues('User', getUserForLogging),
//   logActivity('UPDATE_USER', { resourceType: 'User' }),
//   async (req, res) => {
//     try {
//       const oldUser = req.oldData;

//       // Perform the update
//       let user = await User.findByIdAndUpdate(
//         req.params.id,
//         { $set: req.body },
//         { new: true, runValidators: true }
//       ).select('-password -refreshTokens');

//       // re-fetch to ensure latest populated fields (if any)
//       user = await User.findById(req.params.id).select('-password -refreshTokens');

//       if (!user) {
//         // mark the activity as failed if we created one
//         if (req.activityLogId) {
//           await ActivityLog.findByIdAndUpdate(req.activityLogId, {
//             $set: { status: 'FAILED', description: `UPDATE_USER failed: user ${req.params.id} not found` }
//           }).catch(console.error);
//         }
//         return res.status(404).json({ message: 'User not found' });
//       }

//       try {
//         const newObj = user.toObject();
//         const oldObj = oldUser || null;

//         if (req.activityLogId) {
//           await ActivityLog.findByIdAndUpdate(
//             req.activityLogId,
//             {
//               $set: {
//                 changes: { oldValues: oldObj, newValues: newObj },
//                 status: 'SUCCESS',
//                 description: `UPDATE_USER performed by ${req.admin?.name || 'Unknown Admin'} on user ${req.params.id}`
//               }
//             },
//             { new: true }
//           ).catch((e) => {
//             console.error('Failed to update ActivityLog with changes:', e);
//           });
//         }
//       } catch (innerErr) {
//         console.error('Error while writing changes to ActivityLog:', innerErr);
//       }

//       return res.json(user);
//     } catch (error) {
//       console.error('PUT /users/:id error:', error);
//       // Update activity log status if possible
//       if (req.activityLogId) {
//         await ActivityLog.findByIdAndUpdate(req.activityLogId, {
//           $set: { status: 'FAILED', description: error.message }
//         }).catch(console.error);
//       }
//       return res.status(400).json({ message: error.message });
//     }
//   }
// );

// /**
//  * DELETE /users/:id
//  * Delete user. Permissions: users:delete
//  */
// router.delete(
//   '/users/:id',
//   requirePermission('users', 'delete'),
//   logActivity('DELETE_USER', { resourceType: 'User' }),
//   async (req, res) => {
//     try {
//       const user = await User.findByIdAndDelete(req.params.id);
//       if (!user) return res.status(404).json({ message: 'User not found' });

//       res.json({ message: 'User deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// /**
//  * GET /activity-logs
//  * Requires activity_logs:view permission (super admin automatically has this)
// //  */
// // router.get(
// //   '/activity-logs',
// //   requirePermission('activity_logs', 'view'),
// //   async (req, res) => {
// //     try {
// //       const page = parseInt(req.query.page, 10) || 1;
// //       const limit = parseInt(req.query.limit, 10) || 20;

// //       const {
// //         action = '',
// //         resourceType = '',
// //         adminId = '',
// //         dateFrom = '',
// //         dateTo = '',
// //         search = ''
// //       } = req.query;

// //       const query = {};

// //       if (action) query.action = action;
// //       if (resourceType) query.resourceType = resourceType;
// //       if (adminId) query.adminId = adminId;

// //       if (dateFrom || dateTo) {
// //         query.createdAt = {};
// //         if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
// //         if (dateTo) query.createdAt.$lte = new Date(dateTo);
// //       }

// //       if (search) {
// //         query.description = { $regex: search, $options: 'i' };
// //       }

// //       const logs = await ActivityLog.find(query)
// //         .populate('adminId', 'name email role')
// //         .populate('resourceId')
// //         .sort({ createdAt: -1 })
// //         .limit(limit)
// //         .skip((page - 1) * limit);

// //       const total = await ActivityLog.countDocuments(query);

// //       // Get available filters
// //       const actions = await ActivityLog.distinct('action');
// //       const resourceTypes = await ActivityLog.distinct('resourceType');
// //       const adminIds = await ActivityLog.distinct('adminId');

// //       res.json({
// //         logs,
// //         totalPages: Math.ceil(total / limit),
// //         currentPage: page,
// //         total,
// //         filters: {
// //           actions,
// //           resourceTypes,
// //           admins: await Promise.all(
// //             adminIds.map(async (aId) => {
// //               try {
// //                 return await Admin.findById(aId).select('name email role');
// //               } catch {
// //                 return null;
// //               }
// //             })
// //           ).then(list => list.filter(Boolean))
// //         }
// //       });
// //     } catch (error) {
// //       res.status(500).json({ message: error.message });
// //     }
// //   }
// // );

// // routes/admin.js (merged activity-logs route)
// router.get(
//   '/activity-logs',
//   requirePermission('activity_logs', 'view'),
//   async (req, res) => {
//     try {
//       // Parse pagination params
//       const page = parseInt(req.query.page, 10) || 1;
//       const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200); // cap limit for safety
//       const skip = (page - 1) * limit;

//       // Search & filter params (device filters included)
//       const {
//         action = '',
//         resourceType = '',
//         adminId = '',
//         dateFrom = '',
//         dateTo = '',
//         search = '',
//         deviceType = '',
//         os = '',
//         browser = ''
//       } = req.query;

//       // Build Mongo query
//       const query = {};

//       if (action) query.action = action;
//       if (resourceType) query.resourceType = resourceType;
//       if (adminId) query.adminId = adminId;

//       // Date range filter
//       if (dateFrom || dateTo) {
//         query.createdAt = {};
//         if (dateFrom) {
//           const from = new Date(dateFrom);
//           if (!Number.isNaN(from.getTime())) query.createdAt.$gte = from;
//         }
//         if (dateTo) {
//           const to = new Date(dateTo);
//           if (!Number.isNaN(to.getTime())) query.createdAt.$lte = to;
//         }
//       }

//       // Text search on description
//       if (search) {
//         query.description = { $regex: search, $options: 'i' };
//       }

//       // Device type filter (exact match)
//       if (deviceType) {
//         query['deviceInfo.device.type'] = deviceType;
//       }

//       // OS filter (partial, case-insensitive)
//       if (os) {
//         query['deviceInfo.os.name'] = { $regex: os, $options: 'i' };
//       }

//       // Browser filter (partial, case-insensitive)
//       if (browser) {
//         query['deviceInfo.browser.name'] = { $regex: browser, $options: 'i' };
//       }

//       // Query DB
//       const [logs, total] = await Promise.all([
//         ActivityLog.find(query)
//           .populate('adminId', 'name email role')
//           .populate('resourceId')
//           .sort({ createdAt: -1 })
//           .limit(limit)
//           .skip(skip),
//         ActivityLog.countDocuments(query)
//       ]);

//       // Build filter options (distinct values)
//       const [
//         actions,
//         resourceTypes,
//         adminIds,
//         deviceTypes,
//         osList,
//         browserList
//       ] = await Promise.all([
//         ActivityLog.distinct('action'),
//         ActivityLog.distinct('resourceType'),
//         ActivityLog.distinct('adminId'),
//         ActivityLog.distinct('deviceInfo.device.type'),
//         ActivityLog.distinct('deviceInfo.os.name'),
//         ActivityLog.distinct('deviceInfo.browser.name')
//       ]);

//       // Resolve admin details for the admin filter (filter out nulls)
//       const admins = (await Promise.all(
//         (adminIds || [])
//           .filter(Boolean)
//           .map(async (aId) => {
//             try {
//               return await Admin.findById(aId).select('name email role');
//             } catch {
//               return null;
//             }
//           })
//       )).filter(Boolean);

//       res.json({
//         logs,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         total,
//         filters: {
//           actions,
//           resourceTypes,
//           deviceTypes: deviceTypes.filter(Boolean),
//           os: osList.filter(Boolean),
//           browsers: browserList.filter(Boolean),
//           admins
//         }
//       });
//     } catch (error) {
//       console.error('GET /activity-logs error:', error);
//       res.status(500).json({ message: error.message || 'Internal Server Error' });
//     }
//   }
// );

// /**
//  * GET /activity-logs/:id
//  * Requires activity_logs:view permission
//  */
// router.get(
//   '/activity-logs/:id',
//   requirePermission('activity_logs', 'view'),
//   async (req, res) => {
//     try {
//       const log = await ActivityLog.findById(req.params.id)
//         .populate('adminId', 'name email role')
//         .populate('resourceId');

//       if (!log) return res.status(404).json({ message: 'Activity log not found' });

//       res.json(log);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// /**
//  * GET /activity-logs/export
//  * Export activity logs (json | csv). Requires activity_logs:export permission
//  */
// router.get(
//   '/activity-logs/export',
//   requirePermission('activity_logs', 'export'),
//   logActivity('EXPORT_DATA'),
//   async (req, res) => {
//     try {
//       const format = (req.query.format || 'json').toLowerCase();

//       const logs = await ActivityLog.find()
//         .populate('adminId', 'name email')
//         .sort({ createdAt: -1 })
//         .limit(1000); // hard limit for export

//       if (format === 'csv') {
//         const csvData = convertToCSV(logs);
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
//         return res.send(csvData);
//       }

//       res.json(logs);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// // Helper: convert activity logs to CSV
// const convertToCSV = (logs) => {
//   const headers = ['Timestamp', 'Admin', 'Action', 'Resource', 'Description', 'IP Address', 'Status'];
//   const csvRows = [headers.join(',')];

//   logs.forEach((log) => {
//     const row = [
//       log.createdAt ? log.createdAt.toISOString() : '',
//       `"${log.adminId?.name || 'Unknown'}"`,
//       log.action || '',
//       log.resourceType || 'N/A',
//       `"${(log.description || '').replace(/"/g, '""')}"`,
//       log.ipAddress || '',
//       log.status || ''
//     ];
//     csvRows.push(row.join(','));
//   });

//   return csvRows.join('\n');
// };

// export default router;


// routes/admin.js - Fixed version
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ActivityLog from '../models/ActivityLog.js';
import UserCleanupService from '../cleanUpService/userCleanUp.js';

const router = express.Router();

// Helper: Get user for logging (without sensitive fields)
const getUserForLogging = async (userId) => {
  try {
    return await User.findById(userId).select('-password -refreshTokens');
  } catch (error) {
    console.error('Error getting user for logging:', error);
    return null;
  }
};

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

/**
 * GET /users
 * List users with pagination & search - with soft delete support
 * Permissions: users:view
 */
router.get(
  '/users',
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';
      const includeDeleted = req.query.includeDeleted === 'true';
      const all = req.query.all === 'true';

      let query = {};
      
      // Build search query
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Exclude soft-deleted users unless specifically requested
      if (!includeDeleted) {
        query.isDeleted = false;
      }

      let usersQuery;
      if (all) {
        // Get all users without pagination (for export)
        usersQuery = User.find(query)
          .select('firstName lastName email profileImage role createdAt isDeleted deletedAt scheduledForPermanentDeletion')
          .sort({ createdAt: -1 });
      } else {
        // Paginated query
        usersQuery = User.find(query)
          .select('firstName lastName email profileImage role createdAt isDeleted deletedAt scheduledForPermanentDeletion')
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({ createdAt: -1 });
      }

      const users = await usersQuery;
      const total = await User.countDocuments(query);

      const responseData = {
        users: users.map(user => ({
          ...user.toObject(),
          daysUntilPermanentDeletion: user.daysUntilPermanentDeletion
        })),
        totalPages: all ? 1 : Math.ceil(total / limit),
        currentPage: all ? 1 : page,
        total
      };

      // For backward compatibility with frontend
      if (all) {
        return res.json(responseData.users);
      }

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        message: 'Failed to fetch users: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * GET /users/deleted
 * Get deleted users only
 * Permissions: users:view
 */
router.get(
  '/users/deleted',
  requirePermission('users', 'view'),
  logActivity('VIEW_DELETED_USERS', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';
      const all = req.query.all === 'true';
      
      const query = { isDeleted: true };
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      let usersQuery;
      if (all) {
        usersQuery = User.find(query)
          .select('firstName lastName email profileImage role createdAt deletedAt scheduledForPermanentDeletion')
          .sort({ deletedAt: -1 });
      } else {
        usersQuery = User.find(query)
          .select('firstName lastName email profileImage role createdAt deletedAt scheduledForPermanentDeletion')
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({ deletedAt: -1 });
      }

      const users = await usersQuery;
      const total = await User.countDocuments(query);

      const responseData = {
        users: users.map(user => ({
          ...user.toObject(),
          daysUntilPermanentDeletion: user.daysUntilPermanentDeletion
        })),
        totalPages: all ? 1 : Math.ceil(total / limit),
        currentPage: all ? 1 : page,
        total
      };

      // For backward compatibility with frontend
      if (all) {
        return res.json(responseData.users);
      }

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      res.status(500).json({ 
        message: 'Failed to fetch deleted users: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * GET /users/:id
 * Get single user details (including soft-deleted users)
 * Permissions: users:view
 */
router.get(
  '/users/:id',
  requirePermission('users', 'view'),
  logActivity('VIEW_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      // Use findById which works for both active and deleted users
      const user = await User.findById(req.params.id)
        .select('-password -refreshTokens');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is deleted and handle accordingly
      const userObject = user.toObject();
      let daysUntilPermanentDeletion = null;
      
      if (user.isDeleted && user.deletedAt) {
        const deletionDate = new Date(user.deletedAt);
        const permanentDeletionDate = new Date(deletionDate);
        permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 90);
        const now = new Date();
        const timeDiff = permanentDeletionDate.getTime() - now.getTime();
        daysUntilPermanentDeletion = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }

      res.json({
        ...userObject,
        daysUntilPermanentDeletion
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ 
        message: 'Failed to fetch user details: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * PUT /users/:id
 * Update user with old-values logging and activity entry
 * Permissions: users:edit
 */
router.put(
  '/users/:id',
  requirePermission('users', 'edit'),
  logUpdateWithOldValues('User', getUserForLogging),
  logActivity('UPDATE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const oldUser = req.oldData;

      // Check if user exists and is not deleted
      const existingUser = await User.findOne({ _id: req.params.id, isDeleted: false });
      if (!existingUser) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `UPDATE_USER failed: user ${req.params.id} not found or is deleted` 
            }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'User not found or has been deleted' });
      }

      // Perform the update
      let user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      // Re-fetch to ensure latest populated fields
      user = await User.findById(req.params.id).select('-password -refreshTokens');

      if (!user) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `UPDATE_USER failed: user ${req.params.id} not found after update` 
            }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'User not found after update' });
      }

      // Log changes to activity log
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
          $set: { 
            status: 'FAILED', 
            description: error.message 
          }
        }).catch(console.error);
      }
      
      return res.status(400).json({ 
        message: 'Failed to update user: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * DELETE /users/:id
 * Soft delete user. Permissions: users:delete
 */
router.delete(
  '/users/:id',
  requirePermission('users', 'delete'),
  logActivity('SOFT_DELETE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isDeleted) {
        return res.status(400).json({ message: 'User is already deleted' });
      }

      // Set deletion fields
      user.isDeleted = true;
      user.deletedAt = new Date();
      
      // Schedule for permanent deletion after 90 days
      const permanentDeletionDate = new Date();
      permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 90);
      user.scheduledForPermanentDeletion = permanentDeletionDate;
      
      await user.save();

      res.json({ 
        message: 'User moved to trash successfully',
        deletedAt: user.deletedAt,
        scheduledForPermanentDeletion: user.scheduledForPermanentDeletion
      });
    } catch (error) {
      console.error('Error soft deleting user:', error);
      res.status(500).json({ 
        message: 'Failed to move user to trash: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * POST /users/:id/restore
 * Restore soft-deleted user
 * Permissions: users:edit
 */
router.post(
  '/users/:id/restore',
  requirePermission('users', 'edit'),
  logActivity('RESTORE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isDeleted) {
        return res.status(400).json({ message: 'User is not deleted' });
      }

      // Restore user
      user.isDeleted = false;
      user.deletedAt = null;
      user.scheduledForPermanentDeletion = null;
      
      await user.save();
      
      res.json({ 
        message: 'User restored successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isDeleted: user.isDeleted
        }
      });
    } catch (error) {
      console.error('Error restoring user:', error);
      res.status(400).json({ 
        message: 'Failed to restore user: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * DELETE /users/:id/permanent
 * Permanent delete user (immediate - for super admin only)
 * Permissions: users:delete
 */
router.delete(
  '/users/:id/permanent',
  requirePermission('users', 'delete'),
  logActivity('PERMANENT_DELETE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await User.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'User permanently deleted successfully' });
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      res.status(500).json({ 
        message: 'Failed to permanently delete user: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * POST /users/cleanup/run
 * Manual trigger for cleanup (super admin only)
 * Permissions: users:manage
 */
router.post(
  '/users/cleanup/run',
  requirePermission('users', 'manage'),
  logActivity('MANUAL_USER_CLEANUP', { resourceType: 'System' }),
  async (req, res) => {
    try {
      // Find users that were deleted more than 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const usersToDelete = await User.find({
        isDeleted: true,
        deletedAt: { $lte: ninetyDaysAgo }
      });

      let deletedCount = 0;
      
      // Permanently delete each user
      for (const user of usersToDelete) {
        await User.findByIdAndDelete(user._id);
        deletedCount++;
      }

      res.json({
        message: `User cleanup completed successfully. Permanently deleted ${deletedCount} users.`,
        result: {
          deletedCount,
          cutoffDate: ninetyDaysAgo
        }
      });
    } catch (error) {
      console.error('Error running manual cleanup:', error);
      res.status(500).json({ 
        message: 'Failed to run cleanup: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * GET /users/cleanup/stats
 * Get cleanup statistics
 * Permissions: users:view
 */
router.get(
  '/users/cleanup/stats',
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const now = new Date();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const [
        totalDeletedUsers,
        usersScheduledForDeletion,
        usersReadyForPermanentDeletion
      ] = await Promise.all([
        User.countDocuments({ isDeleted: true }),
        User.countDocuments({ 
          isDeleted: true, 
          scheduledForPermanentDeletion: { $ne: null } 
        }),
        User.countDocuments({ 
          isDeleted: true, 
          deletedAt: { $lte: ninetyDaysAgo } 
        })
      ]);

      res.json({
        totalDeletedUsers,
        usersScheduledForDeletion,
        usersReadyForPermanentDeletion,
        nextScheduledCleanup: 'Daily at 2 AM'
      });
    } catch (error) {
      console.error('Error fetching cleanup stats:', error);
      res.status(500).json({ 
        message: 'Failed to fetch cleanup stats: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * GET /users/scheduled-for-deletion
 * Get users scheduled for permanent deletion
 * Permissions: users:view
 */
router.get(
  '/users/scheduled-for-deletion',
  requirePermission('users', 'view'),
  async (req, res) => {
    try {
      const users = await User.find({
        isDeleted: true,
        scheduledForPermanentDeletion: { $ne: null }
      }).select('firstName lastName email deletedAt scheduledForPermanentDeletion');

      const usersWithDays = users.map(user => {
        const userObj = user.toObject();
        const now = new Date();
        const deletionDate = new Date(user.scheduledForPermanentDeletion);
        const timeDiff = deletionDate.getTime() - now.getTime();
        const daysUntilDeletion = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
          ...userObj,
          daysUntilPermanentDeletion: daysUntilDeletion
        };
      });

      res.json(usersWithDays);
    } catch (error) {
      console.error('Error fetching scheduled users:', error);
      res.status(500).json({ 
        message: 'Failed to fetch scheduled users: ' + (error.message || 'Internal server error')
      });
    }
  }
);

// ... (Keep the existing activity-logs routes from your previous code)
/**
 * GET /activity-logs
 * Requires activity_logs:view permission (super admin automatically has this)
 */
router.get(
  '/activity-logs',
  requirePermission('activity_logs', 'view'),
  async (req, res) => {
    try {
      // Parse pagination params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200); // cap limit for safety
      const skip = (page - 1) * limit;

      // Search & filter params (device filters included)
      const {
        action = '',
        resourceType = '',
        adminId = '',
        dateFrom = '',
        dateTo = '',
        search = '',
        deviceType = '',
        os = '',
        browser = ''
      } = req.query;

      // Build Mongo query
      const query = {};

      if (action) query.action = action;
      if (resourceType) query.resourceType = resourceType;
      if (adminId) query.adminId = adminId;

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (!Number.isNaN(from.getTime())) query.createdAt.$gte = from;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          if (!Number.isNaN(to.getTime())) query.createdAt.$lte = to;
        }
      }

      // Text search on description
      if (search) {
        query.description = { $regex: search, $options: 'i' };
      }

      // Device type filter (exact match)
      if (deviceType) {
        query['deviceInfo.device.type'] = deviceType;
      }

      // OS filter (partial, case-insensitive)
      if (os) {
        query['deviceInfo.os.name'] = { $regex: os, $options: 'i' };
      }

      // Browser filter (partial, case-insensitive)
      if (browser) {
        query['deviceInfo.browser.name'] = { $regex: browser, $options: 'i' };
      }

      // Query DB
      const [logs, total] = await Promise.all([
        ActivityLog.find(query)
          .populate('adminId', 'name email role')
          .populate('resourceId')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip),
        ActivityLog.countDocuments(query)
      ]);

      // Build filter options (distinct values)
      const [
        actions,
        resourceTypes,
        adminIds,
        deviceTypes,
        osList,
        browserList
      ] = await Promise.all([
        ActivityLog.distinct('action'),
        ActivityLog.distinct('resourceType'),
        ActivityLog.distinct('adminId'),
        ActivityLog.distinct('deviceInfo.device.type'),
        ActivityLog.distinct('deviceInfo.os.name'),
        ActivityLog.distinct('deviceInfo.browser.name')
      ]);

      // Resolve admin details for the admin filter (filter out nulls)
      const admins = (await Promise.all(
        (adminIds || [])
          .filter(Boolean)
          .map(async (aId) => {
            try {
              return await Admin.findById(aId).select('name email role');
            } catch {
              return null;
            }
          })
      )).filter(Boolean);

      res.json({
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        filters: {
          actions,
          resourceTypes,
          deviceTypes: deviceTypes.filter(Boolean),
          os: osList.filter(Boolean),
          browsers: browserList.filter(Boolean),
          admins
        }
      });
    } catch (error) {
      console.error('GET /activity-logs error:', error);
      res.status(500).json({ 
        message: error.message || 'Internal Server Error' 
      });
    }
  }
);

/**
 * GET /activity-logs/:id
 * Requires activity_logs:view permission
 */
router.get(
  '/activity-logs/:id',
  requirePermission('activity_logs', 'view'),
  async (req, res) => {
    try {
      const log = await ActivityLog.findById(req.params.id)
        .populate('adminId', 'name email role')
        .populate('resourceId');

      if (!log) {
        return res.status(404).json({ message: 'Activity log not found' });
      }

      res.json(log);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      res.status(500).json({ 
        message: 'Failed to fetch activity log: ' + (error.message || 'Internal server error')
      });
    }
  }
);

/**
 * GET /activity-logs/export
 * Export activity logs (json | csv). Requires activity_logs:export permission
 */
router.get(
  '/activity-logs/export',
  requirePermission('activity_logs', 'export'),
  logActivity('EXPORT_DATA'),
  async (req, res) => {
    try {
      const format = (req.query.format || 'json').toLowerCase();

      const logs = await ActivityLog.find()
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .limit(1000); // hard limit for export

      if (format === 'csv') {
        const csvData = convertToCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
        return res.send(csvData);
      }

      res.json(logs);
    } catch (error) {
      console.error('Error exporting activity logs:', error);
      res.status(500).json({ 
        message: 'Failed to export activity logs: ' + (error.message || 'Internal server error')
      });
    }
  }
);

// Helper: convert activity logs to CSV
const convertToCSV = (logs) => {
  const headers = ['Timestamp', 'Admin', 'Action', 'Resource', 'Description', 'IP Address', 'Status'];
  const csvRows = [headers.join(',')];

  logs.forEach((log) => {
    const row = [
      log.createdAt ? log.createdAt.toISOString() : '',
      `"${log.adminId?.name || 'Unknown'}"`,
      log.action || '',
      log.resourceType || 'N/A',
      `"${(log.description || '').replace(/"/g, '""')}"`,
      log.ipAddress || '',
      log.status || ''
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

export default router;