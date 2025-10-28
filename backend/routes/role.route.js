// routes/roles.js
import express from 'express';
import Role from '../models/role.model.js';
import Admin from '../models/admin.model.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { requireSuperAdmin, populateAdminPermissions } from '../middleware/permissions.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes require super admin 
router.use(authenticate, populateAdminPermissions, requireSuperAdmin);

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single role
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('createdBy', 'name email');


      
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new role
router.post('/', logActivity('CREATE_ROLE'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const role = new Role({
      name,
      description,
      permissions,
      createdBy: req.admin._id
    });

    await role.save();
    
    // Populate createdBy for response
    await role.populate('createdBy', 'name email');

    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update role
router.put('/:id', logActivity('UPDATE_ROLE'), async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permissions,
        isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete role
router.delete('/:id', logActivity('DELETE_ROLE'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if role is assigned to any admin
    const adminCount = await Admin.countDocuments({ role: req.params.id });
    if (adminCount > 0) {
      return res.status(400).json({
        message: `Cannot delete role. It is assigned to ${adminCount} admin(s).`
      });
    }

    // Prevent deletion of default roles
    if (role.isDefault) {
      return res.status(400).json({
        message: 'Cannot delete default roles.'
      });
    }

    await Role.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available permissions structure
router.get('/permissions/structure', async (req, res) => {
  try {
    const permissionStructure = {
      resources: [
        {
          id: 'users',
          name: 'User Management',
          description: 'Manage users and their data',
          actions: [
            { id: 'view', name: 'View Users', description: 'Can view user list and details' },
            { id: 'create', name: 'Create Users', description: 'Can create new users' },
            { id: 'edit', name: 'Edit Users', description: 'Can edit user information' },
            { id: 'delete', name: 'Delete Users', description: 'Can delete users' },
            { id: 'export', name: 'Export Users', description: 'Can export user data' },
            { id: 'manage', name: 'Manage Users', description: 'Full user management access' }
          ]
        },
        {
          id: 'posts',
          name: 'Post Management',
          description: 'Manage posts and content',
          actions: [
            { id: 'view', name: 'View Posts', description: 'Can view post list and details' },
            { id: 'create', name: 'Create Posts', description: 'Can create new posts' },
            { id: 'edit', name: 'Edit Posts', description: 'Can edit posts' },
            { id: 'delete', name: 'Delete Posts', description: 'Can delete posts' },
            { id: 'export', name: 'Export Posts', description: 'Can export post data' },
            { id: 'manage', name: 'Manage Posts', description: 'Full post management access' }
          ]
        },
        {
          id: 'events',
          name: 'Event Management',
          description: 'Manage events and schedules',
          actions: [
            { id: 'view', name: 'View Events', description: 'Can view event list and details' },
            { id: 'create', name: 'Create Events', description: 'Can create new events' },
            { id: 'edit', name: 'Edit Events', description: 'Can edit events' },
            { id: 'delete', name: 'Delete Events', description: 'Can delete events' },
            { id: 'export', name: 'Export Events', description: 'Can export event data' },
            { id: 'manage', name: 'Manage Events', description: 'Full event management access' }
          ]
        },
        {
          id: 'activity_logs',
          name: 'Activity Logs',
          description: 'View system activity and audit logs',
          actions: [
            { id: 'view', name: 'View Logs', description: 'Can view activity logs' },
            { id: 'export', name: 'Export Logs', description: 'Can export log data' },
            { id: 'manage', name: 'Manage Logs', description: 'Full log management access' }
          ]
        },
        {
          id: 'settings',
          name: 'System Settings',
          description: 'Manage system configuration',
          actions: [
            { id: 'view', name: 'View Settings', description: 'Can view system settings' },
            { id: 'edit', name: 'Edit Settings', description: 'Can modify system settings' },
            { id: 'manage', name: 'Manage Settings', description: 'Full settings management access' }
          ]
        },
        {
          id: 'roles',
          name: 'Role Management',
          description: 'Manage admin roles and permissions',
          actions: [
            { id: 'view', name: 'View Roles', description: 'Can view roles and permissions' },
            { id: 'create', name: 'Create Roles', description: 'Can create new roles' },
            { id: 'edit', name: 'Edit Roles', description: 'Can modify roles and permissions' },
            { id: 'delete', name: 'Delete Roles', description: 'Can delete roles' },
            { id: 'manage', name: 'Manage Roles', description: 'Full role management access' }
          ]
        }
      ]
    };

    res.json(permissionStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;