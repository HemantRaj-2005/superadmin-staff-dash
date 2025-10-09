// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Dashboard from './components/Home/Dashboard';
import UserManagement from './components/Users/UserManagement';
import ActivityLogs from './components/Activity/ActivityLogs';
import Layout from './components/Layout';
import PostManagement from './components/Posts/PostManagement';
import EventManagement from './components/Events/EventManagement';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from './services/api';

let lastPathname = '';

export const useNavigationTracking = () => {
  const location = useLocation();
  const { admin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && admin && lastPathname !== location.pathname) {
      const fromPage = lastPathname || 'Login';
      const toPage = location.pathname;
      
      // Track navigation
      api.post('/api/admin/activity-logs/navigation', {
        fromPage,
        toPage
      }).catch(console.error);
      
      lastPathname = location.pathname;
    }
  }, [location.pathname, isAuthenticated, admin]);
};


function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}




function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/activity-logs" element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLogs />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/posts" element={
              <ProtectedRoute>
                <Layout>
                  <PostManagement />
                </Layout>
              </ProtectedRoute>
            } />


            <Route path="/events" element={
              <ProtectedRoute>
                <Layout>
                  <EventManagement />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;