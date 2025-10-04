import api from './api';

export const userService = {
  // Admin: Delete user (soft delete)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Admin: Restore user
  restoreUser: async (userId) => {
    const response = await api.patch(`/users/${userId}/restore`);
    return response.data;
  },

  // Admin: Get all users
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Admin: Get deleted users
  getDeletedUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/users/deleted?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },


  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Bulk user actions
  bulkAction: async (userIds, action) => {
    const response = await api.post('/users/bulk-action', { userIds, action });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Export users
  exportUsers: async (format = 'csv') => {
    const response = await api.get(`/users/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

};