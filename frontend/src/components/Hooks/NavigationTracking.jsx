// hooks/useNavigationTracking.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

let lastPathname = '';

export const useNavigationTracking = () => {
  const location = useLocation();
  const { admin, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only track if admin is authenticated and pathname changed
    if (isAuthenticated && admin && lastPathname !== location.pathname) {
      const fromPage = lastPathname || 'Login';
      const toPage = location.pathname;
      
      // Don't track if navigating to same page
      if (fromPage !== toPage) {
        // Track navigation asynchronously
        api.post('/activity-logs/navigation', {
          fromPage,
          toPage
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }).catch(error => {
          console.error('Failed to log navigation:', error);
        });
        
        lastPathname = location.pathname;
      }
    }
  }, [location.pathname, isAuthenticated, admin]);
};

// Helper function to get page name from path
export const getPageName = (path) => {
  const pageNames = {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/posts': 'Post Management',
    '/events': 'Event Management',
    '/activity-logs': 'Activity Logs',
    '/login': 'Login'
  };
  return pageNames[path] || path;
};