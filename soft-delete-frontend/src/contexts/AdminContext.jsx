// contexts/AdminContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminInfo');
      
      if (token && adminData) {
        // Verify token with backend
        const response = await api.get('/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.valid) {
          setIsAuthenticated(true);
          setAdminInfo(JSON.parse(adminData));
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, admin } = response.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminInfo', JSON.stringify(admin));
      
      setIsAuthenticated(true);
      setAdminInfo(admin);
      
      // Update last login
      await api.put('/update-last-login', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
    localStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    setAdminInfo(null);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const value = {
    isAuthenticated,
    adminInfo,
    loading,
    stats,
    login,
    logout,
    refreshStats: fetchStats
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};