// components/AdminManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminList from './AdminList';
import AdminForm from './AdminForm';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, UserPlus, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { admin: currentAdmin } = useAuth();

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admins');
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setIsFormOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsFormOpen(true);
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      if (selectedAdmin) {
        // Update existing admin
        await api.put(`/admins/${selectedAdmin._id}`, adminData);
      } else {
        // Create new admin
        await api.post('/admins', adminData);
      }
      
      setIsFormOpen(false);
      setSelectedAdmin(null);
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error saving admin:', error);
      throw error;
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(`/admins/${adminId}`);
        fetchAdmins(); // Refresh the list
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert(error.response?.data?.message || 'Error deleting admin');
      }
    }
  };

  const handleResetPassword = async (adminId, newPassword) => {
    try {
      await api.post(`/admins/${adminId}/reset-password`, {
        newPassword
      });
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  if (currentAdmin?.role?.name !== 'Super Admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 dark:text-red-300">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            Only super admins can manage other admins.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Admin Management
              </CardTitle>
              <CardDescription className="text-base">
                Manage admin accounts and their roles
              </CardDescription>
            </div>
            <Button 
              onClick={handleCreateAdmin}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add New Admin
            </Button>
          </div>
        </CardHeader>
        
        <Separator className="mb-6" />
        
        <CardContent className="p-0">
          {/* Admin List */}
          <div className="px-6 pb-6">
            <AdminList
              admins={admins}
              loading={loading}
              currentAdminId={currentAdmin._id}
              onEditAdmin={handleEditAdmin}
              onDeleteAdmin={handleDeleteAdmin}
              onResetPassword={handleResetPassword}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Form Modal */}
      {isFormOpen && (
        <AdminForm
          admin={selectedAdmin}
          roles={roles}
          onSave={handleSaveAdmin}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminManagement;