// models/ActivityLog.js
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'NAVIGATE',
      'VIEW_USER', 'UPDATE_USER', 'DELETE_USER',
      'VIEW_POST', 'UPDATE_POST', 'DELETE_POST', 'REMOVE_REACTION',
      'VIEW_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT','VIEW_USERS',
      'VIEW_ACTIVITY_LOGS', 'EXPORT_DATA'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'Post', 'Event', 'System', 'ActivityLog', null],
    default: null
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceType'
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  endpoint: {
    type: String
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  changes: {
    oldValues: { type: mongoose.Schema.Types.Mixed },
    newValues: { type: mongoose.Schema.Types.Mixed }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
ActivityLogSchema.index({ resourceType: 1, resourceId: 1 });
ActivityLogSchema.index({ action: 1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);