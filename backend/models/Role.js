// models/Role.js
import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: ['users', 'posts', 'events', 'activity_logs', 'settings', 'roles','schools','educational-programs','cities']
  },
  actions: [{
    type: String,
    enum: ['view', 'create', 'edit', 'delete', 'export', 'manage']
  }]
}, { _id: false });

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [PermissionSchema],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Predefined roles with their permissions
RoleSchema.statics.getDefaultRoles = function() {
  return {
    SUPER_ADMIN: {
      name: 'Super Admin',
      description: 'Full access to all features and admin management',
      permissions: [
        { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
        { resource: 'posts', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
        { resource: 'events', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
        { resource: 'activity_logs', actions: ['view', 'export', 'manage'] },
        { resource: 'settings', actions: ['view', 'edit', 'manage'] },
        { resource: 'roles', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'schools', actions: ['view', 'create', 'edit', 'delete', 'export','manage'] },
        { resource: 'cities', actions: ['view', 'create', 'edit', 'delete', 'export','manage'] },
        { resource: 'educational-programs', actions: ['view', 'create', 'edit', 'delete', 'export','manage'] },]
    },

    USER_MANAGER: {
      name: 'User Manager',
      description: 'Manage users and their data',
      permissions: [
        { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        { resource: 'posts', actions: ['view'] },
        { resource: 'events', actions: ['view'] }
      ]
    },
    CONTENT_MODERATOR: {
      name: 'Content Moderator',
      description: 'Manage posts and content',
      permissions: [
        { resource: 'users', actions: ['view'] },
        { resource: 'posts', actions: ['view', 'edit', 'delete'] },
        { resource: 'events', actions: ['view', 'edit', 'delete'] }
      ]
    },
    VIEWER: {
      name: 'Viewer',
      description: 'View-only access to all data',
      permissions: [
        { resource: 'users', actions: ['view'] },
        { resource: 'posts', actions: ['view'] },
        { resource: 'events', actions: ['view'] }
      ]
    }
  };
};

export default mongoose.model('Role', RoleSchema);