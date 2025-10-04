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
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityLog', ActivityLogSchema);