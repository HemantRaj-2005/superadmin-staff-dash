import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Users, Trash2, RefreshCw, Search } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'active') {
      loadUsers();
    } else {
      loadDeletedUsers();
    }
  }, [activeTab, currentPage]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers(currentPage);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadDeletedUsers = async () => {
    try {
      const data = await userService.getDeletedUsers(currentPage);
      setDeletedUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading deleted users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? They will be permanently deleted after 90 days.')) {
      setLoading(true);
      try {
        await userService.deleteUser(userId);
        loadUsers();
        loadDeletedUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestoreUser = async (userId) => {
    setLoading(true);
    try {
      await userService.restoreUser(userId);
      loadUsers();
      loadDeletedUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeletion = (deletionDate) => {
    const now = new Date();
    const deletion = new Date(deletionDate);
    const diffTime = deletion - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredUsers = (activeTab === 'active' ? users : deletedUsers).filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3" />
          User Management
        </h1>
        <p className="text-gray-600 mt-2">Manage users and their access to the platform</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Users ({users.length})
            </button>
            <button
              onClick={() => { setActiveTab('deleted'); setCurrentPage(1); }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'deleted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Deleted Users ({deletedUsers.length})
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'active' ? 'active' : 'deleted'} users...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'deleted' ? 'Deleted Date' : 'Joined Date'}
                </th>
                {activeTab === 'deleted' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Until Permanent Deletion
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                          {user.role === 'admin' && (
                            <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(activeTab === 'deleted' ? user.deletedAt : user.createdAt)}
                  </td>
                  {activeTab === 'deleted' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getDaysUntilDeletion(user.scheduledForPermanentDeletion) <= 7
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getDaysUntilDeletion(user.scheduledForPermanentDeletion)} days
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {activeTab === 'active' ? (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                      ><Trash2 className="h-4 w-4 mr-1" />
                        {
                          user.role==='user' ?<div>
                    Delete</div> : <div>Delete Yourself</div>
                        }
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestoreUser(user._id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No users match your search criteria.' : `No ${activeTab} users found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === page
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;