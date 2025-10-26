// routes/comments.js
import express from 'express';
import Comment from '../models/Comment.js';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

// Get comments for a post with nesting
router.get('/posts/:postId/comments',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const { postId } = req.params;
      
      // Get all comments for this post
      const comments = await Comment.find({ postId })
        .sort({ createdAt: 1 }); // Sort by creation date

      // Build nested structure
      const commentMap = new Map();
      const rootComments = [];

      // First pass: create a map of all comments
      comments.forEach(comment => {
        commentMap.set(comment._id.toString(), {
          ...comment.toObject(),
          replies: []
        });
      });

      // Second pass: build the tree structure
      comments.forEach(comment => {
        const commentObj = commentMap.get(comment._id.toString());
        
        if (comment.parentCommentId) {
          // This is a reply, find its parent
          const parentComment = commentMap.get(comment.parentCommentId);
          if (parentComment) {
            parentComment.replies.push(commentObj);
          }
        } else {
          // This is a root-level comment
          rootComments.push(commentObj);
        }
      });

      res.json({
        comments: rootComments,
        total: comments.length
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single comment
router.get('/:id',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete comment
router.delete('/:id',
  requirePermission('posts', 'delete'),
  logActivity('DELETE_COMMENT', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Also delete all replies to this comment
      await Comment.deleteMany({ parentCommentId: req.params.id });
      
      // Delete the comment itself
      await Comment.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'Comment and its replies deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get comment statistics for a post
router.get('/posts/:postId/stats',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const { postId } = req.params;
      
      const totalComments = await Comment.countDocuments({ postId });
      const topLevelComments = await Comment.countDocuments({ 
        postId, 
        parentCommentId: null 
      });
      const replies = await Comment.countDocuments({ 
        postId, 
        parentCommentId: { $ne: null } 
      });

      // Get recent comments
      const recentComments = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalComments,
        topLevelComments,
        replies,
        recentComments
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;