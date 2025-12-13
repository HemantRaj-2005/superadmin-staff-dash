// // models/ActivityLog.js
// import mongoose from 'mongoose';

// const ActivityLogSchema = new mongoose.Schema({
//   adminId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin',
//     required: false // make optional so system logs / failed middleware don't break
//   },
//   action: {
//     type: String,
//     required: true,
//     enum: [
//       'LOGIN', 'LOGOUT', 'NAVIGATE','SOFT_DELETE_USER',
//       'VIEW_USER','VIEW_USERS', 'UPDATE_USER', 'DELETE_USER','RESTORE_USER',
//       'VIEW_POST', 'UPDATE_POST', 'DELETE_POST', 'REMOVE_REACTION',
//       'VIEW_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT','PERMANENT_DELETE_USER',
//       'VIEW_ACTIVITY_LOGS', 'EXPORT_DATA','UPDATE_ROLE','CREATE_ROLE','VIEW_POSTS','DELETE_COMMENT',
//       'DELETE_ROLE','VIEW_SCHOOLS','EXPORT_SCHOOLS','VIEW_EDUCATIONAL_PROGRAMS','CREATE_EDUCATIONAL_PROGRAM','UPDATE_EDUCATIONAL_PROGRAM',
//       'VIEW_EDUCATIONAL_PROGRAMS','VIEW_CITIES','VIEW_GROUPED_EDUCATIONAL_PROGRAMS','VIEW_ORGANISATIONS','CREATE_ORGANISATION','UPDATE_ORGANISATION',
//       'DELETE_ORGANISATION','CREATE_SCHOOL','BULK_IMPORT_SCHOOLS','UPDATE_SCHOOL','VIEW_DELETED_USERS',
//       'SEARCH_USERS','SEARCH_POSTS','SCHOOL_SEARCH','EVENT_SEARCH','SEARCH_EDUCATIONAL_PROGRAMS',
//        'CITY_SEARCH','CREATE_ADMIN',
//     ]
//   },
//   resourceType: {
//     type: String,
//     enum: ['User', 'Post', 'Event', 'System', 'ActivityLog','School','Educationalprogram', 'Worldcity','Organization',null],
//     default: null
//   },
//   resourceId: {
//     type: mongoose.Schema.Types.ObjectId,
//     refPath: 'resourceType',
//     required: false
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   ipAddress: {
//     type: String,
//     required: true
//   },
//   ipDetails: {
//     country: String,
//     city: String,
//     region: String,
//     timezone: String,
//     isp: String
//   },
//   userAgent: {
//     type: String
//   },
//   userAgentDetails: {
//     browser: String,
//     version: String,
//     os: String,
//     platform: String,
//     device: String
//   },
//   endpoint: {
//     type: String
//   },
//   method: {
//     type: String,
//     enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
//   },
//   status: {
//     type: String,
//     enum: ['PENDING', 'SUCCESS', 'FAILED'], // include PENDING so middleware can create initial record
//     default: 'PENDING'
//   },
//   changes: {
//     oldValues: { type: mongoose.Schema.Types.Mixed },
//     newValues: { type: mongoose.Schema.Types.Mixed }
//   },
//   metadata: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {}
//   }
// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
// ActivityLogSchema.index({ resourceType: 1, resourceId: 1 });
// ActivityLogSchema.index({ action: 1 });

// export default mongoose.model('ActivityLog', ActivityLogSchema);

import { adminDB } from '../db/databaseConnection.js'; // Make sure path is correct
import mongoose from 'mongoose';

// Use mongoose.Schema, not adminDB.Schema
const ActivityLogSchema = new mongoose.Schema({ 
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'NAVIGATE','SOFT_DELETE_USER',
      'VIEW_USER','VIEW_USERS', 'UPDATE_USER', 'DELETE_USER','RESTORE_USER',
      'VIEW_POST', 'UPDATE_POST', 'DELETE_POST', 'REMOVE_REACTION',
      'VIEW_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT','PERMANENT_DELETE_USER',
      'VIEW_ACTIVITY_LOGS', 'EXPORT_DATA','UPDATE_ROLE','CREATE_ROLE','VIEW_POSTS','DELETE_COMMENT',
      'DELETE_ROLE','VIEW_SCHOOLS','EXPORT_SCHOOLS','VIEW_EDUCATIONAL_PROGRAMS','CREATE_EDUCATIONAL_PROGRAM','UPDATE_EDUCATIONAL_PROGRAM',
      'VIEW_EDUCATIONAL_PROGRAMS','VIEW_CITIES','VIEW_GROUPED_EDUCATIONAL_PROGRAMS','VIEW_ORGANISATIONS','CREATE_ORGANISATION','UPDATE_ORGANISATION',
      'DELETE_ORGANISATION','CREATE_SCHOOL','BULK_IMPORT_SCHOOLS','UPDATE_SCHOOL','VIEW_DELETED_USERS',
      'SEARCH_USERS','SEARCH_POSTS','SCHOOL_SEARCH','EVENT_SEARCH','SEARCH_EDUCATIONAL_PROGRAMS',
      'CITY_SEARCH','CREATE_ADMIN','VIEW_EVENTS','DELETE_ADMIN','UPDATE_ADMIN'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'Post', 'Event', 'System', 'ActivityLog','School','Educationalprogram', 'Worldcity','Organization',null],
    default: null
  },
  resourceId: {
    type: String,
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
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
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

// Use adminDB.model() to register model on admin database
export default adminDB.model('ActivityLog', ActivityLogSchema);