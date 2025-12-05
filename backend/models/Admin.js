// // // models/Admin.js
// // import mongoose from 'mongoose';
// // import bcrypt from 'bcryptjs';

// // const AdminSchema = new mongoose.Schema({
// //   name: {
// //     type: String,
// //     required: true
// //   },
// //   email: {
// //     type: String,
// //     required: true,
// //     unique: true
// //   },
// //   password: {
// //     type: String,
// //     required: true
// //   },
// //   role: {
// //     type: String,
// //     enum: ['admin', 'super_admin'],
// //     default: 'admin'
// //   },
// //   isActive: {
// //     type: Boolean,
// //     default: true
// //   }
// // }, {
// //   timestamps: true
// // });

// // AdminSchema.pre('save', async function(next) {
// //   if (!this.isModified('password')) return next();
// //   this.password = await bcrypt.hash(this.password, 12);
// //   next();
// // });

// // AdminSchema.methods.comparePassword = async function(candidatePassword) {
// //   return await bcrypt.compare(candidatePassword, this.password);
// // };

// // export default mongoose.model('Admin', AdminSchema);



// // models/Admin.js
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const AdminSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastLogin: {
//     type: Date
//   },
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: {
//     type: Date
//   }
// }, {
//   timestamps: true
// });

// AdminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// AdminSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Virtual for checking if admin is locked
// AdminSchema.virtual('isLocked').get(function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// // Instance method to check permissions
// AdminSchema.methods.can = function(resource, action) {
//   // If admin has a role populated, check permissions
//   if (this.role && this.role.permissions) {
//     const resourcePermission = this.role.permissions.find(
//       perm => perm.resource === resource
//     );
//     return resourcePermission && resourcePermission.actions.includes(action);
//   }
//   return false;
// };

// // Static method to seed default roles and super admin
// AdminSchema.statics.initializeSystem = async function() {
//   const Role = mongoose.model('Role');
//   const defaultRoles = Role.getDefaultRoles();
  
//   // Create roles
//   for (const [key, roleData] of Object.entries(defaultRoles)) {
//     const existingRole = await Role.findOne({ name: roleData.name });
//     if (!existingRole) {
//       // For super admin role, we need a super admin to create it
//       // We'll handle this in the seed script
//       await Role.create(roleData);
//     }
//   }
// };

// export default mongoose.model('Admin', AdminSchema);

// models/Admin.js
import { adminDB } from '../db/databaseConnection.js'; 

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const AdminSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// -------------------- PASSWORD HASHING --------------------
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// -------------------- COMPARE PASSWORD --------------------
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// -------------------- IS LOCKED VIRTUAL --------------------
AdminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// -------------------- PERMISSION CHECK METHOD --------------------
AdminSchema.methods.can = function(resource, action) {
  if (!this.role) return false;

  if (this.role.permissions && Array.isArray(this.role.permissions)) {
    const resourcePermission = this.role.permissions.find(
      perm => perm.resource === resource
    );
    return Boolean(resourcePermission && resourcePermission.actions.includes(action));
  }

  return false;
};

// -------------------- DEFAULT ROLE SEEDING --------------------
AdminSchema.statics.initializeSystem = async function() {
  const Role = adminDB.model('Role');

  if (typeof Role.getDefaultRoles !== 'function') return;

  const defaultRoles = Role.getDefaultRoles();

  for (const roleData of Object.values(defaultRoles)) {
    const exists = await Role.findOne({ name: roleData.name });
    if (!exists) await Role.create(roleData);
  }
};

// -------------------- EXPORT MODEL --------------------
export default adminDB.model('Admin', AdminSchema);
