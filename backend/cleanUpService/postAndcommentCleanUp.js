// services/contentCleanupService.js
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import cron from 'node-cron';

class ContentCleanupService {
  constructor() {
    this.isRunning = false;
  }

  // Permanently delete posts that were soft-deleted more than 90 days ago
  async permanentDeleteOldPosts() {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const postsToDelete = await Post.findDeleted({
        deletedAt: { $lte: ninetyDaysAgo }
      });

      if (postsToDelete.length === 0) {
        console.log('No posts found for permanent deletion');
        return { deletedCount: 0 };
      }

      const postIds = postsToDelete.map(post => post._id);
      
      // Also delete associated comments
      await Comment.deleteMany({
        postId: { $in: postIds }
      });

      // Delete posts
      const result = await Post.deleteMany({
        _id: { $in: postIds },
        isDeleted: true,
        deletedAt: { $lte: ninetyDaysAgo }
      });

      console.log(`Permanently deleted ${result.deletedCount} posts and their comments`);
      await this.logPermanentDeletions('posts', postIds);

      return result;
    } catch (error) {
      console.error('Error in permanentDeleteOldPosts:', error);
      throw error;
    }
  }

  // Permanently delete comments that were soft-deleted more than 90 days ago
  async permanentDeleteOldComments() {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const commentsToDelete = await Comment.findDeleted({
        deletedAt: { $lte: ninetyDaysAgo }
      });

      if (commentsToDelete.length === 0) {
        console.log('No comments found for permanent deletion');
        return { deletedCount: 0 };
      }

      const commentIds = commentsToDelete.map(comment => comment._id);
      
      const result = await Comment.deleteMany({
        _id: { $in: commentIds },
        isDeleted: true,
        deletedAt: { $lte: ninetyDaysAgo }
      });

      console.log(`Permanently deleted ${result.deletedCount} comments`);
      await this.logPermanentDeletions('comments', commentIds);

      return result;
    } catch (error) {
      console.error('Error in permanentDeleteOldComments:', error);
      throw error;
    }
  }

  // Get posts scheduled for permanent deletion
  async getPostsScheduledForDeletion() {
    try {
      const posts = await Post.findDeleted({
        scheduledForPermanentDeletion: { $ne: null }
      }).sort({ scheduledForPermanentDeletion: 1 });

      return posts.map(post => ({
        ...post.toObject(),
        daysUntilPermanentDeletion: post.daysUntilPermanentDeletion
      }));
    } catch (error) {
      console.error('Error getting posts scheduled for deletion:', error);
      throw error;
    }
  }

  // Get comments scheduled for permanent deletion
  async getCommentsScheduledForDeletion() {
    try {
      const comments = await Comment.findDeleted({
        scheduledForPermanentDeletion: { $ne: null }
      }).sort({ scheduledForPermanentDeletion: 1 });

      return comments.map(comment => ({
        ...comment.toObject(),
        daysUntilPermanentDeletion: comment.daysUntilPermanentDeletion
      }));
    } catch (error) {
      console.error('Error getting comments scheduled for deletion:', error);
      throw error;
    }
  }

  // Restore a soft-deleted post
  async restorePost(postId) {
    try {
      const post = await Post.findOne({ _id: postId, isDeleted: true });
      
      if (!post) {
        throw new Error('Post not found or not deleted');
      }

      await post.restore();
      return post;
    } catch (error) {
      console.error('Error restoring post:', error);
      throw error;
    }
  }

  // Restore a soft-deleted comment
  async restoreComment(commentId) {
    try {
      const comment = await Comment.findOne({ _id: commentId, isDeleted: true });
      
      if (!comment) {
        throw new Error('Comment not found or not deleted');
      }

      await comment.restore();
      return comment;
    } catch (error) {
      console.error('Error restoring comment:', error);
      throw error;
    }
  }

  // Update post comment count
  async updatePostCommentCount(postId) {
    try {
      const commentCount = await Comment.countDocuments({ 
        postId, 
        isDeleted: false 
      });
      
      await Post.findByIdAndUpdate(postId, { commentCount });
      return commentCount;
    } catch (error) {
      console.error('Error updating post comment count:', error);
      throw error;
    }
  }

  // Log permanent deletions
  async logPermanentDeletions(type, ids) {
    console.log(`Logged permanent deletion of ${type}: ${ids.join(', ')}`);
  }

  // Start the scheduled cleanup job (runs daily at 3 AM)
  startScheduledCleanup() {
    // Run every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      if (this.isRunning) {
        console.log('Content cleanup job already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting scheduled content cleanup...');

      try {
        const postResult = await this.permanentDeleteOldPosts();
        const commentResult = await this.permanentDeleteOldComments();
        
        console.log(`Content cleanup completed: ${postResult.deletedCount} posts and ${commentResult.deletedCount} comments deleted`);
      } catch (error) {
        console.error('Scheduled content cleanup failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('Content cleanup service started - will run daily at 3 AM');
  }

  // Manual trigger for cleanup
  async manualCleanup() {
    console.log('Manual content cleanup triggered');
    const postResult = await this.permanentDeleteOldPosts();
    const commentResult = await this.permanentDeleteOldComments();
    
    return {
      posts: postResult,
      comments: commentResult
    };
  }
}

export default new ContentCleanupService();