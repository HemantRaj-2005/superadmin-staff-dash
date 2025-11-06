import express from 'express';
import Institute from '../models/Institute.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import { requirePermission } from '../middleware/permissions.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper to fetch institute doc for logging
const getInstituteForLogging = async (instituteId) => {
  return await Institute.findById(instituteId);
};

/* -------------------------
   Helpers: deep diff + sanitize
   ------------------------- */
const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'otpVerificationId'];

const sanitizeBody = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(i => sanitizeBody(i));
  const copy = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sensitiveFields.includes(k)) copy[k] = '***HIDDEN***';
    else if (v && typeof v === 'object') copy[k] = sanitizeBody(v);
    else copy[k] = v;
  }
  return copy;
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

const isEqual = (a, b) => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false;
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!bk.includes(k)) return false;
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return a === b;
};

const diffObjects = (oldObj = {}, newObj = {}) => {
  const oldValues = {};
  const newValues = {};

  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  keys.forEach((key) => {
    const a = oldObj ? oldObj[key] : undefined;
    const b = newObj ? newObj[key] : undefined;

    if (isObject(a) && isObject(b)) {
      const nested = diffObjects(a, b);
      if (Object.keys(nested.oldValues).length > 0) {
        oldValues[key] = nested.oldValues;
        newValues[key] = nested.newValues;
      }
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (!isEqual(a, b)) {
        oldValues[key] = a;
        newValues[key] = b;
      }
    } else {
      if (!isEqual(a, b)) {
        if (typeof a !== 'undefined') oldValues[key] = a;
        if (typeof b !== 'undefined') newValues[key] = b;
      }
    }
  });

  return { oldValues, newValues };
};

// Get all institutes with advanced filtering
// Get all institutes with advanced filtering
router.get(
  '/',
  requirePermission('institutes', 'view'),
  logActivity('VIEW_INSTITUTES', { resourceType: 'Institute' }),
  async (req, res) => {
    try {
      // parse ints (safe)
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
      const {
        search = '',
        city = '',
        state = '',
        type = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build query without accidentally overwriting $or
      const query = {};
      const orConditions = [];

      // Search across multiple fields
      if (search && String(search).trim()) {
        const s = String(search).trim();
        orConditions.push(
          { name: { $regex: s, $options: 'i' } },
          { Hospitals: { $regex: s, $options: 'i' } },
          { city: { $regex: s, $options: 'i' } },
          { City: { $regex: s, $options: 'i' } },
          { state: { $regex: s, $options: 'i' } },
          { State: { $regex: s, $options: 'i' } }
        );
      }

      // Filter by city (check both city and City fields)
      if (city && String(city).trim()) {
        const c = String(city).trim();
        orConditions.push(
          { city: { $regex: c, $options: 'i' } },
          { City: { $regex: c, $options: 'i' } }
        );
      }

      // Filter by state (check both state and State fields)
      if (state && String(state).trim()) {
        const s = String(state).trim();
        orConditions.push(
          { state: { $regex: s, $options: 'i' } },
          { State: { $regex: s, $options: 'i' } }
        );
      }

      if (orConditions.length) {
        query.$or = orConditions;
      }

      // Filter by hospital type (non-$or)
      if (type && String(type).trim()) {
        query.Hospitals = { $regex: String(type).trim(), $options: 'i' };
      }

      // Sort configuration - allow fallback to name if invalid sortBy
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Fetch documents (pagination)
      const institutes = await Institute.find(query)
        .sort(sortConfig)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      // Get totals
      const total = await Institute.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      // Get unique values for filters (robust)
      const citiesAgg = await Institute.aggregate([
        { $match: query },
        { $project: { city: { $ifNull: ['$City', '$city'] } } },
        { $group: { _id: '$city' } },
        { $match: { _id: { $ne: null } } },
        { $sort: { _id: 1 } }
      ]);

      const statesAgg = await Institute.aggregate([
        { $match: query },
        { $project: { state: { $ifNull: ['$State', '$state'] } } },
        { $group: { _id: '$state' } },
        { $match: { _id: { $ne: null } } },
        { $sort: { _id: 1 } }
      ]);

      const hospitalTypes = await Institute.distinct('Hospitals', query);

      res.json({
        institutes,
        totalPages,
        currentPage: page,
        total: Number(total),
        filters: {
          cities: (citiesAgg || []).map(c => c._id).filter(Boolean),
          states: (statesAgg || []).map(s => s._id).filter(Boolean),
          hospitalTypes: (hospitalTypes || []).filter(Boolean).sort()
        }
      });
    } catch (error) {
      console.error('Error fetching institutes:', error);
      res.status(500).json({ message: error.message });
    }
  }
);


// Get institute statistics
router.get(
  '/stats/overview',
  requirePermission('institutes', 'view'),
  async (req, res) => {
    try {
      const totalInstitutes = await Institute.countDocuments();
      
      // Count by hospital type
      const hospitalTypeStats = await Institute.aggregate([
        { $group: { _id: '$Hospitals', count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } }
      ]);

      // Count by state
      const stateStats = await Institute.aggregate([
        { 
          $project: { 
            state: { $ifNull: ['$State', '$state'] } 
          } 
        },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } }
      ]);

      // Count by city
      const cityStats = await Institute.aggregate([
        { 
          $project: { 
            city: { $ifNull: ['$City', '$city'] } 
          } 
        },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } }
      ]);

      res.json({
        totalInstitutes,
        hospitalTypeStats,
        stateStats: stateStats.sort((a, b) => b.count - a.count).slice(0, 10),
        cityStats: cityStats.sort((a, b) => b.count - a.count).slice(0, 10),
        totalStates: stateStats.length,
        totalCities: cityStats.length
      });
    } catch (error) {
      console.error('Error fetching institute stats:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single institute
router.get('/:id', authenticate, async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    res.json(institute);
  } catch (error) {
    console.error('Error fetching institute:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new institute
router.post(
  '/',
  authenticate,
  logActivity('CREATE_INSTITUTE', { resourceType: 'Institute' }),
  async (req, res) => {
    try {
      const { name, Hospitals, city, City, state, State } = req.body;

      // Check if institute already exists
      const existingInstitute = await Institute.findOne({
        name: name.trim(),
        $or: [
          { city: city?.trim() },
          { City: City?.trim() }
        ]
      });

      if (existingInstitute) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `CREATE_INSTITUTE failed: institute already exists` 
            }
          }).catch(console.error);
        }
        return res.status(400).json({ message: 'Institute already exists' });
      }

      const institute = new Institute({
        name: name.trim(),
        Hospitals: Hospitals?.trim(),
        city: city?.trim(),
        City: City?.trim(),
        state: state?.trim(),
        State: State?.trim()
      });

      const savedInstitute = await institute.save();

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: null, newValues: sanitizeBody(savedInstitute.toObject()) },
            status: 'SUCCESS',
            description: `CREATE_INSTITUTE by ${req.admin?.name || 'Unknown Admin'}`
          }
        }).catch(console.error);
      }

      res.status(201).json(savedInstitute);
    } catch (error) {
      console.error('Error creating institute:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Update institute
router.put(
  '/:id',
  authenticate,
  logUpdateWithOldValues('Institute', getInstituteForLogging),
  logActivity('UPDATE_INSTITUTE', { resourceType: 'Institute' }),
  async (req, res) => {
    try {
      const oldInstitute = req.oldData || {};
      const updateData = req.body;

      // Trim string fields
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'string') {
          updateData[key] = updateData[key].trim();
        }
      });

      const institute = await Institute.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!institute) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_INSTITUTE failed: institute ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Institute not found' });
      }

      // Compute diffs
      const newInstituteObj = institute.toObject();
      const { oldValues, newValues } = diffObjects(oldInstitute, newInstituteObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(
          req.activityLogId,
          {
            $set: {
              changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
              status: 'SUCCESS',
              description: `UPDATE_INSTITUTE by ${req.admin?.name || 'Unknown Admin'} on institute ${req.params.id}`
            }
          },
          { new: true }
        ).catch((e) => console.error('Failed to update ActivityLog with changes:', e));
      } else if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_INSTITUTE completed — no changes detected for institute ${req.params.id}` }
        }).catch(console.error);
      }

      res.json(institute);
    } catch (error) {
      console.error('Error updating institute:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete institute
router.delete('/:id', authenticate, logActivity('DELETE_INSTITUTE', { resourceType: 'Institute' }), async (req, res) => {
  try {
    const institute = await Institute.findByIdAndDelete(req.params.id);

    if (!institute) {
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
          $set: { status: 'FAILED', description: 'DELETE_INSTITUTE failed: not found' } 
        }).catch(console.error);
      }
      return res.status(404).json({ message: 'Institute not found' });
    }

    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: {
          changes: { oldValues: sanitizeBody(institute.toObject()), newValues: null },
          status: 'SUCCESS',
          description: `DELETE_INSTITUTE by ${req.admin?.name || 'Unknown Admin'} on institute ${req.params.id}`
        }
      }).catch(console.error);
    }

    res.json({ message: 'Institute deleted successfully' });
  } catch (error) {
    console.error('Error deleting institute:', error);
    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: { status: 'FAILED', description: error.message }
      }).catch(console.error);
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;