// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/Home/Dashboard';
import UserManagement from './pages/Users/UserManagement';
import ActivityLogs from './pages/Activity/ActivityLogs';
import Layout from './pages/Layout';
import PostManagement from './pages/Posts/PostManagement';
import EventManagement from './pages/Events/EventManagement';
import { useNavigationTracking } from './pages/Hooks/NavigationTracking';
import PermissionRoute from './pages/RoleManagement/PermissionRoutes';
import AdminManagement from './pages/RoleManagement/AdminManagement';
import RoleManagement from './pages/RoleManagement/RoleManagement';
import SchoolManagement from './pages/School/SchoolManagement';
import EducationalProgramManagement from './pages/EducationPrograms/EducationalProgramManagement';
import CityManagement from './pages/City/CityManagement';
import OrganisationManagement from './pages/Organisation/OrganisationManagement';
import InstituteManagement from './pages/Institute/InstituteManagement';

// Component that wraps protected routes with navigation tracking + layout
function ProtectedLayout({ children }) {
  // useNavigationTracking();
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

// New SuperAdminRoute component
function SuperAdminRoute({ children }) {
  const { isAuthenticated, admin, loading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is super admin
  if (admin?.role?.name !== 'Super Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only super admins can access this section.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your role: {admin?.role?.name || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Dashboard (protected) */}
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

        {/* Permissioned routes — require auth (ProtectedRoute) + permission (PermissionRoute) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <PermissionRoute resource="users" action="view">
                <ProtectedLayout>
                  <UserManagement />
                </ProtectedLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PermissionRoute resource="posts" action="view">
                <ProtectedLayout>
                  <PostManagement />
                </ProtectedLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <PermissionRoute resource="events" action="view">
                <ProtectedLayout>
                  <EventManagement />
                </ProtectedLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute>
              <PermissionRoute resource="activity_logs" action="view">
                <ProtectedLayout>
                  <ActivityLogs />
                </ProtectedLayout>
              </PermissionRoute>
            </ProtectedRoute>
          }
        />

        {/* Super Admin only routes - now properly protected */}
        <Route
          path="/admins"
          element={
            <SuperAdminRoute>
              <ProtectedLayout>
                <AdminManagement />
              </ProtectedLayout>
            </SuperAdminRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <SuperAdminRoute>
              <ProtectedLayout>
                <RoleManagement />
              </ProtectedLayout>
            </SuperAdminRoute>
          }
        />

        <Route path="/schools" element={
          <PermissionRoute resource="schools" action="view">
            <Layout>
              <SchoolManagement />
            </Layout>
          </PermissionRoute>
        } />


         <Route path="/worldcity" element={
          <PermissionRoute resource="cities" action="view">
            <Layout>
              <CityManagement />
            </Layout>
          </PermissionRoute>
        } />



  <Route path="/organisations" element={
          <PermissionRoute resource="organisations" action="view">
            <Layout>
              <OrganisationManagement />
            </Layout>
          </PermissionRoute>
        } />

         <Route path="/institutes" element={
          <PermissionRoute resource="institutes" action="view">
            <Layout>
              <InstituteManagement />
            </Layout>
          </PermissionRoute>
        } />

        <Route path="/educationprograms" element={
          <PermissionRoute resource="educational-programs" action="view">
            <Layout>
              <EducationalProgramManagement />
            </Layout>
          </PermissionRoute>
        } />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
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