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
  isDeleted:  { type: Boolean, default: false },
  deletedAt:  { type: Date, default: null }
}, {
  timestamps: true,   
//   versionKey: true    // keeps the __v field (Mongoose default)
});

// Export model
export default model('Post', PostSchema);
