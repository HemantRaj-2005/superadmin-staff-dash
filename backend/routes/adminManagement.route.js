// routes/adminManagement.js
import express from 'express';
import Admin from '../models/admin.model.js';
import Role from '../models/role.model.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { requireSuperAdmin, populateAdminPermissions } from '../middleware/permissions.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes require super admin privileges
router.use(authenticate, populateAdminPermissions, requireSuperAdmin);

// Get all admins
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await Admin.find(query)
      .select('-password')
      .populate('role', 'name description permissions')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Admin.countDocuments(query);

    res.json({
      admins,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new admin
router.post('/', logActivity('CREATE_ADMIN'), async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role: roleId
    });

    await admin.save();
    
    // Return admin without password
    const adminResponse = await Admin.findById(admin._id)
      .select('-password')
      .populate('role');

    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin
router.put('/:id', logActivity('UPDATE_ADMIN'), async (req, res) => {
  try {
    const { name, email, roleId, isActive } = req.body;

    // Verify role exists if updating role
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    const updateData = { name, email, isActive };
    if (roleId) updateData.role = roleId;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('role');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete admin
router.delete('/:id', logActivity('DELETE_ADMIN'), async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset admin password
router.post('/:id/reset-password', logActivity('RESET_ADMIN_PASSWORD'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;