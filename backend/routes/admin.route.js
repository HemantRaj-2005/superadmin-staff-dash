

// // routes/admin.js
// import express from 'express';
// import { authenticate, authorize } from '../middleware/auth.js';
// import { logActivity, logUpdateWithOldValues } from '../middleware/ActivityLogger.js';
// import User from '../models/User.js';
// import Admin from '../models/Admin.js';
// import ActivityLog from '../models/ActivityLog.js';

// const router = express.Router();

// // Helper: Get user for logging (without sensitive fields)
// const getUserForLogging = async (userId) => {
//   return await User.findById(userId).select('-password -refreshTokens');
// };

// /**
//  * GET /users
//  * List users with pagination & search
//  */
// router.get('/users', authenticate, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || '';

//     const query = {};
//     if (search) {
//       query.$or = [
//         { firstName: { $regex: search, $options: 'i' } },
//         { lastName: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const users = await User.find(query)
//       .select('firstName lastName email profileImage role createdAt')
//       .limit(limit)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await User.countDocuments(query);

//     res.json({
//       users,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * GET /users/:id
//  * Get single user details
//  */
// router.get('/users/:id', authenticate, logActivity('VIEW_USER', { resourceType: 'User' }), async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password -refreshTokens');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * PUT /users/:id
//  * Update user with old-values logging and activity entry
//  */router.put(
//   '/users/:id',
//   authenticate,
//   logUpdateWithOldValues('User', getUserForLogging), // sets req.oldData (plain object)
//   logActivity('UPDATE_USER', { resourceType: 'User' }), // creates pending log and sets req.activityLogId
//   async (req, res) => {
//     try {
//       const oldUser = req.oldData; 

//       // Perform the update
//       let user = await User.findByIdAndUpdate(
//         req.params.id,
//         { $set: req.body },
//         { new: true, runValidators: true }
//       ).select('-password -refreshTokens');

// user=await User.findById(req.params.id)

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
//  * Delete user (kept enabled). Logs activity.
//  */
// router.delete('/users/:id', authenticate, logActivity('DELETE_USER', { resourceType: 'User' }), async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * GET /activity-logs
//  * Super admin only. Filterable activity logs with available filter lists.
//  */
// router.get('/activity-logs', authenticate, authorize(['super_admin']), async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 20;

//     const {
//       action = '',
//       resourceType = '',
//       adminId = '',
//       dateFrom = '',
//       dateTo = '',
//       search = ''
//     } = req.query;

//     const query = {};

//     if (action) query.action = action;
//     if (resourceType) query.resourceType = resourceType;
//     if (adminId) query.adminId = adminId;

//     if (dateFrom || dateTo) {
//       query.createdAt = {};
//       if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
//       if (dateTo) query.createdAt.$lte = new Date(dateTo);
//     }

//     if (search) {
//       query.description = { $regex: search, $options: 'i' };
//     }

//     const logs = await ActivityLog.find(query)
//       .populate('adminId', 'name email role')
//       .populate('resourceId')
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip((page - 1) * limit);

//     const total = await ActivityLog.countDocuments(query);

//     // Get available filters
//     const actions = await ActivityLog.distinct('action');
//     const resourceTypes = await ActivityLog.distinct('resourceType');
//     const adminIds = await ActivityLog.distinct('adminId');

//     res.json({
//       logs,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total,
//       filters: {
//         actions,
//         resourceTypes,
//         admins: await Promise.all(
//           adminIds.map(async (aId) => {
//             try {
//               return await Admin.findById(aId).select('name email role');
//             } catch {
//               return null;
//             }
//           })
//         ).then(list => list.filter(Boolean))
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * GET /activity-logs/:id
//  * Super admin only. Get single activity log with full details.
//  */
// router.get('/activity-logs/:id', authenticate, authorize(['super_admin']), async (req, res) => {
//   try {
//     const log = await ActivityLog.findById(req.params.id)
//       .populate('adminId', 'name email role')
//       .populate('resourceId');

//     if (!log) return res.status(404).json({ message: 'Activity log not found' });

//     res.json(log);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * GET /activity-logs/export
//  * Export activity logs (json | csv). Super admin only.
//  */
// router.get('/activity-logs/export', authenticate, authorize(['super_admin']), logActivity('EXPORT_DATA'), async (req, res) => {
//   try {
//     const format = (req.query.format || 'json').toLowerCase();

//     const logs = await ActivityLog.find()
//       .populate('adminId', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(1000); // hard limit for export

//     if (format === 'csv') {
//       const csvData = convertToCSV(logs);
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
//       return res.send(csvData);
//     }

//     res.json(logs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

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

// routes/admin.js 
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper: Get user for logging (without sensitive fields)
const getUserForLogging = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens');
};

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

/**
 * GET /users
 * List users with pagination & search
 * Permissions: users:view
 */
router.get(
  '/users',
  authenticate,
    requirePermission('users', 'view'),


  
  
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
        .select('firstName lastName email profileImage role createdAt')
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
 * GET /users/:id
 * Get single user details
 * Permissions: users:view
 */
router.get(
  '/users/:id',
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

      // Perform the update
      let user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      // re-fetch to ensure latest populated fields (if any)
      user = await User.findById(req.params.id).select('-password -refreshTokens');

      if (!user) {
        // mark the activity as failed if we created one
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
 * Delete user. Permissions: users:delete
 */
router.delete(
  '/users/:id',
  requirePermission('users', 'delete'),
  logActivity('DELETE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * GET /activity-logs
 * Requires activity_logs:view permission (super admin automatically has this)
//  */
// router.get(
//   '/activity-logs',
//   requirePermission('activity_logs', 'view'),
//   async (req, res) => {
//     try {
//       const page = parseInt(req.query.page, 10) || 1;
//       const limit = parseInt(req.query.limit, 10) || 20;

//       const {
//         action = '',
//         resourceType = '',
//         adminId = '',
//         dateFrom = '',
//         dateTo = '',
//         search = ''
//       } = req.query;

//       const query = {};

//       if (action) query.action = action;
//       if (resourceType) query.resourceType = resourceType;
//       if (adminId) query.adminId = adminId;

//       if (dateFrom || dateTo) {
//         query.createdAt = {};
//         if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
//         if (dateTo) query.createdAt.$lte = new Date(dateTo);
//       }

//       if (search) {
//         query.description = { $regex: search, $options: 'i' };
//       }

//       const logs = await ActivityLog.find(query)
//         .populate('adminId', 'name email role')
//         .populate('resourceId')
//         .sort({ createdAt: -1 })
//         .limit(limit)
//         .skip((page - 1) * limit);

//       const total = await ActivityLog.countDocuments(query);

//       // Get available filters
//       const actions = await ActivityLog.distinct('action');
//       const resourceTypes = await ActivityLog.distinct('resourceType');
//       const adminIds = await ActivityLog.distinct('adminId');

//       res.json({
//         logs,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         total,
//         filters: {
//           actions,
//           resourceTypes,
//           admins: await Promise.all(
//             adminIds.map(async (aId) => {
//               try {
//                 return await Admin.findById(aId).select('name email role');
//               } catch {
//                 return null;
//               }
//             })
//           ).then(list => list.filter(Boolean))
//         }
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// routes/admin.js (merged activity-logs route)
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
      res.status(500).json({ message: error.message || 'Internal Server Error' });
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

      if (!log) return res.status(404).json({ message: 'Activity log not found' });

      res.json(log);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
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