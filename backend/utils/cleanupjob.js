import cron from 'node-cron';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const runCleanupJob = () => {
  // Run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🚀 Starting cleanup job for permanently deleting users...');
      
      const cutoffDate = new Date();
      const usersToDelete = await User.find({
        scheduledForPermanentDeletion: { $lte: cutoffDate }
      });

      let deletedCount = 0;

      for (const user of usersToDelete) {
        try {
          // Permanently delete user and their posts
          await Post.deleteMany({ author: user._id });
          await User.findByIdAndDelete(user._id);
          deletedCount++;
          console.log(`✅ Permanently deleted user: ${user.username}`);
        } catch (userError) {
          console.error(`❌ Error deleting user ${user.username}:`, userError);
        }
      }

      console.log(`🎉 Cleanup job completed. Deleted ${deletedCount} users.`);
    } catch (error) {
      console.error('💥 Error in cleanup job:', error);
    }
  });

  console.log('🕒 Cleanup job scheduled: Daily at 2 AM');
};