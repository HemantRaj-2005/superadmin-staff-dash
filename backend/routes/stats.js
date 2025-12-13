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

    // Get all counts in parallel
    const [
      totalUsers,
       activeUsers,
      deletedUsers,
      newUsersToday,
      verifiedUsers,
      googleUsers,
      totalPosts,
      totalEvents
    ] = await Promise.all([
      // 1. Total Users
      User.countDocuments(),

      User.countDocuments({ isDeleted: false}),

      User.countDocuments({ isDeleted: true}),


      // 2. New Users Today
      User.countDocuments({ createdAt: { $gte: today } }),

      // 3. Verified Users
      User.countDocuments({ 
        $or: [
          { isEmailVerified: true },
          { isPhoneVerified: true }
        ]
      }),

      // 4. Google Users
      User.countDocuments({
        $or: [
          { isGoogleUser: true },
          { googleId: { $exists: true, $ne: null } }
        ]
      }),

      // 5. Total Posts (Excluding deleted)
      Post.countDocuments({ isDeleted: { $in: [false, null] } }),

      // 6. Total Events (FIXED)
      // We removed the date filter to show ALL events, not just upcoming ones.
      // We also added a check for deleted events if your schema supports it.
      Event.countDocuments({ 
        /* Uncomment the line below if your Event model uses isDeleted */
        // isDeleted: { $in: [false, null] } 
      }) 
    ]);

    res.json({
      totalUsers,
      activeUsers,
    deletedUsers,
      newUsersToday,
      verifiedUsers,
      googleUsers,
      totalPosts,
      totalEvents,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error); // Added logging for debugging
    res.status(500).json({ message: error.message });
  }
});

export default router;