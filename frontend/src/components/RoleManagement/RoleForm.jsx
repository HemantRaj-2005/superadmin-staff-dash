// components/RoleManagement/RoleForm.js
import React, { useState, useEffect } from 'react';

const RoleForm = ({ role, permissionStructure, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive
      });
    }
  }, [role]);

  const handlePermissionChange = (resourceId, actionId, checked) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions];
      const resourceIndex = newPermissions.findIndex(p => p.resource === resourceId);
      
      if (checked) {
        if (resourceIndex === -1) {
          // Add new resource with action
          newPermissions.push({
            resource: resourceId,
            actions: [actionId]
          });
        } else {
          // Add action to existing resource
          const resource = newPermissions[resourceIndex];
          if (!resource.actions.includes(actionId)) {
            resource.actions.push(actionId);
          }
        }
      } else {
        if (resourceIndex !== -1) {
          // Remove action from resource
          const resource = newPermissions[resourceIndex];
          resource.actions = resource.actions.filter(a => a !== actionId);
          
          // Remove resource if no actions left
          if (resource.actions.length === 0) {
            newPermissions.splice(resourceIndex, 1);
          }
        }
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAll = (resourceId, actions) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.filter(p => p.resource !== resourceId);
      
      if (actions.length > 0) {
        newPermissions.push({
          resource: resourceId,
          actions: actions.map(a => a.id)
        });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const hasPermission = (resourceId, actionId) => {
    const resource = formData.permissions.find(p => p.resource === resourceId);
    return resource && resource.actions.includes(actionId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {role ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Content Moderator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Role</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
              <p className="text-sm text-gray-600 mb-6">
                Select the resources and actions that admins with this role can access.
              </p>

              {permissionStructure ? (
                <div className="space-y-6">
                  {permissionStructure.resources.map(resource => (
                    <div key={resource.id} className="border border-gray-200 rounded-lg bg-white">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                          <p className="text-sm text-gray-500">{resource.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAll(resource.id, resource.actions)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition duration-150"
                        >
                          Select All
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {resource.actions.map(action => (
                            <label key={action.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition duration-150">
                              <input
                                type="checkbox"
                                checked={hasPermission(resource.id, action.id)}
                                onChange={(e) => handlePermissionChange(resource.id, action.id, e.target.checked)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {action.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {action.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading permissions...</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;