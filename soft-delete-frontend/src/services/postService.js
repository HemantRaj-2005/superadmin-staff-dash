import api from './api';

export const postService = {
  // Get all visible posts
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get posts for logged-in user
  getMyPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/my-posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update post
  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Admin: Get all posts
  getAllPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/admin/all?page=${page}&limit=${limit}`);
    return response.data;
  }
};