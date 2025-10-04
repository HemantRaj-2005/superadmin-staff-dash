// components/UserManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching users...');
      const response = await api.get('/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      
      // console.log('API Response:', response.data);
      // console.log('Users found:', response.data.users.length);
      
      setUsers(response.data.users);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    try {
      console.log('Fetching user details for:', user._id);
      const response = await api.get(`/users/${user._id}`);
      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      await api.put(`/users/${userId}`, updateData);
      fetchUsers(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total Users: {pagination.total}</p>
          <p>Current Page: {pagination.page}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
        

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          loading={loading}
          onUserClick={handleUserClick}
          onDeleteUser={handleDeleteUser}
        />

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagement;