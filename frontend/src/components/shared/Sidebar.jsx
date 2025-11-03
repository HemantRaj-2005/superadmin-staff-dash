import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

const NAV_ITEM_CLASS =
  'flex items-center gap-3 w-full text-sm font-medium py-2 px-3 rounded-md transition-colors';
const NAV_ACTIVE_CLASS = 'bg-primary/10 text-primary dark:bg-primary/20';

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSuperAdmin = Boolean(admin) && (admin?.role?.name === 'Super Admin' || admin?.role === 'super_admin');

  const can = useCallback(
    (resource, action) => {
      if (isSuperAdmin) return true;
      return checkPermission ? checkPermission(resource, action) : false;
    },
    [checkPermission, isSuperAdmin]
  );

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/', icon: Home, permission: null },
    { name: 'User Management', href: '/users', icon: Users, permission: { resource: 'users', action: 'view' } },
    { name: 'Post Management', href: '/posts', icon: FileText, permission: { resource: 'posts', action: 'view' } },
    { name: 'Event Management', href: '/events', icon: Calendar, permission: { resource: 'events', action: 'view' } },
    { name: 'School Management', href: '/schools', icon: Building, permission: { resource: 'schools', action: 'view' } },
    { name: 'Education Programs', href: '/educationprograms', icon: GraduationCap, permission: { resource: 'educationProgram', action: 'view' } },
    { name: 'World City', href: '/worldcity', icon: MapPin, permission: { resource: 'worldCity', action: 'view' } },
    { name: 'Organisations', href: '/organisations', icon: Building, permission: { resource: 'organisation', action: 'view' } },
  ], []);

  const extraAdminItems = useMemo(() => [
    { name: 'Admin Management', href: '/admins', icon: Shield, permission: null, superAdminOnly: true },
    { name: 'Role Management', href: '/roles', icon: Settings, permission: null, superAdminOnly: true },
  ], []);

  const allNavigation = useMemo(() => {
    const base = [...navigation];
    if (isSuperAdmin) base.push(...extraAdminItems);
    if (isSuperAdmin || can('activity_logs', 'view')) {
      base.push({ name: 'Activity Logs', href: '/activity-logs', icon: Activity, permission: null });
    }
    return base;
  }, [navigation, extraAdminItems, isSuperAdmin, can]);

  const visibleNavigation = useMemo(() => {
    return allNavigation.filter((item) => {
      if (!item.permission) return true;
      const { resource, action } = item.permission;
      return can(resource, action);
    });
  }, [allNavigation, can]);

  useEffect(() => {
    const handleResize = () => {
      // auto-collapse on small screens
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // on route change, if on mobile keep sidebar collapsed to avoid blocking content
    if (window.innerWidth < 1024) setIsCollapsed(true);
  }, [location.pathname]);

  const getRoleName = () => {
    if (admin?.role?.name) return admin.role.name;
    if (admin?.role === 'super_admin') return 'Super Admin';
    if (admin?.role === 'admin') return 'Admin';
    return admin?.role || 'Unknown';
  };

  const getInitials = () => {
    if (!admin?.name) return 'A';
    return admin.name
      .split(' ')
      .map((p) => p[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const toggleSidebar = (e) => {
    if (e && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
    }
    setIsCollapsed((s) => !s);
  };

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-background border-r flex flex-col transition-transform duration-300 ease-in-out ${
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
        aria-label="Primary navigation"
      >
        <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : 'w-full'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              A
            </div>
            {!isCollapsed && <span className="text-xl font-bold">Alumns</span>}
          </div>

          {!isCollapsed ? (
            <button
              onClick={toggleSidebar}
              onKeyDown={toggleSidebar}
              aria-expanded={!isCollapsed}
              aria-label="Collapse sidebar"
              className="p-1 rounded-md hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {process.env.NODE_ENV === 'development' && !isCollapsed && (
          <Card className="mx-4 mt-4 bg-warning/20 border-warning/30">
            <CardContent className="p-2">
              <p className="text-xs text-warning-foreground text-center">Role: {getRoleName()}</p>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1" role="navigation" aria-label="Main">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `${NAV_ITEM_CLASS} ${isActive ? NAV_ACTIVE_CLASS : 'text-muted-foreground hover:text-foreground'}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="flex items-center">
                    <Icon className="h-4 w-4" />
                  </span>

                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.superAdminOnly && (
                        <Badge variant="secondary" className="ml-2 bg-purple-500 hover:bg-purple-600 text-white text-xs">SA</Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className={`px-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <ModeToggle isCollapsed={isCollapsed} />
          </div>
        </ScrollArea>

        <div className={`p-4 border-t bg-muted/20 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="space-y-3">
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{getInitials()}</AvatarFallback>
              </Avatar>

              <button
                aria-label="Open sidebar"
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{getRoleName()}</p>
                <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile toggle button - shown when sidebar is collapsed on mobile */}
        {isCollapsed && (
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleSidebar}
            className="fixed bottom-4 left-4 z-40 lg:hidden h-10 w-10 shadow-lg"
            aria-label="Open menu"
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
            aria-label="Open menu"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
