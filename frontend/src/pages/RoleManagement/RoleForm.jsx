// components/RoleManagement/RoleForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Plus,
  Shield,
  Loader2,
  CheckSquare
} from 'lucide-react';

const RoleForm = ({ role, permissionStructure, onSave, onClose, open = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive
      });
    }
  }, [role]);

  const handlePermissionChange = (resourceId, actionId, checked) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions];
      const resourceIndex = newPermissions.findIndex(p => p.resource === resourceId);
      
      if (checked) {
        if (resourceIndex === -1) {
          // Add new resource with action
          newPermissions.push({
            resource: resourceId,
            actions: [actionId]
          });
        } else {
          // Add action to existing resource
          const resource = newPermissions[resourceIndex];
          if (!resource.actions.includes(actionId)) {
            resource.actions.push(actionId);
          }
        }
      } else {
        if (resourceIndex !== -1) {
          // Remove action from resource
          const resource = newPermissions[resourceIndex];
          resource.actions = resource.actions.filter(a => a !== actionId);
          
          // Remove resource if no actions left
          if (resource.actions.length === 0) {
            newPermissions.splice(resourceIndex, 1);
          }
        }
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAll = (resourceId, actions) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.filter(p => p.resource !== resourceId);
      
      if (actions.length > 0) {
        newPermissions.push({
          resource: resourceId,
          actions: actions.map(a => a.id)
        });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleDeselectAll = (resourceId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => p.resource !== resourceId)
    }));
  };

  const hasPermission = (resourceId, actionId) => {
    const resource = formData.permissions.find(p => p.resource === resourceId);
    return resource && resource.actions.includes(actionId);
  };

  const getSelectedActionsCount = (resourceId) => {
    const resource = formData.permissions.find(p => p.resource === resourceId);
    return resource ? resource.actions.length : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const totalPermissions = formData.permissions.reduce((total, perm) => total + perm.actions.length, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {role ? 'Edit Role' : 'Create New Role'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {role ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[calc(90vh-180px)] px-6">
            <div className="space-y-6 pb-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Define the role name and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Content Moderator"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      placeholder="Describe the role's responsibilities and access level..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Role Status</Label>
                      <div className="text-sm text-muted-foreground">
                        {formData.isActive ? 'Active role can be assigned to admins' : 'Inactive role cannot be assigned'}
                      </div>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Permissions</CardTitle>
                      <CardDescription>
                        Select the resources and actions that admins with this role can access
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {totalPermissions} permission{totalPermissions !== 1 ? 's' : ''} selected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {permissionStructure ? (
                    <div className="space-y-4">
                      {permissionStructure.resources.map(resource => {
                        const selectedCount = getSelectedActionsCount(resource.id);
                        const totalActions = resource.actions.length;
                        const allSelected = selectedCount === totalActions;

                        return (
                          <Card key={resource.id} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-base">{resource.name}</CardTitle>
                                  <CardDescription className="text-sm">
                                    {resource.description}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={allSelected ? "default" : "outline"}>
                                    {selectedCount}/{totalActions} selected
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => allSelected ? 
                                      handleDeselectAll(resource.id) : 
                                      handleSelectAll(resource.id, resource.actions)
                                    }
                                  >
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {resource.actions.map(action => (
                                  <div
                                    key={action.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                  >
                                    <Checkbox
                                      id={`${resource.id}-${action.id}`}
                                      checked={hasPermission(resource.id, action.id)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(resource.id, action.id, checked)
                                      }
                                    />
                                    <div className="space-y-1 flex-1">
                                      <Label
                                        htmlFor={`${resource.id}-${action.id}`}
                                        className="text-sm font-medium leading-none cursor-pointer"
                                      >
                                        {action.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {action.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading permissions...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;