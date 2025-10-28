// models/Post.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

/**
 * Reaction subdocument schema
 * Matches:
 * {
 *   _id: string,
 *   emoji: string,
 *   id: int,
 *   label: string,
 *   reactedBy: string
 * }
 */
const ReactionSchema = new Schema({
  _id: { type: String, required: true },
  emoji: { type: String, required: true },
  id: { type: Number, required: true },
  label: { type: String, required: true },
  reactedBy: { type: String, required: true }
}, { _id: false }); // _id is supplied as a string field, not the default ObjectId

/**
 * Post schema matching provided JSON Schema.
 * Uses timestamps to auto-manage createdAt and updatedAt.
 */
const PostSchema = new Schema({
  // required fields
  author:     { type: String, required: true },
  title:      { type: String, required: true },
  content:    { type: String, required: true },

  // optional / additional fields
  imageUrl:   { type: [String], default: [] },        // array of strings (URLs)
  reactions:  { type: [ReactionSchema], default: [] },// array of reaction subdocs
  
  // SOFT DELETE FIELDS
  isDeleted:  { 
    type: Boolean, 
    default: false 
  },
  deletedAt:  { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true,   // adds createdAt and updatedAt (matches your JSON schema)
//   versionKey: true    // keeps the __v field (Mongoose default)
});

// Middleware to automatically filter out deleted posts
PostSchema.pre(/^find/, function(next) {
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Static methods for soft delete operations
PostSchema.statics.softDelete = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
};

PostSchema.statics.restore = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: false,
      deletedAt: null
    }
  });
};

// Method to include deleted documents in query
PostSchema.statics.findWithDeleted = function(conditions = {}) {
  return this.find(conditions).withDeleted();
};

// Method to permanently delete posts deleted more than 90 days ago
PostSchema.statics.permanentDeleteOldRecords = async function() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await this.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: ninetyDaysAgo }
  });
  
  return result;
};

// Export model
export default model('Post', PostSchema);