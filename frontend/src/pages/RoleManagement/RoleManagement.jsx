// components/RoleManagement/RoleManagement.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import RoleList from "./RoleList";
import RoleForm from "./RoleForm";
import PermissionMatrix from "./PermissionMatrix";
import api from "../../services/api";

// ShadCN Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionStructure, setPermissionStructure] = useState(null);
  const { admin } = useAuth();

  useEffect(() => {
    fetchRoles();
    fetchPermissionStructure();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionStructure = async () => {
    try {
      const response = await api.get("/roles/permissions/structure");
      setPermissionStructure(response.data);
    } catch (error) {
      console.error("Error fetching permission structure:", error);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    setIsMatrixOpen(true);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (selectedRole) {
        await api.put(`/roles/${selectedRole._id}`, roleData);
      } else {
        await api.post("/roles", roleData);
      }

      setIsFormOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      throw error;
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/roles/${roleId}`);
        fetchRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        alert(error.response?.data?.message || "Error deleting role");
      }
    }
  };

  // Loading State
  if (loading && roles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Access Denied State
  if (admin?.role?.name !== "Super Admin") {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <h4 className="font-semibold">Access Denied</h4>
              <p>Only super admins can manage roles and permissions.</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Role Management
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage admin roles and their permissions across the system
          </p>
        </div>
        <Button onClick={handleCreateRole} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Role
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Roles
                </p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Roles
                </p>
                <p className="text-2xl font-bold">
                  {roles.filter((role) => role.isActive).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  System Roles
                </p>
                <p className="text-2xl font-bold">
                  {roles.filter((role) => role.isSystem).length}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="h-6 bg-purple-100 text-purple-800"
              >
                Core
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Custom Roles
                </p>
                <p className="text-2xl font-bold">
                  {roles.filter((role) => !role.isSystem).length}
                </p>
              </div>
              <Badge variant="outline" className="h-6">
                Custom
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role List */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Roles</CardTitle>
          <CardDescription>
            Manage and configure role permissions. System roles cannot be
            deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleList
            roles={roles}
            loading={loading}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onViewPermissions={handleViewPermissions}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {!loading && roles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roles created yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first admin role with custom
              permissions.
            </p>
            <Button onClick={handleCreateRole} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Role
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Role Form Dialog */}
      {isFormOpen && (
        <RoleForm
          role={selectedRole}
          permissionStructure={permissionStructure}
          onSave={handleSaveRole}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedRole(null);
          }}
        />
      )}

      {/* Permission Matrix Dialog */}
      {isMatrixOpen && selectedRole && (
        <PermissionMatrix
          role={selectedRole}
          permissionStructure={permissionStructure}
          onClose={() => {
            setIsMatrixOpen(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default RoleManagement;
