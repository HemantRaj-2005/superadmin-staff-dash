// models/School.js - Updated with soft delete
import mongoose from 'mongoose';
const { Schema } = mongoose;

const schoolSchema = new Schema({
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  school_name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  udise_code: {
    type: Number,
    required: [true, 'UDISE code is required'],
    unique: true,
    validate: {
      validator: Number.isFinite,
      message: 'UDISE code must be a number',
    },
  },
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

// Create an index for faster lookup by udise_code (helps enforce uniqueness)
schoolSchema.index({ udise_code: 1 }, { unique: true });
schoolSchema.index({ isDeleted: 1 });
schoolSchema.index({ state: 1, district: 1 });

// Middleware to exclude soft-deleted schools from normal queries
// schoolSchema.pre(/^find/, function(next) {
//   // Only include non-deleted schools in normal queries
//   if (this.getFilter().isDeleted === undefined) {
//     this.where({ isDeleted: false });
//   }
//   next();
// });

// Static method to find including deleted schools
schoolSchema.statics.findIncludingDeleted = function(conditions = {}) {
  return this.find(conditions).where({ isDeleted: { $in: [true, false] } });
};

// Static method to find only deleted schools
schoolSchema.statics.findDeleted = function(conditions = {}) {
  return this.find(conditions).where({ isDeleted: true });
};

// Instance method to soft delete school
schoolSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore school
schoolSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Optional: instance method to return a public representation
schoolSchema.methods.toPublic = function () {
  return {
    id: this._id,
    district: this.district,
    school_name: this.school_name,
    state: this.state,
    udise_code: this.udise_code,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const School = mongoose.models?.School || mongoose.model('School', schoolSchema);

export default School;