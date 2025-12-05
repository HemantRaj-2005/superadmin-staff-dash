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
  "group flex items-center gap-3 w-full text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-200 ease-out hover:bg-accent hover:text-foreground hover:shadow-sm relative";
const NAV_ACTIVE_CLASS =
  "bg-gradient-to-r from-primary/10 to-primary/5 text-primary dark:from-primary/20 dark:to-primary/10 border-l-4 border-primary dark:border-primary/50 shadow-sm font-semibold";

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
        name: "Alumns Management",
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
        permission: { resource: "educational-programs", action: "view" },
      },
      {
        name: "World City",
        href: "/worldcity",
        icon: MapPin,
        permission: { resource: "cities", action: "view" },
      },
      {
        name: "Organisations",
        href: "/organisations",
        icon: Building,
        permission: { resource: "organisation", action: "view" },
      },
      // {
      //   name: "Institute Management",
      //   href: "/institutes",
      //   icon: Building, // Using the Building icon as it fits
      //   permission: { resource: "institute", action: "view" },
      // },
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
      // Close mobile drawer when resizing to desktop
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Close mobile drawer when route changes
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
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

  const toggleMobileSidebar = () => {
    setIsMobileOpen((s) => !s);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden
        />
      )}

      {/* Mobile Trigger Button - Only show on mobile, positioned on right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed right-4 top-4 h-12 w-12 z-50 bg-transparent hover:bg-transparent shadow-none"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-6 w-6 text-foreground" />
      </Button>

      {/* Navigation Sidebar */}
      {/* Desktop: Always visible on left, Mobile: Drawer from right */}
      <aside
        className={`
          fixed inset-y-0 z-40 bg-gradient-to-b from-background via-background to-muted/20 border-r border-border/50 shadow-2xl flex flex-col 
          transition-transform duration-300 ease-in-out w-72 lg:w-80 h-full
          lg:translate-x-0 lg:static lg:z-auto
          lg:left-0
          ${isMobileOpen ? "translate-x-0 right-0" : "translate-x-full right-0"}
        `}
        aria-label="Primary navigation"
      >
        {/* Header Removed */}

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full px-3 py-4">
            {/* Search Bar */}
            <div className="p-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background/50 backdrop-blur-sm rounded-xl text-sm border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
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
                    onClick={closeMobileSidebar}
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm group-hover:shadow-md">
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
          </ScrollArea>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border/50 bg-gradient-to-b from-background to-muted/10 shrink-0">
          <div className="flex items-center gap-3 group p-3 rounded-xl hover:bg-accent/50 transition-colors">
            <Avatar className="h-11 w-11 flex-shrink-0 shadow-lg ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
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

            {/* ModeToggle */}
            <div className="flex-shrink-0">
              <ModeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);