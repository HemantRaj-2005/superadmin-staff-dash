// components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  AppBar, 
  Toolbar,
  Button,
  Box,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import UsersTable from './UsersTable';
import UserDetails from './UserDetails';
import ActivityLog from './ActivityLog';
import Login from './Login';
import Dashboard from './Dashboard';
import Settings from './Settings';
import NotificationPanel from './NotificationPanel';
import { useAdmin } from '../contexts/AdminContext';

const AdminPanel = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { isAuthenticated, adminInfo, logout } = useAdmin();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
  ];

  if (adminInfo?.role === 'super_admin') {
    navigationItems.push(
      { id: 'activities', label: 'Activity Log', icon: <ActivityIcon /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon /> }
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Paper 
        elevation={3} 
        sx={{ 
          width: 280, 
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Admin Panel
          </Typography>
          <Chip 
            label={adminInfo?.role === 'super_admin' ? 'Super Admin' : 'Admin'} 
            color="primary" 
            size="small" 
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{ flex: 1, p: 2 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              fullWidth
              startIcon={item.icon}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedUser(null);
              }}
              variant={currentView === item.id ? 'contained' : 'text'}
              sx={{ 
                justifyContent: 'flex-start',
                mb: 1,
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Logged in as: {adminInfo?.name}
          </Typography>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={logout}
            variant="outlined"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="static" 
          elevation={1}
          sx={{ backgroundColor: 'white', color: 'text.primary' }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {navigationItems.find(item => item.id === currentView)?.label || 'Admin Panel'}
            </Typography>
            
            <Button
              startIcon={<NotificationsIcon />}
              onClick={() => setNotificationsOpen(true)}
              sx={{ mr: 2 }}
            >
              Notifications
            </Button>
            
            <Chip 
              label={adminInfo?.name} 
              variant="outlined" 
              color="primary" 
            />
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'users' && !selectedUser && (
            <UsersTable onUserSelect={setSelectedUser} />
          )}
          {currentView === 'users' && selectedUser && (
            <UserDetails user={selectedUser} onBack={() => setSelectedUser(null)} />
          )}
          {currentView === 'activities' && <ActivityLog />}
          {currentView === 'settings' && <Settings />}
        </Box>
      </Box>

      <NotificationPanel 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </Box>
  );
};

export default AdminPanel;