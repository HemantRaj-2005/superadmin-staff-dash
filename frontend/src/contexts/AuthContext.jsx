



// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        if (response.data) {
          setAdmin(response.data);
          setIsAuthenticated(true);
          buildPermissionsMap(response.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const buildPermissionsMap = (adminData) => {
    const permMap = {};
    
    // Super Admin has all permissions
    if (adminData.role?.name === 'Super Admin') {
      // Define all possible resources and actions for super admin
      const allResources = ['users', 'posts', 'events', 'activity_logs', 'settings', 'roles'];
      const allActions = ['view', 'create', 'edit', 'delete', 'export', 'manage'];
      
      allResources.forEach(resource => {
        permMap[resource] = allActions;
      });
    } else if (adminData.role?.permissions) {
      // Regular admin with specific permissions
      adminData.role.permissions.forEach(permission => {
        permMap[permission.resource] = permission.actions;
      });
    }
    
    setPermissions(permMap);
  };

  const checkPermission = (resource, action) => {
    // Super admin has all permissions
    if (admin?.role?.name === 'Super Admin') {
      return true;
    }

    // Check if resource exists in permissions
    if (!permissions[resource]) {
      return false;
    }
    
    // Check if action is allowed for the resource
    return permissions[resource].includes(action);
  };





  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
      
      const { token, admin } = response.data;



     
      
      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin(admin);
      setIsAuthenticated(true);
      buildPermissionsMap(admin);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };




  

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
    setIsAuthenticated(false);
    setPermissions({});
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    checkPermission,
    permissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};