// routes/stats.js
import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all counts in parallel for better performance
    const [
      totalUsers,
      newUsersToday,
      verifiedUsers,
      googleUsers,
      totalPosts,
      totalEvents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ 
        $or: [
          { isEmailVerified: true },
          { isPhoneVerified: true }
        ]
      }),
      User.countDocuments({
        $or: [
          { isGoogleUser: true },
          { googleId: { $exists: true, $ne: null } }
        ]
      }),
      Post.countDocuments({ isDeleted: { $in: [false, null] } })
      ,
 Event.countDocuments({
      event_start_datetime: { $gte: new Date() }
    })    ]);

    res.json({
      totalUsers,
      newUsersToday,
      verifiedUsers,
      googleUsers,
      totalPosts,
      totalEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;