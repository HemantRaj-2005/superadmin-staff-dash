// models/ActivityLog.js
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // make optional so system logs / failed middleware don't break
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'NAVIGATE',
      'VIEW_USER', 'UPDATE_USER', 'DELETE_USER',
      'VIEW_POST', 'UPDATE_POST', 'DELETE_POST', 'REMOVE_REACTION',
      'VIEW_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT',
      'VIEW_ACTIVITY_LOGS', 'EXPORT_DATA','UPDATE_ROLE','CREATE_ROLE','VIEW_POSTS','DELETE_COMMENT'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'Post', 'Event', 'System', 'ActivityLog', null],
    default: null
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceType',
    required: false
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  ipDetails: {
    country: String,
    city: String,
    region: String,
    timezone: String,
    isp: String
  },
  userAgent: {
    type: String
  },
  userAgentDetails: {
    browser: String,
    version: String,
    os: String,
    platform: String,
    device: String
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
    enum: ['PENDING', 'SUCCESS', 'FAILED'], // include PENDING so middleware can create initial record
    default: 'PENDING'
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

// Indexes for better query performance
ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
ActivityLogSchema.index({ resourceType: 1, resourceId: 1 });
ActivityLogSchema.index({ action: 1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);
