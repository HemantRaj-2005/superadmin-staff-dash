// routes/posts.js
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/activityLogger.js';
import { requirePermission } from '../middleware/permissions.js';
import Comment from '../models/comment.model.js';

const router = express.Router();

// Helper to fetch post doc for logging (returns Mongoose doc)
const getPostForLogging = async (postId) => {
  return await Post.findById(postId);
};

/* -------------------------
   Helpers: deep diff + sanitize
   ------------------------- */
const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'otpVerificationId'];

const sanitizeBody = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(i => sanitizeBody(i));
  const copy = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sensitiveFields.includes(k)) copy[k] = '***HIDDEN***';
    else if (v && typeof v === 'object') copy[k] = sanitizeBody(v);
    else copy[k] = v;
  }
  return copy;
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

const isEqual = (a, b) => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false;
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!bk.includes(k)) return false;
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return a === b;
};

/**
 * Returns { oldValues, newValues } with only differing fields (recursive).
 */
const diffObjects = (oldObj = {}, newObj = {}) => {
  const oldValues = {};
  const newValues = {};

  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  keys.forEach((key) => {
    const a = oldObj ? oldObj[key] : undefined;
    const b = newObj ? newObj[key] : undefined;

    if (isObject(a) && isObject(b)) {
      const nested = diffObjects(a, b);
      if (Object.keys(nested.oldValues).length > 0) {
        oldValues[key] = nested.oldValues;
        newValues[key] = nested.newValues;
      }
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (!isEqual(a, b)) {
        oldValues[key] = a;
        newValues[key] = b;
      }
    } else {
      if (!isEqual(a, b)) {
        if (typeof a !== 'undefined') oldValues[key] = a;
        if (typeof b !== 'undefined') newValues[key] = b;
      }
    }
  });

  return { oldValues, newValues };
};

// Get posts (only non-deleted by default)
router.get(
  '/',
  requirePermission('posts', 'view'),
  logActivity('VIEW_POSTS', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        author = '',
        includeDeleted = false // New parameter to include deleted posts
      } = req.query;

      // Build query based on includeDeleted parameter
      const query = {};
      if (!includeDeleted || includeDeleted === 'false') {
        query.isDeleted = false;
      }

      // Search by title or content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by author name/email
      if (author) {
        query.author = { $regex: author, $options: 'i' };
      }

      // Use findWithDeleted if including deleted posts
      const posts = includeDeleted === 'true' 
        ? await Post.findWithDeleted(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        : await Post.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

      // Combine author details and comment counts
      const postsWithExtras = await Promise.all(
        posts.map(async (post) => {
          let user = null;

          // Try finding author by ID
          if (post.author) {
            try {
              user = await User.findOne({ _id: post.author, isDeleted: false });
            } catch {}
          }

          // Fallback: try by name or email (only non-deleted users)
          if (!user) {
            user = await User.findOne({
              isDeleted: false,
              $or: [
                { email: post.author },
                { firstName: post.author },
                {
                  $expr: {
                    $eq: [{ $concat: ['$firstName', ' ', '$lastName'] }, post.author]
                  }
                }
              ]
            });
          }

          // Count comments for this post (only non-deleted comments)
          const commentCount = await Comment.countDocuments({
            postId: post._id,
            isDeleted: false
          });

          return {
            ...post.toObject(),
            authorDetails: user
              ? {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  profileImage: user.profileImage
                }
              : {
                  firstName: 'Unknown',
                  lastName: 'User',
                  email: post.author,
                  profileImage: null
                },
            commentCount
          };
        })
      );

      const total = includeDeleted === 'true' 
        ? await Post.countDocuments(query)
        : await Post.countDocuments(query);

      res.json({
        posts: postsWithExtras,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get deleted posts (admin only)
router.get(
  '/deleted',
  authenticate,
  requirePermission('posts', 'view'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = ''
      } = req.query;

      const query = { isDeleted: true };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const deletedPosts = await Post.findWithDeleted(query)
        .sort({ deletedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const postsWithExtras = await Promise.all(
        deletedPosts.map(async (post) => {
          let user = null;
          try {
            user = await User.findOne({ _id: post.author, isDeleted: false });
          } catch {}

          const commentCount = await Comment.countDocuments({
            postId: post._id,
            isDeleted: false
          });

          return {
            ...post.toObject(),
            authorDetails: user
              ? {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  profileImage: user.profileImage
                }
              : {
                  firstName: 'Unknown',
                  lastName: 'User',
                  email: post.author,
                  profileImage: null
                },
            commentCount
          };
        })
      );

      const total = await Post.countDocuments({ isDeleted: true });

      res.json({
        posts: postsWithExtras,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      console.error('Error fetching deleted posts:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single post details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    let user = null;
    try {
      user = await User.findOne({ _id: post.author, isDeleted: false });
      if (!user) {
        user = await User.findOne({
          isDeleted: false,
          $or: [
            { email: post.author },
            { firstName: post.author }
          ]
        });
      }
    } catch (userError) {
      console.error('Error fetching user:', userError);
    }

    const postWithDetails = {
      ...post.toObject(),
      authorDetails: user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage
      } : {
        firstName: 'Unknown',
        lastName: 'User',
        email: post.author,
        profileImage: null
      }
    };

    res.json(postWithDetails);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------
   Update post (store only changed fields)
   ------------------------- */
router.put(
  '/:id',
  authenticate,
  logUpdateWithOldValues('Post', getPostForLogging),
  logActivity('UPDATE_POST', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const oldPost = req.oldData || {};
      const { title, content, imageUrl } = req.body;

      // Only update non-deleted posts
      const post = await Post.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        {
          $set: {
            ...(typeof title !== 'undefined' ? { title } : {}),
            ...(typeof content !== 'undefined' ? { content } : {}),
            ...(typeof imageUrl !== 'undefined' ? { imageUrl } : {}),
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!post) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_POST failed: post ${req.params.id} not found or deleted` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Post not found' });
      }

      // compute diffs: use plain objects
      const newPostObj = post.toObject();
      const { oldValues, newValues } = diffObjects(oldPost, newPostObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(
          req.activityLogId,
          {
            $set: {
              changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
              status: 'SUCCESS',
              description: `UPDATE_POST by ${req.admin?.name || 'Unknown Admin'} on post ${req.params.id}`
            }
          },
          { new: true }
        ).catch((e) => console.error('Failed to update ActivityLog with changes:', e));
      } else if (req.activityLogId) {
        // no actual changes detected
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_POST completed — no changes detected for post ${req.params.id}` }
        }).catch(console.error);
      }

      // attach author details for response
      let user = null;
      try { 
        user = await User.findOne({ _id: post.author, isDeleted: false }); 
      } catch (e) { console.error(e); }

      const postWithDetails = {
        ...post.toObject(),
        authorDetails: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage
        } : {
          firstName: 'Unknown',
          lastName: 'User',
          email: post.author,
          profileImage: null
        }
      };

      res.json(postWithDetails);
    } catch (error) {
      console.error('Error updating post:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(400).json({ message: error.message });
    }
  }
);

/* -------------------------
   Soft delete post
   ------------------------- */
router.delete(
  '/:id', 
  authenticate, 
  requirePermission('posts', 'delete'),
  logActivity('DELETE_POST', { resourceType: 'Post' }), 
  async (req, res) => {
    try {
      const result = await Post.softDelete({ _id: req.params.id });
      
      if (result.nModified === 0) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'DELETE_POST failed: post not found' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Post not found' });
      }

      // Soft delete associated comments
      await Comment.softDelete({ postId: req.params.id });

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            status: 'SUCCESS',
            description: `DELETE_POST (soft) by ${req.admin?.name || 'Unknown Admin'} on post ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ 
        message: 'Post deleted successfully',
        scheduledDeletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

/* -------------------------
   Restore soft-deleted post
   ------------------------- */
router.patch(
  '/:id/restore',
  authenticate,
  requirePermission('posts', 'edit'),
  logActivity('RESTORE_POST', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const result = await Post.restore({ _id: req.params.id });
      
      if (result.nModified === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Restore associated comments
      await Comment.restore({ postId: req.params.id });

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            status: 'SUCCESS',
            description: `RESTORE_POST by ${req.admin?.name || 'Unknown Admin'} on post ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Post restored successfully' });
    } catch (error) {
      console.error('Error restoring post:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

/* -------------------------
   Remove reaction — record changes
   ------------------------- */
router.delete('/:postId/reactions/:reactionId',
  authenticate,
  logActivity('REMOVE_REACTION', { resourceType: 'Post' }),
  async (req, res) => {
    try {
      const { postId, reactionId } = req.params;

      // Get old post doc (only non-deleted posts)
      const oldPostDoc = await Post.findOne({ _id: postId, isDeleted: false });
      if (!oldPostDoc) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'REMOVE_REACTION failed: post not found' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Post not found' });
      }
      const oldPost = oldPostDoc.toObject();

      const post = await Post.findOneAndUpdate(
        { _id: postId, isDeleted: false },
        { $pull: { reactions: { _id: reactionId } } },
        { new: true }
      );

      if (!post) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'REMOVE_REACTION failed during update' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Post not found' });
      }

      // compute diff — probably reactions array changed
      const newPostObj = post.toObject();
      const { oldValues, newValues } = diffObjects(oldPost, newPostObj);
      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
            status: 'SUCCESS',
            description: `REMOVE_REACTION by ${req.admin?.name || 'Unknown Admin'} on post ${postId}`
          }
        }).catch(console.error);
      }

      // attach author details for response
      let user = null;
      try { 
        user = await User.findOne({ _id: post.author, isDeleted: false }); 
      } catch (e) { console.error(e); }

      const postWithDetails = {
        ...post.toObject(),
        authorDetails: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage
        } : {
          firstName: 'Unknown',
          lastName: 'User',
          email: post.author,
          profileImage: null
        }
      };

      res.json(postWithDetails);
    } catch (error) {
      console.error('Error removing reaction:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

/* -------------------------
   Hard delete (permanent)
   ------------------------- */
router.delete(
  '/:id/hard', 
  authenticate, 
  authorize(['super_admin']), 
  logActivity('HARD_DELETE_POST', { resourceType: 'Post' }), 
  async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);

      if (!post) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
            $set: { status: 'FAILED', description: 'HARD_DELETE_POST failed: not found' } 
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Post not found' });
      }

      // Also permanently delete associated comments
      await Comment.deleteMany({ postId: req.params.id });

      if (req.activityLogId) {
        // record old->null removal (optional)
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizeBody(post.toObject()), newValues: null },
            status: 'SUCCESS',
            description: `HARD_DELETE_POST by ${req.admin?.name || 'Unknown Admin'} on post ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Post permanently deleted' });
    } catch (error) {
      console.error('Error hard deleting post:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, { 
          $set: { status: 'FAILED', description: error.message } 
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;