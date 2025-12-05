// routes/educationalPrograms.js
import express from 'express';
import EducationalProgram from '../models/EducationalProgram.js';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Helper to fetch program doc for logging
const getProgramForLogging = async (programId) => {
  return await EducationalProgram.findById(programId);
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

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

// Get educational programs grouped by program name
router.get(
  '/grouped/programs',
  requirePermission('educational-programs', 'view'),
  logActivity('VIEW_GROUPED_EDUCATIONAL_PROGRAMS', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 6,
        search = '',
        program = ''
      } = req.query;

      // Base match stage
      const matchStage = { isDeleted: { $in: [false, null] } };

      // Search by Program or Specialization
      if (search) {
        matchStage.$or = [
          { Program: { $regex: search, $options: 'i' } },
          { Specialization: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by program name
      if (program) {
        matchStage.Program = { $regex: program, $options: 'i' };
      }

      const aggregationPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$Program',
            programName: { $first: '$Program' },
            specializations: {
              $push: {
                _id: '$_id',
                Specialization: '$Specialization',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                isDeleted: '$isDeleted',
                deletedAt: '$deletedAt'
              }
            },
            totalSpecializations: { $sum: 1 },
            latestUpdate: { $max: '$updatedAt' },
            createdAt: { $min: '$createdAt' }
          }
        },
        { $sort: { programName: 1 } },
        {
          $facet: {
            programs: [
              { $skip: (page - 1) * limit },
              { $limit: limit * 1 }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const result = await EducationalProgram.aggregate(aggregationPipeline);
      
      const programs = result[0]?.programs || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        programs,
        totalPages,
        currentPage: Number(page),
        total: totalCount
      });

    } catch (error) {
      console.error('Error fetching grouped educational programs:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all educational programs
router.get(
  '/',
  requirePermission('educational-programs', 'view'),
  logActivity('VIEW_EDUCATIONAL_PROGRAMS', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        program = '',
        specialization = ''
      } = req.query;

      const query = { isDeleted: { $in: [false, null] } };

      // Search by Program or Specialization
      if (search) {
        query.$or = [
          { Program: { $regex: search, $options: 'i' } },
          { Specialization: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by program name
      if (program) {
        query.Program = { $regex: program, $options: 'i' };
      }

      // Filter by specialization
      if (specialization) {
        query.Specialization = { $regex: specialization, $options: 'i' };
      }

      const programs = await EducationalProgram.find(query)
        .sort({ Program: 1, Specialization: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await EducationalProgram.countDocuments(query);

      res.json({
        programs,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      console.error('Error fetching educational programs:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single educational program
router.get('/:id',
  requirePermission('educational-programs', 'view'),
  logActivity('VIEW_EDUCATIONAL_PROGRAM', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const program = await EducationalProgram.findById(req.params.id);

      if (!program) {
        return res.status(404).json({ message: 'Educational program not found' });
      }

      res.json(program);
    } catch (error) {
      console.error('Error fetching educational program:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Create new educational program
router.post('/',
  requirePermission('educational-programs', 'create'),
  logActivity('CREATE_EDUCATIONAL_PROGRAM', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const { Program, Specialization } = req.body;

      // Check if program already exists
      const existingProgram = await EducationalProgram.findOne({
        Program: Program.trim(),
        Specialization: Specialization.trim()
      });

      if (existingProgram) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { 
              status: 'FAILED', 
              description: `CREATE_EDUCATIONAL_PROGRAM failed: program already exists` 
            }
          }).catch(console.error);
        }
        return res.status(400).json({ message: 'Educational program already exists' });
      }

      const program = new EducationalProgram({
        Program: Program.trim(),
        Specialization: Specialization.trim()
      });

      const savedProgram = await program.save();

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: null, newValues: sanitizeBody(savedProgram.toObject()) },
            status: 'SUCCESS',
            description: `CREATE_EDUCATIONAL_PROGRAM by ${req.admin?.name || 'Unknown Admin'}`
          }
        }).catch(console.error);
      }

      res.status(201).json(savedProgram);
    } catch (error) {
      console.error('Error creating educational program:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Update educational program
router.put('/:id',
  requirePermission('educational-programs', 'edit'),
  logUpdateWithOldValues('EducationalProgram', getProgramForLogging),
  logActivity('UPDATE_EDUCATIONAL_PROGRAM', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const oldProgram = req.oldData || {};
      const { Program, Specialization } = req.body;

      const program = await EducationalProgram.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(typeof Program !== 'undefined' ? { Program: Program.trim() } : {}),
            ...(typeof Specialization !== 'undefined' ? { Specialization: Specialization.trim() } : {}),
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!program) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_EDUCATIONAL_PROGRAM failed: program ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Educational program not found' });
      }

      // Compute diffs
      const newProgramObj = program.toObject();
      const { oldValues, newValues } = diffObjects(oldProgram, newProgramObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(
          req.activityLogId,
          {
            $set: {
              changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
              status: 'SUCCESS',
              description: `UPDATE_EDUCATIONAL_PROGRAM by ${req.admin?.name || 'Unknown Admin'} on program ${req.params.id}`
            }
          },
          { new: true }
        ).catch((e) => console.error('Failed to update ActivityLog with changes:', e));
      } else if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_EDUCATIONAL_PROGRAM completed — no changes detected for program ${req.params.id}` }
        }).catch(console.error);
      }

      res.json(program);
    } catch (error) {
      console.error('Error updating educational program:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Soft delete educational program
router.delete('/:id',
  requirePermission('educational-programs', 'delete'),
  logActivity('DELETE_EDUCATIONAL_PROGRAM', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      // Fetch old doc to diff afterwards
      const oldProgramDoc = await getProgramForLogging(req.params.id);
      if (!oldProgramDoc) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'DELETE_EDUCATIONAL_PROGRAM failed: not found' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Educational program not found' });
      }
      const oldProgram = oldProgramDoc.toObject();

      const program = await EducationalProgram.findByIdAndUpdate(
        req.params.id,
        {
          $set: { isDeleted: true, deletedAt: new Date() }
        },
        { new: true }
      );

      if (!program) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'DELETE_EDUCATIONAL_PROGRAM failed during update' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Educational program not found' });
      }

      // Compute diff for isDeleted change
      const newProgramObj = program.toObject();
      const { oldValues, newValues } = diffObjects(oldProgram, newProgramObj);
      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
            status: 'SUCCESS',
            description: `DELETE_EDUCATIONAL_PROGRAM (soft) by ${req.admin?.name || 'Unknown Admin'} on program ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Educational program deleted successfully' });
    } catch (error) {
      console.error('Error deleting educational program:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// Hard delete educational program
router.delete('/:id/hard',
  requirePermission('educational-programs', 'delete'),
  requirePermission('educational-programs', 'hard-delete'), // Add specific permission for hard delete if needed
  logActivity('HARD_DELETE_EDUCATIONAL_PROGRAM', { resourceType: 'Educationalprogram' }),
  async (req, res) => {
    try {
      const program = await EducationalProgram.findByIdAndDelete(req.params.id);

      if (!program) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'HARD_DELETE_EDUCATIONAL_PROGRAM failed: not found' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Educational program not found' });
      }

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizeBody(program.toObject()), newValues: null },
            status: 'SUCCESS',
            description: `HARD_DELETE_EDUCATIONAL_PROGRAM by ${req.admin?.name || 'Unknown Admin'} on program ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Educational program permanently deleted' });
    } catch (error) {
      console.error('Error hard deleting educational program:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
          $set: { status: 'FAILED', description: error.message } 
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// Get program statistics
router.get('/stats/overview',
  requirePermission('educational-programs', 'view'),
  async (req, res) => {
    try {
      const totalPrograms = await EducationalProgram.countDocuments({ 
        isDeleted: { $in: [false, null] } 
      });
      
      const totalSpecializations = await EducationalProgram.aggregate([
        { $match: { isDeleted: { $in: [false, null] } } },
        { $group: { _id: '$Program', count: { $sum: 1 } } },
        { $count: 'total' }
      ]);
      
      // Programs by count
      const programsByCount = await EducationalProgram.aggregate([
        { $match: { isDeleted: { $in: [false, null] } } },
        { $group: { _id: '$Program', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Recent additions
      const recentPrograms = await EducationalProgram.find({ 
        isDeleted: { $in: [false, null] } 
      })
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalPrograms,
        totalSpecializations: totalSpecializations[0]?.total || 0,
        programsByCount,
        recentPrograms
      });
    } catch (error) {
      console.error('Error fetching program statistics:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get unique programs and specializations for filters
router.get('/filters/options',
  requirePermission('educational-programs', 'view'),
  async (req, res) => {
    try {
      const programs = await EducationalProgram.distinct('Program', { 
        isDeleted: { $in: [false, null] } 
      });
      const specializations = await EducationalProgram.distinct('Specialization', { 
        isDeleted: { $in: [false, null] } 
      });
      
      res.json({
        programs: programs.sort(),
        specializations: specializations.sort()
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;