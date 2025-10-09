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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Get token from localStorage (survives refresh)
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminData');
      
      if (token && savedAdmin) {
        // 2. Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // 3. Verify token is still valid with backend
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        
        if (response.data) {
          // 4. Update state with saved admin data
          setAdmin(JSON.parse(savedAdmin));
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, clear storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      const { token, admin } = response.data;
      
      // 1. Save to localStorage (survives refresh)
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));
      
      // 2. Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 3. Update state
      setAdmin(admin);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    // 1. Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // 2. Remove axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // 3. Reset state
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};