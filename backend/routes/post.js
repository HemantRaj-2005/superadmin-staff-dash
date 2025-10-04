// routes/posts.js - Updated version
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js'; // Import User model
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Get all posts with pagination and search
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', author = '' } = req.query;
    
const query = { isDeleted: { $in: [false, null] } };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Since author is a string (not ObjectId), we need to manually get user details
    const postsWithUserDetails = await Promise.all(
      posts.map(async (post) => {
        try {
          // Try to find user by ID first (if author is stored as ObjectId string)
          let user = await User.findById(post.author);
          
          // If not found by ID, try to find by email or name
          if (!user) {
            user = await User.findOne({
              $or: [
                { email: post.author },
                { firstName: post.author },
                { $expr: { $eq: [{ $concat: ['$firstName', ' ', '$lastName'] }, post.author] } }
              ]
            });
          }
          
          return {
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
        } catch (error) {
          console.error('Error fetching user details:', error);
          return {
            ...post.toObject(),
            authorDetails: {
              firstName: 'Unknown',
              lastName: 'User',
              email: post.author,
              profileImage: null
            }
          };
        }
      })
    );

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithUserDetails,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single post details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get author details
    let user = null;
    try {
      user = await User.findById(post.author);
      if (!user) {
        user = await User.findOne({
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

// Update post
router.put('/:id', authenticate, logActivity('UPDATE_POST'), async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          title, 
          content, 
          imageUrl,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get author details for response
    let user = null;
    try {
      user = await User.findById(post.author);
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
    console.error('Error updating post:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete post (soft delete)
router.delete('/:id', authenticate, logActivity('DELETE_POST'), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove reaction from post
router.delete('/:postId/reactions/:reactionId', authenticate, logActivity('REMOVE_REACTION'), async (req, res) => {
  try {
    const { postId, reactionId } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { reactions: { _id: reactionId } }
      },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get author details for response
    let user = null;
    try {
      user = await User.findById(post.author);
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
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: error.message });
  }
});

// Hard delete post (permanent removal)
router.delete('/:id/hard', authenticate, authorize(['super_admin']), logActivity('HARD_DELETE_POST'), async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post permanently deleted' });
  } catch (error) {
    console.error('Error hard deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;