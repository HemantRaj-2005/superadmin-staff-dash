// components/AdminManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminList from './AdminList';
import AdminForm from './RoleForm';
import api from '../../services/api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { admin: currentAdmin } = useAuth();

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admins');
      setAdmins(response.data.admins);
      
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setIsFormOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsFormOpen(true);
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      if (selectedAdmin) {
        // Update existing admin
        await api.put(`/admins/${selectedAdmin._id}`, adminData);
      } else {
        // Create new admin
        await api.post('/admins', adminData);
      }
      
      setIsFormOpen(false);
      setSelectedAdmin(null);
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error saving admin:', error);
      throw error;
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(`/admins/${adminId}`);
        fetchAdmins(); // Refresh the list
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert(error.response?.data?.message || 'Error deleting admin');
      }
    }
  };

  const handleResetPassword = async (adminId, newPassword) => {
    try {
      await api.post(`/admins/${adminId}/reset-password`, {
        newPassword
      });
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  if (currentAdmin?.role?.name !== 'Super Admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-2xl">🚫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
              <p className="text-red-700 mt-1">Only super admins can manage other admins.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
            <p className="text-gray-600 mt-1">Manage admin accounts and their roles</p>
          </div>
          <button
            onClick={handleCreateAdmin}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Add New Admin
          </button>
        </div>

        {/* Admin List */}
        <AdminList
          admins={admins}
          loading={loading}
          currentAdminId={currentAdmin._id}
          onEditAdmin={handleEditAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onResetPassword={handleResetPassword}
        />
      </div>

      {/* Admin Form Modal */}
      {isFormOpen && (
        <AdminForm
          admin={selectedAdmin}
          roles={roles}
          onSave={handleSaveAdmin}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminManagement;