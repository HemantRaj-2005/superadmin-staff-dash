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
import { useNavigationTracking } from './components/Hooks/NavigationTracking';

// Component that wraps protected routes with navigation tracking + layout
function ProtectedLayout({ children }) {
  useNavigationTracking(); 
  return <Layout>{children}</Layout>;
}

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

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected pages: wrap with ProtectedRoute and ProtectedLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <UserManagement />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ActivityLogs />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <PostManagement />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EventManagement />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
