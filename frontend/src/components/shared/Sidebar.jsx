


// components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ModeToggle } from '../mode-toggle';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();

  // Support both role formats
  const isSuperAdmin = Boolean(admin) && 
    (admin?.role?.name === 'Super Admin' || admin?.role === 'super_admin');

  // Safe permission check using the checkPermission function from AuthContext
  const can = (resource, action) => {
    if (isSuperAdmin) return true;
    return checkPermission ? checkPermission(resource, action) : false;
  };

  // Base navigation with permission metadata
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: '🏠', 
      permission: null 
    },
    { 
      name: 'User Management', 
      href: '/users', 
      icon: '👥', 
      permission: { resource: 'users', action: 'view' } 
    },
    { 
      name: 'Post Management', 
      href: '/posts', 
      icon: '📝', 
      permission: { resource: 'posts', action: 'view' } 
    },
    { 
      name: 'Event Management', 
      href: '/events', 
      icon: '📅', 
      permission: { resource: 'events', action: 'view' } 
    },

     { 
    name: 'School Management', 
    href: '/schools', 
    icon: '🏫',
    requiredPermission: { resource: 'schools', action: 'view' }
  },

   { 
    name: 'EducationPrograms', 
    href: '/educationprograms', 
    icon: '🏫',
    requiredPermission: { resource: 'educationProgram', action: 'view' }
  },

  
   { 
    name: 'WorldCity', 
    href: '/worldcity', 
    icon: '🏙️',
    requiredPermission: { resource: 'worldCity', action: 'view' }
  },
  ];

  // Admin-only sections for super admin
  if (isSuperAdmin) {
    navigation.push(
      { 
        name: 'Admin Management', 
        href: '/admins', 
        icon: '👨‍💼', 
        permission: null,
        superAdminOnly: true 
      },
      { 
        name: 'Role Management', 
        href: '/roles', 
        icon: '🔐', 
        permission: null,
        superAdminOnly: true 
      }
    );
  }

  // Activity Logs - available to super admins and anyone with view permission
  if (isSuperAdmin || can('activity_logs', 'view')) {
    navigation.push({ 
      name: 'Activity Logs', 
      href: '/activity-logs', 
      icon: '📊', 
      permission: null 
    });
  }

  // Filter out items the current admin doesn't have permission to view
  const visibleNavigation = navigation.filter((item) => {
    if (!item.permission) return true; // No permission required
    
    const { resource, action } = item.permission;
    return can(resource, action);
  });

  // Debug info for development
  const getRoleName = () => {
    if (admin?.role?.name) return admin.role.name;
    if (admin?.role === 'super_admin') return 'Super Admin';
    if (admin?.role === 'admin') return 'Admin';
    return admin?.role || 'Unknown';
  };

  // Get initials for avatar
  const getInitials = () => {
    return admin?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'A';
  };

  return (
    <div className="w-64 bg-background border-r flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A
          </div>
          <span className="text-xl font-bold">Alumns</span>
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mx-4 mt-4 bg-warning/20 border-warning/30">
          <CardContent className="p-2">
            <p className="text-xs text-warning-foreground text-center">
              Role: {getRoleName()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start h-10 px-3"
              >
                <Link to={item.href}>
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.superAdminOnly && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-purple-500 hover:bg-purple-600 text-white text-xs"
                    >
                      SA
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>

        <Separator className="my-4" />
        
        <div className="px-3">
          <ModeToggle />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {getRoleName()}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {admin?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 