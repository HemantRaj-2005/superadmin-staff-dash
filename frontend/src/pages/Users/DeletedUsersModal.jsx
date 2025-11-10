// components/DeletedUsersModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '@/services/api';

const DeletedUsersModal = ({ onClose, onRestoreUser, onPermanentDelete }) => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      const response = await api.get('/users/deleted');
      setDeletedUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (scheduledDate) => {
    if (!scheduledDate) return null;
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffTime = scheduled - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Deleted Users</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading deleted users...</p>
            </div>
          ) : deletedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is Empty</h3>
              <p className="text-gray-500">No deleted users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deletedUsers.map((user) => (
                <div key={user._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={user.profileImage || '/default-avatar.png'}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Deleted on {formatDate(user.deletedAt)}
                        {user.daysUntilPermanentDeletion > 0 && (
                          <span className="ml-2 text-orange-600">
                            • Permanent deletion in {user.daysUntilPermanentDeletion} days
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onRestoreUser(user._id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-200"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => onPermanentDelete(user._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedUsersModal;