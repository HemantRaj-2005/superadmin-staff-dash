import express from 'express';
import WorldCity from '../models/WorldCity.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import { requirePermission } from '../middleware/permissions.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper to fetch city doc for logging
const getCityForLogging = async (cityId) => {
  return await WorldCity.findById(cityId);
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

// Get all cities with advanced filtering
router.get(
  '/',
  requirePermission('cities', 'view'),
  logActivity('VIEW_CITIES', { resourceType: 'City' }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        country = '',
        state = '',
        sortBy = 'CITY_NAME',
        sortOrder = 'asc'
      } = req.query;

      const query = {};

      // Search across multiple fields
      if (search) {
        query.$or = [
          { CITY_NAME: { $regex: search, $options: 'i' } },
          { STATE: { $regex: search, $options: 'i' } },
          { COUNTRY_NAME_CODE: { $regex: search, $options: 'i' } },
          { COUNTRY_ISO_2: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by country
      if (country) {
        query.COUNTRY_NAME_CODE = { $regex: country, $options: 'i' };
      }

      // Filter by state
      if (state) {
        query.STATE = { $regex: state, $options: 'i' };
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const cities = await WorldCity.find(query)
        .sort(sortConfig)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await WorldCity.countDocuments(query);

      // Get unique countries and states for filters
      const countries = await WorldCity.distinct('COUNTRY_NAME_CODE', query);
      const states = await WorldCity.distinct('STATE', query);

      res.json({
        cities,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        filters: {
          countries: countries.sort(),
          states: states.sort()
        }
      });

    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get city statistics
router.get(
  '/stats/overview',
  requirePermission('cities', 'view'),
  async (req, res) => {
    try {
      const totalCities = await WorldCity.countDocuments();
      const totalCountries = await WorldCity.distinct('COUNTRY_NAME_CODE').then(arr => arr.length);
      const totalStates = await WorldCity.distinct('STATE').then(arr => arr.length);

      // Get cities with coordinates (for map display)
      const citiesWithCoords = await WorldCity.countDocuments({
        CITY_latitude: { $exists: true, $ne: null },
        CITY_longitude: { $exists: true, $ne: null }
      });

      res.json({
        totalCities,
        totalCountries,
        totalStates,
        citiesWithCoords,
        coverage: ((citiesWithCoords / totalCities) * 100).toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching city stats:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single city
router.get('/:id', authenticate, async (req, res) => {
  try {
    const city = await WorldCity.findById(req.params.id);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new city
router.post(
  '/',
  authenticate,
  logActivity('CREATE_CITY', { resourceType: 'City' }),
  async (req, res) => {
    try {
      const {
        city_id, CITY_latitude, CITY_longitude, CITY_NAME,
        country_code, country_id, COUNTRY_ISO_2, COUNTRY_ISO_3,
        COUNTRY_NAME_CODE, COUNTRY_REGION2, COUNTRY_SUBREGION,
        STATE, state_code, state_id
      } = req.body;

      // Check if city already exists
      const existingCity = await WorldCity.findOne({
        $or: [
          { city_id },
          { 
            CITY_NAME: CITY_NAME.trim(),
            STATE: STATE.trim(),
            COUNTRY_NAME_CODE: COUNTRY_NAME_CODE.trim()
          }
        ]
      });

      if (existingCity) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `CREATE_CITY failed: city already exists` 
            }
          }).catch(console.error);
        }
        return res.status(400).json({ message: 'City already exists' });
      }

      const city = new WorldCity({
        city_id,
        CITY_latitude,
        CITY_longitude,
        CITY_NAME: CITY_NAME.trim(),
        country_code: country_code.trim(),
        country_id,
        COUNTRY_ISO_2: COUNTRY_ISO_2.trim(),
        COUNTRY_ISO_3: COUNTRY_ISO_3.trim(),
        COUNTRY_NAME_CODE: COUNTRY_NAME_CODE.trim(),
        COUNTRY_REGION2: COUNTRY_REGION2.trim(),
        COUNTRY_SUBREGION: COUNTRY_SUBREGION.trim(),
        STATE: STATE.trim(),
        state_code: state_code.toString().trim(),
        state_id
      });

      const savedCity = await city.save();

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: null, newValues: sanitizeBody(savedCity.toObject()) },
            status: 'SUCCESS',
            description: `CREATE_CITY by ${req.admin?.name || 'Unknown Admin'}`
          }
        }).catch(console.error);
      }

      res.status(201).json(savedCity);
    } catch (error) {
      console.error('Error creating city:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Update city
router.put(
  '/:id',
  authenticate,
  logUpdateWithOldValues('City', getCityForLogging),
  logActivity('UPDATE_CITY', { resourceType: 'City' }),
  async (req, res) => {
    try {
      const oldCity = req.oldData || {};
      const updateData = req.body;

      // Convert state_code to string if provided
      if (updateData.state_code !== undefined) {
        updateData.state_code = updateData.state_code.toString();
      }

      const city = await WorldCity.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!city) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_CITY failed: city ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'City not found' });
      }

      // Compute diffs
      const newCityObj = city.toObject();
      const { oldValues, newValues } = diffObjects(oldCity, newCityObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(
          req.activityLogId,
          {
            $set: {
              changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
              status: 'SUCCESS',
              description: `UPDATE_CITY by ${req.admin?.name || 'Unknown Admin'} on city ${req.params.id}`
            }
          },
          { new: true }
        ).catch((e) => console.error('Failed to update ActivityLog with changes:', e));
      } else if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_CITY completed — no changes detected for city ${req.params.id}` }
        }).catch(console.error);
      }

      res.json(city);
    } catch (error) {
      console.error('Error updating city:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete city
router.delete('/:id', authenticate, logActivity('DELETE_CITY', { resourceType: 'City' }), async (req, res) => {
  try {
    const city = await WorldCity.findByIdAndDelete(req.params.id);

    if (!city) {
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
          $set: { status: 'FAILED', description: 'DELETE_CITY failed: not found' } 
        }).catch(console.error);
      }
      return res.status(404).json({ message: 'City not found' });
    }

    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: {
          changes: { oldValues: sanitizeBody(city.toObject()), newValues: null },
          status: 'SUCCESS',
          description: `DELETE_CITY by ${req.admin?.name || 'Unknown Admin'} on city ${req.params.id}`
        }
      }).catch(console.error);
    }

    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: { status: 'FAILED', description: error.message }
      }).catch(console.error);
    }
    res.status(500).json({ message: error.message });
  }
});

// Get cities by country
router.get('/country/:country', authenticate, async (req, res) => {
  try {
    const { country } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const cities = await WorldCity.find({ 
      COUNTRY_NAME_CODE: { $regex: country, $options: 'i' }
    })
    .sort({ CITY_NAME: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await WorldCity.countDocuments({ 
      COUNTRY_NAME_CODE: { $regex: country, $options: 'i' }
    });

    res.json({
      cities,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;