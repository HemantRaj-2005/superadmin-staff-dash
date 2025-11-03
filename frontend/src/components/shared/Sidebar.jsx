import React, { useState, useEffect, useMemo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ModeToggle } from "../mode-toggle";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
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
  Activity,
  Search,
  Bell,
  X,
} from "lucide-react";

const NAV_ITEM_CLASS =
  "group flex items-center gap-3 w-full text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-200 ease-out hover:bg-accent hover:text-foreground";
const NAV_ACTIVE_CLASS =
  "bg-primary/10 text-primary dark:bg-primary/20 border-l-2 border-primary dark:border-primary/50";

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSuperAdmin =
    Boolean(admin) &&
    (admin?.role?.name === "Super Admin" || admin?.role === "super_admin");

  const can = useCallback(
    (resource, action) => {
      if (isSuperAdmin) return true;
      return checkPermission ? checkPermission(resource, action) : false;
    },
    [checkPermission, isSuperAdmin]
  );

  const navigation = useMemo(
    () => [
      { name: "Dashboard", href: "/", icon: Home, permission: null },
      {
        name: "User Management",
        href: "/users",
        icon: Users,
        permission: { resource: "users", action: "view" },
      },
      {
        name: "Post Management",
        href: "/posts",
        icon: FileText,
        permission: { resource: "posts", action: "view" },
      },
      {
        name: "Event Management",
        href: "/events",
        icon: Calendar,
        permission: { resource: "events", action: "view" },
      },
      {
        name: "School Management",
        href: "/schools",
        icon: Building,
        permission: { resource: "schools", action: "view" },
      },
      {
        name: "Education Programs",
        href: "/educationprograms",
        icon: GraduationCap,
        permission: { resource: "educationProgram", action: "view" },
      },
      {
        name: "World City",
        href: "/worldcity",
        icon: MapPin,
        permission: { resource: "worldCity", action: "view" },
      },
      {
        name: "Organisations",
        href: "/organisations",
        icon: Building,
        permission: { resource: "organisation", action: "view" },
      },
    ],
    []
  );

  const extraAdminItems = useMemo(
    () => [
      {
        name: "Admin Management",
        href: "/admins",
        icon: Shield,
        permission: null,
        superAdminOnly: true,
      },
      {
        name: "Role Management",
        href: "/roles",
        icon: Settings,
        permission: null,
        superAdminOnly: true,
      },
    ],
    []
  );

  const allNavigation = useMemo(() => {
    const base = [...navigation];
    if (isSuperAdmin) base.push(...extraAdminItems);
    if (isSuperAdmin || can("activity_logs", "view")) {
      base.push({
        name: "Activity Logs",
        href: "/activity-logs",
        icon: Activity,
        permission: null,
      });
    }
    return base;
  }, [navigation, extraAdminItems, isSuperAdmin, can]);

  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim())
      return allNavigation.filter((item) => {
        if (!item.permission) return true;
        const { resource, action } = item.permission;
        return can(resource, action);
      });

    return allNavigation.filter((item) => {
      if (!item.permission)
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const { resource, action } = item.permission;
      return (
        can(resource, action) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [allNavigation, can, searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const getRoleName = () => {
    if (admin?.role?.name) return admin.role.name;
    if (admin?.role === "super_admin") return "Super Admin";
    if (admin?.role === "admin") return "Admin";
    return admin?.role || "Unknown";
  };

  const getInitials = () => {
    if (!admin?.name) return "A";
    return admin.name
      .split(" ")
      .map((p) => p[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const toggleSidebar = () => {
    setIsOpen((s) => !s);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      {/* Fixed Trigger Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          left: "16px",
          top: "16px",
          zIndex: 50,
        }}
        className="h-12 w-12 shadow-lg rounded-full"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-background border-r shadow-2xl flex flex-col transition-transform duration-300 ease-in-out w-72 lg:w-80 h-full ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Primary navigation"
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-transparent flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-md">
              A
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Alumns
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full px-3 py-4">
            {/* Dev Role Indicator */}
            {process.env.NODE_ENV === "development" && (
              <Card className="mx-4 mt-3 bg-warning/10 border-warning/20 shadow-sm mb-3">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-warning-foreground text-center">
                    Role: {getRoleName()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Search Bar */}
            <div className="p-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-lg text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 mb-6" role="navigation" aria-label="Main">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `${NAV_ITEM_CLASS} ${
                        isActive ? NAV_ACTIVE_CLASS : "text-muted-foreground"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-accent/50 transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.superAdminOnly && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 text-xs"
                      >
                        SA
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Quick Actions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={closeSidebar}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={closeSidebar}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Mode Toggle */}
           
              <ModeToggle />


            {/* Filler content to test scrolling */}
            {/* <div className="space-y-4 mb-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="p-2 bg-muted/20 rounded text-xs">
                  Test content {i + 1} to enable scrolling
                </div>
              ))}
            </div> */}
          </ScrollArea>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t bg-linear-to-b from-muted/20 to-transparent shrink-0">
          <div className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10 flex-shrink-0 shadow-md">
              <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleName()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
