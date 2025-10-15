// components/PermissionMatrix.js
import React from 'react';

const PermissionMatrix = ({ role, permissionStructure, onClose }) => {
  if (!permissionStructure || !role) {
    return null;
  }

  const getActionStatus = (resourceId, actionId) => {
    const resourcePermission = role.permissions.find(p => p.resource === resourceId);
    return resourcePermission && resourcePermission.actions.includes(actionId);
  };

  const getResourcePermissionSummary = (resourceId) => {
    const resourcePermission = role.permissions.find(p => p.resource === resourceId);
    if (!resourcePermission) return 'No access';
    
    const actionCount = resourcePermission.actions.length;
    const totalActions = permissionStructure.resources
      .find(r => r.id === resourceId)?.actions.length || 0;
    
    if (actionCount === totalActions) return 'Full access';
    if (actionCount === 1 && resourcePermission.actions[0] === 'view') return 'View only';
    
    return `${actionCount} of ${totalActions} actions`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Full access': return 'bg-green-100 text-green-800';
      case 'View only': return 'bg-blue-100 text-blue-800';
      case 'No access': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Permission Matrix - {role.name}
              </h2>
              <p className="text-gray-600">
                Detailed view of all permissions assigned to this role
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          {/* Permission Matrix */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-4 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Resource & Description
                </div>
                <div className="col-span-8 grid grid-cols-6 gap-0">
                  {permissionStructure.resources[0]?.actions.map(action => (
                    <div
                      key={action.id}
                      className="px-4 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
                    >
                      <div className="text-xs">{action.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {permissionStructure.resources.map(resource => (
                <div key={resource.id} className="hover:bg-gray-50 transition duration-150">
                  <div className="grid grid-cols-12 gap-0">
                    {/* Resource Info */}
                    <div className="col-span-4 px-6 py-4 border-r border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {resource.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {resource.description}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getResourcePermissionSummary(resource.id))}`}>
                              {getResourcePermissionSummary(resource.id)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Checkboxes */}
                    <div className="col-span-8 grid grid-cols-6 gap-0">
                      {resource.actions.map((action, actionIndex) => {
                        const hasPermission = getActionStatus(resource.id, action.id);
                        return (
                          <div
                            key={action.id}
                            className={`flex items-center justify-center p-4 border-l border-gray-200 ${
                              actionIndex === 0 ? 'border-l-0' : ''
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${
                                  hasPermission
                                    ? 'bg-green-100 border-2 border-green-500'
                                    : 'bg-gray-100 border-2 border-gray-300'
                                }`}
                              >
                                {hasPermission ? (
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </div>
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    hasPermission
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {action.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Permission Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Allowed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Not Allowed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Full Access</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">View Only</span>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {role.permissions.length}
              </div>
              <div className="text-sm text-gray-500">Resources</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {role.permissions.reduce((total, perm) => total + perm.actions.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Actions</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {permissionStructure.resources.length}
              </div>
              <div className="text-sm text-gray-500">Available Resources</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {role.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>

          {/* Actions */}
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

export default PermissionMatrix;