import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Admin: Soft delete user
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete the user
    user.isActive = false;
    user.deletedAt = new Date();
    user.scheduledForPermanentDeletion = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    await user.save();

    // Hide all user's posts
    await Post.updateMany(
      { author: user._id },
      { isVisible: false }
    );

    res.json({ 
      message: 'User scheduled for deletion successfully',
      scheduledDeletion: user.scheduledForPermanentDeletion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Restore soft-deleted user
router.patch('/:id/restore', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Restore the user
    user.isActive = true;
    user.deletedAt = null;
    user.scheduledForPermanentDeletion = null;
    await user.save();

    // Restore all user's posts
    await Post.updateMany(
      { author: user._id },
      { isVisible: true }
    );

    res.json({ message: 'User restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all active users (for admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({ deletedAt: null })
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ deletedAt: null });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get soft-deleted users (for admin)
router.get('/deleted', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const deletedUsers = await User.find({ 
      deletedAt: { $ne: null } 
    })
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ deletedAt: -1 });

    const total = await User.countDocuments({ deletedAt: { $ne: null } });

    res.json({
      users: deletedUsers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// routes/users.js - Add these routes

// Update user
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { username, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk actions
router.post('/bulk-action', adminAuth, async (req, res) => {
  try {
    const { userIds, action } = req.body;

    switch (action) {
      case 'delete':
        await User.updateMany(
          { _id: { $in: userIds } },
          { 
            isActive: false,
            deletedAt: new Date(),
            scheduledForPermanentDeletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        );
        break;
      case 'activate':
        await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: 'Bulk action completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, deletedAt: null });
    const deletedUsers = await User.countDocuments({ deletedAt: { $ne: null } });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Weekly registration stats
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyRegistrations = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    res.json({
      totalUsers,
      activeUsers,
      deletedUsers,
      adminUsers,
      weeklyRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;