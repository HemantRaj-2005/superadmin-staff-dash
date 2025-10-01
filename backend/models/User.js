import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  scheduledForPermanentDeletion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
userSchema.index({ scheduledForPermanentDeletion: 1 });
userSchema.index({ isActive: 1, deletedAt: 1 });

export default mongoose.model('User', userSchema);