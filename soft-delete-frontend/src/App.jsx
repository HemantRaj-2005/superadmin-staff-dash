// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ActivityLogs from './components/ActivityLogs';
import Layout from './components/Layout';
import PostManagement from './components/PostManagement';
import EventManagement from './components/EventManagement';


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
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