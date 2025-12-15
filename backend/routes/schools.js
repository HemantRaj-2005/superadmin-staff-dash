// routes/schools.js
import express from 'express';
import School from '../models/School.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';

const router = express.Router();

// Get school with old values for logging
const getSchoolForLogging = async (schoolId) => {
  return await School.findById(schoolId);
};

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

// Get all schools with advanced filtering
router.get('/',
  requirePermission('schools', 'view'),
  logActivity('VIEW_SCHOOLS', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        state = '',
        district = '',
        sortBy = 'school_name',
        sortOrder = 'asc'
      } = req.query;
      
      const query = {};
      
      // Search filter
      if (search) {
        query.$or = [
          { school_name: { $regex: search, $options: 'i' } },
          { district: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { udise_code: isNaN(search) ? null : Number(search) }
        ].filter(condition => condition !== null);
      }
      
      // State filter
      if (state) {
        query.state = state;
      }
      
      // District filter
      if (district) {
        query.district = district;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const schools = await School.find(query)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await School.countDocuments(query);

      // Get available filters
      const states = await School.distinct('state');
      const districts = await School.distinct('district');

      res.json({
        schools,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        filters: {
          states,
          districts
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get school statistics
router.get('/stats/overview',
  requirePermission('schools', 'view'),
  async (req, res) => {
    try {
      const totalSchools = await School.countDocuments();
      
      // Schools by state
      const schoolsByState = await School.aggregate([
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Schools by district
      const schoolsByDistrict = await School.aggregate([
        {
          $group: {
            _id: '$district',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Recent additions
      const recentSchools = await School.find()
        .sort({ createdAt: -1 })
        .limit(5);

      // --- New User Stats ---

      // 1. Top States by User Count
      const usersByState = await User.aggregate([
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // 2. Top Districts by User Count
      // Users link to School via string name. We need to match that to School docs to get district.
      const usersByDistrict = await User.aggregate([
        // Unwind education array to get each school entry
        { $unwind: '$education' },
        // Match only if school name exists
        { $match: { 'education.school': { $exists: true, $ne: '' } } },
        // Lookup the school details from School collection to find the district
        // NOTE: This assumes 'education.school' stores the school NAME matching 'school_name' in School collection.
        // If it stores ID, change to match localField accordingly.
        // Based on discussion/schemas, it seems like names are used.
        {
          $lookup: {
            from: 'schools',
            localField: 'education.school',
            foreignField: 'school_name', // Assuming matching by name
            as: 'schoolDetails'
          }
        },
        // Unwind the looked-up school details (keep users even if school not found? no, we want valid districts)
        { $unwind: '$schoolDetails' },
        // Group by District
        {
          $group: {
            _id: '$schoolDetails.district',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // 3. Top Schools by User Count
      const usersBySchool = await User.aggregate([
        { $unwind: '$education' },
        { $match: { 'education.school': { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$education.school',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        totalSchools,
        schoolsByState,
        schoolsByDistrict,
        recentSchools,
        usersByState,
        usersByDistrict,
        usersBySchool
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single school details
router.get('/:id',
  requirePermission('schools', 'view'),
  logActivity('VIEW_SCHOOL', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const school = await School.findById(req.params.id);
      
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      
      res.json(school);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create new school
router.post('/',
  requirePermission('schools', 'create'),
  logActivity('CREATE_SCHOOL', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const { 
        district, 
        school_name, 
        state, 
        udise_code
      } = req.body;

      // Check if UDISE code already exists
      const existingSchool = await School.findOne({ udise_code });
      if (existingSchool) {
        return res.status(400).json({ message: 'School with this UDISE code already exists' });
      }

      const school = new School({
        district,
        school_name,
        state,
        udise_code
      });

      await school.save();
      res.status(201).json(school);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'School with this UDISE code already exists' });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Update school
router.put('/:id',
  requirePermission('schools', 'edit'),
  logUpdateWithOldValues('School', getSchoolForLogging),
  logActivity('UPDATE_SCHOOL', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const { 
        district, 
        school_name, 
        state, 
        udise_code
      } = req.body;
      const oldSchool = req.oldData;

      // Check if UDISE code is being changed and if it already exists
      if (udise_code) {
        const existingSchool = await School.findOne({ 
          udise_code, 
          _id: { $ne: req.params.id } 
        });
        if (existingSchool) {
          return res.status(400).json({ message: 'Another school with this UDISE code already exists' });
        }
      }

      const school = await School.findByIdAndUpdate(
        req.params.id,
        { 
          district,
          school_name, 
          state,
          udise_code
        },
        { new: true, runValidators: true }
      );
      
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      
      // Add old values to the activity log
      const activityLog = await ActivityLog.findOne({
        adminId: req.admin._id,
        resourceId: req.params.id,
        action: 'UPDATE_SCHOOL'
      }).sort({ createdAt: -1 });
      
      if (activityLog && oldSchool) {
        activityLog.changes = {
          oldValues: oldSchool.toObject(),
          newValues: school.toObject()
        };
        await activityLog.save();
      }
      
      res.json(school);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Another school with this UDISE code already exists' });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete school
router.delete('/:id',
  requirePermission('schools', 'delete'),
  logActivity('DELETE_SCHOOL', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const school = await School.findByIdAndDelete(req.params.id);
      
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
      
      res.json({ message: 'School deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Bulk import schools
router.post('/bulk-import',
  requirePermission('schools', 'create'),
  logActivity('BULK_IMPORT_SCHOOLS', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const { schools } = req.body;
      
      if (!Array.isArray(schools) || schools.length === 0) {
        return res.status(400).json({ message: 'No schools provided for import' });
      }

      if (schools.length > 1000) {
        return res.status(400).json({ message: 'Cannot import more than 1000 schools at once' });
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const schoolData of schools) {
        try {
          // Validate required fields
          if (!schoolData.district || !schoolData.school_name || !schoolData.state || !schoolData.udise_code) {
            results.failed++;
            results.errors.push(`Missing required fields for school: ${schoolData.school_name}`);
            continue;
          }

          // Check if UDISE code already exists
          const existingSchool = await School.findOne({ udise_code: schoolData.udise_code });
          if (existingSchool) {
            results.failed++;
            results.errors.push(`UDISE code ${schoolData.udise_code} already exists for school: ${schoolData.school_name}`);
            continue;
          }

          const school = new School(schoolData);
          await school.save();
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error importing ${schoolData.school_name}: ${error.message}`);
        }
      }

      res.json({
        message: `Import completed: ${results.success} successful, ${results.failed} failed`,
        ...results
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Export schools
router.get('/export/data',
  requirePermission('schools', 'export'),
  logActivity('EXPORT_SCHOOLS', { resourceType: 'School' }),
  async (req, res) => {
    try {
      const { format = 'csv' } = req.query;
      
      const schools = await School.find()
        .sort({ state: 1, district: 1, school_name: 1 })
        .limit(5000);

      if (format === 'csv') {
        // Convert to CSV
        const headers = ['UDISE Code', 'School Name', 'District', 'State', 'Created At'];
        const csvRows = [headers.join(',')];
        
        schools.forEach(school => {
          const row = [
            school.udise_code,
            `"${school.school_name}"`,
            `"${school.district}"`,
            `"${school.state}"`,
            `"${school.createdAt.toISOString()}"`
          ];
          csvRows.push(row.join(','));
        });
        
        const csvData = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=schools-export.csv');
        return res.send(csvData);
      }
      
      res.json(schools);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get unique states and districts for filters
router.get('/filters/options',
  requirePermission('schools', 'view'),
  async (req, res) => {
    try {
      const states = await School.distinct('state');
      const districts = await School.distinct('district');
      
      res.json({
        states: states.sort(),
        districts: districts.sort()
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;