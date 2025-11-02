// components/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ModeToggle } from '../mode-toggle';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  Home,
  Users,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  MapPin,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Support both role formats
  const isSuperAdmin = Boolean(admin) && 
    (admin?.role?.name === 'Super Admin' || admin?.role === 'super_admin');

  // Safe permission check using the checkPermission function from AuthContext
  const can = (resource, action) => {
    if (isSuperAdmin) return true;
    return checkPermission ? checkPermission(resource, action) : false;
  };

  // Icon mapping for consistent icons
  const iconMap = {
    '🏠': <Home className="h-4 w-4" />,
    '👥': <Users className="h-4 w-4" />,
    '📝': <FileText className="h-4 w-4" />,
    '📅': <Calendar className="h-4 w-4" />,
    '🏫': <Building className="h-4 w-4" />,
    '🏙️': <MapPin className="h-4 w-4" />,
    '📊': <Activity className="h-4 w-4" />,
    '👨‍💼': <Shield className="h-4 w-4" />,
    '🔐': <Settings className="h-4 w-4" />,
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
      permission: { resource: 'schools', action: 'view' }
    },
    { 
      name: 'Education Programs', 
      href: '/educationprograms', 
      icon: '🏫',
      permission: { resource: 'educationProgram', action: 'view' }
    },
    { 
      name: 'World City', 
      href: '/worldcity', 
      icon: '🏙️',
      permission: { resource: 'worldCity', action: 'view' }
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-background border-r flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
      `}>
        {/* Header */}
        <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              A
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold">Alumns</span>
            )}
          </div>
          
          {/* Toggle button - hidden when collapsed */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Debug info - remove in production */}
        {!isCollapsed && process.env.NODE_ENV === 'development' && (
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
              const IconComponent = iconMap[item.icon];
              
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={`
                    w-full justify-start h-10
                    ${isCollapsed ? 'px-3' : 'px-3'}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Link to={item.href}>
                    <span className={isCollapsed ? '' : 'mr-3'}>
                      {IconComponent}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.superAdminOnly && (
                          <Badge 
                            variant="secondary" 
                            className="ml-2 bg-purple-500 hover:bg-purple-600 text-white text-xs"
                          >
                            SA
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <Separator className="my-4" />
          
          <div className={`px-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <ModeToggle isCollapsed={isCollapsed} />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={`p-4 border-t bg-muted/20 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="space-y-3">
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Mobile toggle button - shown when sidebar is collapsed on mobile */}
      {isCollapsed && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-40 lg:hidden h-10 w-10 shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop toggle button - shown when sidebar is collapsed on desktop */}
      {isCollapsed && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 hidden lg:flex h-8 w-8 shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

export default Sidebar;