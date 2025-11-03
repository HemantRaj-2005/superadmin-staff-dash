import express from 'express';
import Organisation from '../models/Organisation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import { requirePermission } from '../middleware/permissions.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper to fetch organisation doc for logging
const getOrganisationForLogging = async (organisationId) => {
  return await Organisation.findById(organisationId);
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

// Get all organisations with advanced filtering
router.get(
  '/',
  requirePermission('organisations', 'view'),
  logActivity('VIEW_ORGANISATIONS', { resourceType: 'Organization' }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        industry = '',
        type = '',
        country = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const query = {};

      // Search across multiple fields
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
          { 'location.country': { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by industry
      if (industry && industry !== 'all') {
        query.industry = { $regex: industry, $options: 'i' };
      }

      // Filter by type
      if (type && type !== 'all') {
        query.type = { $regex: type, $options: 'i' };
      }

      // Filter by country
      if (country && country !== 'all') {
        query['location.country'] = { $regex: country, $options: 'i' };
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const organisations = await Organisation.find(query)
        .sort(sortConfig)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Organisation.countDocuments(query);

      // Get unique values for filters
      const industries = await Organisation.distinct('industry', query);
      const types = await Organisation.distinct('type', query);
      const countries = await Organisation.distinct('location.country', query);

      // Calculate statistics
      const totalOrganisations = await Organisation.countDocuments();
      const organisationsByIndustry = await Organisation.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      const organisationsByCountry = await Organisation.aggregate([
        { $group: { _id: '$location.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        organisations,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        filters: {
          industries: industries.filter(i => i).sort(),
          types: types.filter(t => t).sort(),
          countries: countries.filter(c => c).sort()
        },
        statistics: {
          totalOrganisations,
          organisationsByIndustry: organisationsByIndustry.slice(0, 5),
          organisationsByCountry: organisationsByCountry.slice(0, 5)
        }
      });

    } catch (error) {
      console.error('Error fetching organisations:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get organisation statistics
router.get(
  '/stats/overview',
  requirePermission('organisations', 'view'),
  async (req, res) => {
    try {
      const totalOrganisations = await Organisation.countDocuments();
      
      const industriesCount = await Organisation.distinct('industry').then(arr => arr.length);
      const countriesCount = await Organisation.distinct('location.country').then(arr => arr.length);
      const typesCount = await Organisation.distinct('type').then(arr => arr.length);

      // Recent organisations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentOrganisations = await Organisation.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      res.json({
        totalOrganisations,
        industriesCount,
        countriesCount,
        typesCount,
        recentOrganisations,
        growthRate: ((recentOrganisations / totalOrganisations) * 100).toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching organisation stats:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single organisation
router.get('/:id', authenticate, async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);

    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    res.json(organisation);
  } catch (error) {
    console.error('Error fetching organisation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new organisation
router.post(
  '/',
  authenticate,
  logActivity('CREATE_ORGANISATION', { resourceType: 'Organization' }),
  async (req, res) => {
    try {
      const { establishmentYear, industry, location, name, type } = req.body;

      // Check if organisation already exists
      const existingOrganisation = await Organisation.findOne({
        name: name.trim(),
        'location.country': location.country.trim()
      });

      if (existingOrganisation) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `CREATE_ORGANISATION failed: organisation already exists` 
            }
          }).catch(console.error);
        }
        return res.status(400).json({ message: 'Organisation already exists in this country' });
      }

      const organisation = new Organisation({
        establishmentYear: establishmentYear || undefined,
        industry: industry.trim(),
        location: {
          country: location.country.trim()
        },
        name: name.trim(),
        type: type.trim()
      });

      const savedOrganisation = await organisation.save();

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: null, newValues: sanitizeBody(savedOrganisation.toObject()) },
            status: 'SUCCESS',
            description: `CREATE_ORGANISATION by ${req.admin?.name || 'Unknown Admin'}`
          }
        }).catch(console.error);
      }

      res.status(201).json(savedOrganisation);
    } catch (error) {
      console.error('Error creating organisation:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Update organisation
router.put(
  '/:id',
  authenticate,
  logUpdateWithOldValues('Organisation', getOrganisationForLogging),
  logActivity('UPDATE_ORGANISATION', { resourceType: 'Organization' }),
  async (req, res) => {
    try {
      const oldOrganisation = req.oldData || {};
      const { establishmentYear, industry, location, name, type } = req.body;

      const updateData = {};
      if (establishmentYear !== undefined) updateData.establishmentYear = establishmentYear;
      if (industry !== undefined) updateData.industry = industry.trim();
      if (location !== undefined) updateData.location = { country: location.country.trim() };
      if (name !== undefined) updateData.name = name.trim();
      if (type !== undefined) updateData.type = type.trim();

      const organisation = await Organisation.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!organisation) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_ORGANISATION failed: organisation ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Organisation not found' });
      }

      // Compute diffs
      const newOrganisationObj = organisation.toObject();
      const { oldValues, newValues } = diffObjects(oldOrganisation, newOrganisationObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(
          req.activityLogId,
          {
            $set: {
              changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
              status: 'SUCCESS',
              description: `UPDATE_ORGANISATION by ${req.admin?.name || 'Unknown Admin'} on organisation ${req.params.id}`
            }
          },
          { new: true }
        ).catch((e) => console.error('Failed to update ActivityLog with changes:', e));
      } else if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_ORGANISATION completed — no changes detected for organisation ${req.params.id}` }
        }).catch(console.error);
      }

      res.json(organisation);
    } catch (error) {
      console.error('Error updating organisation:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete organisation
router.delete('/:id', authenticate, logActivity('DELETE_ORGANISATION', { resourceType: 'Organization' }), async (req, res) => {
  try {
    const organisation = await Organisation.findByIdAndDelete(req.params.id);

    if (!organisation) {
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
          $set: { status: 'FAILED', description: 'DELETE_ORGANISATION failed: not found' } 
        }).catch(console.error);
      }
      return res.status(404).json({ message: 'Organisation not found' });
    }

    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: {
          changes: { oldValues: sanitizeBody(organisation.toObject()), newValues: null },
          status: 'SUCCESS',
          description: `DELETE_ORGANISATION by ${req.admin?.name || 'Unknown Admin'} on organisation ${req.params.id}`
        }
      }).catch(console.error);
    }

    res.json({ message: 'Organisation deleted successfully' });
  } catch (error) {
    console.error('Error deleting organisation:', error);
    if (req.activityLogId) {
      await ActivityLog.findByIdAndUpdate(req.activityLogId, {
        $set: { status: 'FAILED', description: error.message }
      }).catch(console.error);
    }
    res.status(500).json({ message: error.message });
  }
});

// Get organisations by industry
router.get('/industry/:industry', authenticate, async (req, res) => {
  try {
    const { industry } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const organisations = await Organisation.find({ 
      industry: { $regex: industry, $options: 'i' }
    })
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Organisation.countDocuments({ 
      industry: { $regex: industry, $options: 'i' }
    });

    res.json({
      organisations,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching organisations by industry:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;