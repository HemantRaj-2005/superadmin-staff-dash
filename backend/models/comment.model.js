// models/comment.model.js - Mongoose model for comments
import mongoose from "mongoose";
const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },

  parentCommentId: {
    type: String,
    default: null,
  },

  // Post and user identifiers. Kept as String to match your provided schema.
  // If your posts/users are stored as ObjectId, replace `String` with `Schema.Types.ObjectId`.
  postId: {
    type: String,
    required: true,
    index: true,
  },

  userId: {
    type: String,
    required: true,
    index: true,
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
  timestamps: true, // adds createdAt and updatedAt (Date)
});

// Middleware to automatically filter out deleted comments
CommentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Static methods for soft delete operations
CommentSchema.statics.softDelete = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
};

CommentSchema.statics.restore = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: false,
      deletedAt: null
    }
  });
};

// Method to include deleted documents in query
CommentSchema.statics.findWithDeleted = function(conditions = {}) {
  return this.find(conditions).withDeleted();
};

// Method to permanently delete comments deleted more than 90 days ago
CommentSchema.statics.permanentDeleteOldRecords = async function() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await this.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: ninetyDaysAgo }
  });
  
  return result;
};

// Optional: transform JSON output (remove internal fields, keep id)
CommentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);