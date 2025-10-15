// components/RoleManagement/RoleManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import PermissionMatrix from './PermissionMatrix';
import api from '..//../services/api';



const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStructure, setPermissionStructure] = useState(null);
  const { admin } = useAuth();

  useEffect(() => {
    fetchRoles();
    fetchPermissionStructure();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/roles');
      console.log(response.data);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionStructure = async () => {
    try {
      const response = await api.get('/roles/permissions/structure');
      setPermissionStructure(response.data);
    } catch (error) {
      console.error('Error fetching permission structure:', error);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    setIsMatrixOpen(true);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (selectedRole) {
        // Update existing role
        await api.put(`/roles/${selectedRole._id}`, roleData);
      } else {
        // Create new role
        await api.post('/roles', roleData);
      }
      
      setIsFormOpen(false);
      setSelectedRole(null);
      fetchRoles(); // Refresh the list
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await api.delete(`/roles/${roleId}`);
        fetchRoles(); // Refresh the list
      } catch (error) {
        console.error('Error deleting role:', error);
        alert(error.response?.data?.message || 'Error deleting role');
      }
    }
  };

  if (admin?.role?.name !== 'Super Admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-2xl">🚫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
              <p className="text-red-700 mt-1">Only super admins can manage roles and permissions.</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
            <p className="text-gray-600 mt-1">Manage admin roles and their permissions</p>
          </div>
          <button
            onClick={handleCreateRole}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Create New Role
          </button>
        </div>

        {/* Role List */}
        <RoleList
          roles={roles}
          loading={loading}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
          onViewPermissions={handleViewPermissions}
        />
      </div>

      {/* Role Form Modal */}
      {isFormOpen && (
        <RoleForm
          role={selectedRole}
          permissionStructure={permissionStructure}
          onSave={handleSaveRole}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedRole(null);
          }}
        />
      )}

      {/* Permission Matrix Modal */}
      {isMatrixOpen && selectedRole && (
        <PermissionMatrix
          role={selectedRole}
          permissionStructure={permissionStructure}
          onClose={() => {
            setIsMatrixOpen(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default RoleManagement;