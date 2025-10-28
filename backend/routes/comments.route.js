// routes/comments.js
import express from 'express';
import Comment from '../models/comment.model.js';
import { authenticate } from '../middleware/auth.js';
import { populateAdminPermissions, requirePermission } from '../middleware/permissions.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Apply authentication and permission population to all routes
router.use(authenticate, populateAdminPermissions);

// Get comments for a post with nesting (only non-deleted comments)
router.get('/posts/:postId/comments',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { includeDeleted } = req.query;
      
      // Build query based on includeDeleted parameter
      const query = { postId };
      if (!includeDeleted || includeDeleted === 'false') {
        query.isDeleted = false;
      }

      // Get all comments for this post
      const comments = includeDeleted === 'true' 
        ? await Comment.findWithDeleted(query).sort({ createdAt: 1 })
        : await Comment.find(query).sort({ createdAt: 1 });

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

// Get deleted comments for a post (admin only)
router.get('/posts/:postId/comments/deleted',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const { postId } = req.params;
      
      const deletedComments = await Comment.findWithDeleted({ 
        postId, 
        isDeleted: true 
      }).sort({ deletedAt: -1 });

      res.json({
        comments: deletedComments,
        total: deletedComments.length
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
      const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Soft delete comment
router.delete('/:id',
  requirePermission('posts', 'delete'),
  logActivity('DELETE_COMMENT', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const result = await Comment.softDelete({ _id: req.params.id });
      
      if (result.nModified === 0) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Also soft delete all replies to this comment
      await Comment.softDelete({ parentCommentId: req.params.id });
      
      res.json({ 
        message: 'Comment and its replies deleted successfully',
        scheduledDeletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Restore soft-deleted comment
router.patch('/:id/restore',
  requirePermission('posts', 'edit'),
  logActivity('RESTORE_COMMENT', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const result = await Comment.restore({ _id: req.params.id });
      
      if (result.nModified === 0) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Also restore all replies to this comment
      await Comment.restore({ parentCommentId: req.params.id });
      
      res.json({ message: 'Comment and its replies restored successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Permanent delete comment (admin only)
router.delete('/:id/permanent',
  requirePermission('posts', 'delete'),
  logActivity('PERMANENT_DELETE_COMMENT', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Also permanently delete all replies
      await Comment.deleteMany({ parentCommentId: req.params.id });
      
      res.json({ message: 'Comment and its replies permanently deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Bulk actions for comments
router.post('/bulk/action',
  requirePermission('posts', 'edit'),
  logActivity('BULK_COMMENT_ACTION', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const { commentIds = [], action } = req.body;

      switch (action) {
        case 'delete':
          await Comment.softDelete({ _id: { $in: commentIds } });
          // Also soft delete replies of these comments
          await Comment.softDelete({ parentCommentId: { $in: commentIds } });
          break;

        case 'restore':
          await Comment.restore({ _id: { $in: commentIds } });
          // Also restore replies of these comments
          await Comment.restore({ parentCommentId: { $in: commentIds } });
          break;

        case 'permanent-delete':
          await Comment.deleteMany({ _id: { $in: commentIds } });
          await Comment.deleteMany({ parentCommentId: { $in: commentIds } });
          break;

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      res.json({ message: 'Bulk action completed successfully' });
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
      
      const totalComments = await Comment.countDocuments({ postId, isDeleted: false });
      const deletedComments = await Comment.countDocuments({ postId, isDeleted: true });
      const topLevelComments = await Comment.countDocuments({ 
        postId, 
        parentCommentId: null,
        isDeleted: false 
      });
      const replies = await Comment.countDocuments({ 
        postId, 
        parentCommentId: { $ne: null },
        isDeleted: false 
      });

      // Get recent non-deleted comments
      const recentComments = await Comment.find({ 
        postId, 
        isDeleted: false 
      })
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalComments,
        deletedComments,
        topLevelComments,
        replies,
        recentComments
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all comments with pagination and filtering (admin only)
router.get('/',
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        postId = '',
        userId = '',
        includeDeleted = false
      } = req.query;

      const query = {};
      
      if (postId) {
        query.postId = postId;
      }
      
      if (userId) {
        query.userId = userId;
      }
      
      if (!includeDeleted || includeDeleted === 'false') {
        query.isDeleted = false;
      }

      const comments = includeDeleted === 'true'
        ? await Comment.findWithDeleted(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        : await Comment.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

      const total = includeDeleted === 'true'
        ? await Comment.countDocuments(query)
        : await Comment.countDocuments(query);

      res.json({
        comments,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;