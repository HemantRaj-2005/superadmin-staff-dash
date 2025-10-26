//comment.js - Mongoose model for comments
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
}, {
  timestamps: true, // adds createdAt and updatedAt (Date)
});

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
