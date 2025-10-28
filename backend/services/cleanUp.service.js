// jobs/cleanupJob.js
import cron from 'node-cron';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Event from '../models/event.model.js';
import Comment from '../models/comment.model.js';

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('🚀 Starting permanent deletion of old soft-deleted records...');
    
    // Cleanup all models
    const userResult = await User.permanentDeleteOldRecords();
    const postResult = await Post.permanentDeleteOldRecords();
    const eventResult = await Event.permanentDeleteOldRecords();
    const commentResult = await Comment.permanentDeleteOldRecords();
    
    console.log(`✅ Permanently deleted:`);
    console.log(`   - ${userResult.deletedCount} users`);
    console.log(`   - ${postResult.deletedCount} posts`);
    console.log(`   - ${eventResult.deletedCount} events`);
    console.log(`   - ${commentResult.deletedCount} comments`);
    console.log(`   (that were soft-deleted more than 90 days ago)`);
  } catch (error) {
    console.error('❌ Error in cleanup job:', error);
  }
});

export default cron;