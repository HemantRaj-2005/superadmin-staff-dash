import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Ban
} from 'lucide-react';
import { userService } from '../../services/userService';

const AdvancedUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers(currentPage, 20);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    setFilteredUsers(filtered);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    setLoading(true);
    try {
      const promises = Array.from(selectedUsers).map(userId => {
        switch (bulkAction) {
          case 'delete':
            return userService.deleteUser(userId);
          case 'activate':
            return userService.updateUser(userId, { isActive: true });
          case 'deactivate':
            return userService.updateUser(userId, { isActive: false });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedUsers(new Set());
      setBulkAction('');
      loadUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    setLoading(true);
    try {
      switch (action) {
        case 'delete':
          await userService.deleteUser(userId);
          break;
        case 'edit':
          // Open edit modal (implement this)
          break;
        case 'toggle_active':
          const user = users.find(u => u._id === userId);
          await userService.updateUser(userId, { isActive: !user.isActive });
          break;
        default:
          break;
      }
      loadUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user._id)));
    }
  };

  const ExportButton = () => (
    <div className="relative group">
      <button className="btn-secondary flex items-center">
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Export as CSV
        </button>
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Export as Excel
        </button>
        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Export as PDF
        </button>
      </div>
    </div>
  );

  const UserRow = ({ user }) => (
    <tr className={`border-b hover:bg-gray-50 ${selectedUsers.has(user._id) ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedUsers.has(user._id)}
          onChange={() => toggleUserSelection(user._id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.username}
              {user.role === 'admin' && (
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleUserAction(user._id, 'edit')}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="Edit User"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleUserAction(user._id, 'toggle_active')}
            className={user.isActive 
              ? "text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50" 
              : "text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
            }
            title={user.isActive ? "Deactivate User" : "Activate User"}
          >
            {user.isActive ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleUserAction(user._id, 'delete')}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center">
                <UserX className="h-4 w-4 mr-2" />
                Ban User
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and monitor all user accounts</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <ExportButton />
          <button className="btn-primary flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="export">Export Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-3 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-primary-50 border-primary-500 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).some(f => f !== 'all') && (
              <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {Object.values(filters).filter(f => f !== 'all').length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Joined</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setFilters({ status: 'all', role: 'all', dateRange: 'all' })}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f !== 'all') 
                ? "No users match your search criteria." 
                : "No users found in the system."
              }
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 20, filteredUsers.length)}</span> of{' '}
            <span className="font-medium">{filteredUsers.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-lg ${
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
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUserManagement;