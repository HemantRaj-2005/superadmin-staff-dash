// // routes/admin.js
// import express from 'express';
// import { authenticate, authorize } from '../middleware/auth.js';
// import { logActivity } from '../middleware/ActivityLogger.js';
// import User from '../models/User.js';
// import ActivityLog from '../models/ActivityLog.js';

// const router = express.Router();

// // Get all users with pagination and search
// router.get('/users', authenticate, async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = '' } = req.query;
    
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
//       .limit(limit * 1)
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

// // Get single user details
// router.get('/users/:id', authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update user
// router.put('/users/:id', authenticate, logActivity('UPDATE_USER'), async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     res.json(user);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Delete user
// // router.delete('/users/:id', authenticate, logActivity('DELETE_USER'), async (req, res) => {
// //   try {
// //     const user = await User.findByIdAndDelete(req.params.id);
// //     if (!user) {
// //       return res.status(404).json({ message: 'User not found' });
// //     }
// //     res.json({ message: 'User deleted successfully' });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // });

// // Get activity logs (super admin only)
// router.get('/activity-logs', authenticate, authorize(['super_admin']), async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;
    
//     const logs = await ActivityLog.find()
//       .populate('adminId', 'name email')
//       .populate('targetUser', 'firstName lastName email')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await ActivityLog.countDocuments();

//     res.json({
//       logs,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;


// routes/admin.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/ActivityLogger.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper: Get user for logging (without sensitive fields)
const getUserForLogging = async (userId) => {
  return await User.findById(userId).select('-password -refreshTokens');
};

/**
 * GET /users
 * List users with pagination & search
 */
router.get('/users', authenticate, logActivity('VIEW_USERS', { resourceType: 'User' }), async (req, res) => {
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
});

/**
 * GET /users/:id
 * Get single user details
 */
router.get('/users/:id', authenticate, logActivity('VIEW_USER', { resourceType: 'User' }), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /users/:id
 * Update user with old-values logging and activity entry
 */
router.put(
  '/users/:id',
  authenticate,
  // middleware that fetches and attaches old data to req.oldData
  logUpdateWithOldValues('User', getUserForLogging),
  logActivity('UPDATE_USER', { resourceType: 'User' }),
  async (req, res) => {
    try {
      const oldUser = req.oldData; // populated by logUpdateWithOldValues middleware
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find the corresponding (most recent) activity log entry for this action & admin
      try {
        const activityLog = await ActivityLog.findOne({
          adminId: req.admin?._id,
          resourceId: req.params.id,
          action: 'UPDATE_USER'
        }).sort({ createdAt: -1 });

        if (activityLog && oldUser) {
          activityLog.changes = {
            oldValues: oldUser.toObject ? oldUser.toObject() : oldUser,
            newValues: user.toObject()
          };
          await activityLog.save();
        }
      } catch (innerErr) {
        // If logging update fails, don't block response — still return updated user
        console.error('Failed to append changes to activity log:', innerErr);
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * DELETE /users/:id
 * Delete user (kept enabled). Logs activity.
 */
router.delete('/users/:id', authenticate, logActivity('DELETE_USER', { resourceType: 'User' }), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /activity-logs
 * Super admin only. Filterable activity logs with available filter lists.
 */
router.get('/activity-logs', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const {
      action = '',
      resourceType = '',
      adminId = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (adminId) query.adminId = adminId;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name email role')
      .populate('resourceId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    // Get available filters
    const actions = await ActivityLog.distinct('action');
    const resourceTypes = await ActivityLog.distinct('resourceType');
    const adminIds = await ActivityLog.distinct('adminId');

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      filters: {
        actions,
        resourceTypes,
        admins: await Promise.all(
          adminIds.map(async (aId) => {
            try {
              return await Admin.findById(aId).select('name email role');
            } catch {
              return null;
            }
          })
        ).then(list => list.filter(Boolean))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /activity-logs/:id
 * Super admin only. Get single activity log with full details.
 */
router.get('/activity-logs/:id', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('adminId', 'name email role')
      .populate('resourceId');

    if (!log) return res.status(404).json({ message: 'Activity log not found' });

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /activity-logs/export
 * Export activity logs (json | csv). Super admin only.
 */
router.get('/activity-logs/export', authenticate, authorize(['super_admin']), logActivity('EXPORT_DATA'), async (req, res) => {
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
});

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
