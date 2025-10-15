// components/RoleManagement/PermissionRoutes.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PermissionRoute = ({ children, resource, action }) => {
  const { isAuthenticated, checkPermission, admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Super Admin has all permissions - FIXED LOGIC
  if (admin?.role?.name === 'Super Admin') {
    return children;
  }

  // Check specific permission for non-super admins
  if (resource && action && !checkPermission(resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required permission: <strong>{action} {resource}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your role: {admin?.role?.name || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PermissionRoute;