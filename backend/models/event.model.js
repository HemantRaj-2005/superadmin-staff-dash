// models/model.event.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const EventSchema = new Schema({
  event_title: {
    type: String,
    required: true
  },
  event_description: {
    type: String,
    required: true
  },
  event_type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  posted_by: {
    // keep as string per your schema; change to ObjectId/ref: 'User' if you store user ids
    type: String,
    required: true
  },
  unique_event_code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  is_paid: {
    type: Boolean,
    required: true,
    default: false
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  event_start_datetime: {
    type: Date,
    required: true
  },
  event_end_datetime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'active' // adjust as needed (e.g. 'draft', 'cancelled')
  },
  views: {
    type: Number,
    required: true,
    default: 0
  },
  
  // SOFT DELETE FIELDS
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,   // adds createdAt and updatedAt
});

// Middleware to automatically filter out deleted events
EventSchema.pre(/^find/, function(next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Static methods for soft delete operations
EventSchema.statics.softDelete = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
};

EventSchema.statics.restore = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: false,
      deletedAt: null
    }
  });
};

// Method to include deleted documents in query
EventSchema.statics.findWithDeleted = function(conditions = {}) {
  return this.find(conditions).withDeleted();
};

// Method to permanently delete events deleted more than 90 days ago
EventSchema.statics.permanentDeleteOldRecords = async function() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await this.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: ninetyDaysAgo }
  });
  
  return result;
};

// optional: compound/index suggestions (uncomment if desired)
// EventSchema.index({ event_start_datetime: 1 });
// EventSchema.index({ posted_by: 1 });

export default model('Event', EventSchema);