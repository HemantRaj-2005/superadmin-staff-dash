import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  AlertCircle,
  Trash2,
  ChevronUp,
  FileUp,
  Filter,
  X,
  UserCheck,
  Globe,
} from "lucide-react";
import UserTable from "./UserTable";
import UserDetailModal from "./UserDetailModal";
import DeletedUsersModal from "./DeletedUsersModal";
import api from "../../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserManagement = () => {
  // --- State Management ---
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedUsersModalOpen, setIsDeletedUsersModalOpen] = useState(false);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Toggles the filter panel
  
  const [filters, setFilters] = useState({
    institute: "",
    university: "",
    qualification: "",
    specialization: "",
    batch: "",
    city: ""
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'deleted'
  const [cleanupStats, setCleanupStats] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0); // You might want to fetch this from your backend

  // --- Effects ---

  // 1. Debounce Search & Filters (Wait 500ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedFilters(filters);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  // 2. Main Data Fetch Effect
  // Triggers when page, tab, search term, or filters change
  useEffect(() => {
    fetchUsers();
    if (activeTab === "active") {
      fetchCleanupStats();
      // You might want to fetch online users count here
      // fetchOnlineUsersCount();
    }
    // eslint-disable-next-line
  }, [pagination.page, debouncedSearchTerm, activeTab, debouncedFilters]);

  // --- API Calls ---

  const logSearchActivity = async (searchQuery, resultsCount = 0) => {
    // 1. Identify active filters (remove empty keys)
    const activeFilters = Object.entries(debouncedFilters)
      .filter(([_, value]) => value && String(value).trim() !== "");

    const hasFilters = activeFilters.length > 0;
    const hasSearch = searchQuery && searchQuery.trim() !== "";

    // If no search term AND no filters, do not log (avoids logging on initial page load)
    if (!hasSearch && !hasFilters) return;

    // 2. Build a readable description
    let descriptionParts = [];
    
    if (hasSearch) {
      descriptionParts.push(`Query: "${searchQuery}"`);
    }
    
    if (hasFilters) {
      // Create a string like "Institute: IIT, City: Mumbai"
      const filterString = activeFilters
        .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
        .join(", ");
      descriptionParts.push(`Filters: [${filterString}]`);
    }

    const description = `User Search - ${descriptionParts.join(" | ")}`;

    try {
      await api.post("/activity-logs", {
        action: "SEARCH_USERS",
        description: description, // Now contains specific details
        module: "User Management",
        metadata: {
          searchQuery: searchQuery,
          filters: debouncedFilters, // Full filter object
          activeFilters: Object.fromEntries(activeFilters), // Only the active ones
          resultsCount: resultsCount,
          tab: activeTab,
          timestamp: new Date().toISOString(),
          totalUsers: pagination.total,
        },
      });
    } catch (error) {
      console.error("Error logging search activity:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = activeTab === "deleted" ? "/users/deleted" : "/users";
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        includeDeleted: activeTab === "deleted",
        ...debouncedFilters // Spread the filters into the query params
      };

      const response = await api.get(endpoint, { params });

      setUsers(response.data.users);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));

      // Check if we should log activity (Active Search OR Active Filters)
      const hasActiveFilters = Object.values(debouncedFilters).some(v => v && String(v).trim() !== "");
      
      if (debouncedSearchTerm.trim() !== "" || hasActiveFilters) {
        logSearchActivity(debouncedSearchTerm, response.data.users.length);
      }

    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        "Failed to fetch users: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCleanupStats = async () => {
    try {
      const response = await api.get("/users/cleanup/stats");
      setCleanupStats(response.data);
    } catch (error) {
      console.error("Error fetching cleanup stats:", error);
    }
  };

  // --- User Action Handlers ---

  const handleUserClick = async (user) => {
    if (activeTab === "deleted") {
      setSelectedUser(user);
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await api.get(`/users/${user._id}`);
      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to fetch user details");
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      await api.put(`/users/${userId}`, updateData);
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user");
    }
  };

  const handleSoftDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to move this user to trash? They can be restored within 90 days.")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
        fetchCleanupStats();
      } catch (error) {
        setError("Failed to move user to trash: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await api.post(`/users/${userId}/restore`);
      fetchUsers();
      fetchCleanupStats();
      setIsDeletedUsersModalOpen(false);
    } catch (error) {
      setError("Failed to restore user: " + (error.response?.data?.message || error.message));
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/users/${userId}/permanent`);
        fetchUsers();
        fetchCleanupStats();
      } catch (error) {
        setError("Failed to permanently delete user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // --- Search & Filter Handlers ---

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // Debounce effect will handle the API call
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({
      institute: "",
      university: "",
      qualification: "",
      specialization: "",
      batch: "",
      city: ""
    });
    setSearchTerm("");
  };

  const handleSearchSubmit = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setDebouncedSearchTerm(searchTerm);
    setDebouncedFilters(filters);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // --- Export Logic ---

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    
    // Define headers based on the data structure
    const headers = ["_id", "Name", "Email", "Role", "Institute", "University", "City", "Joined Date"];
    let csv = headers.join(",") + "\n";
    
    data.forEach((user) => {
      // Helper to safely get nested values (handling both populated objects and raw IDs)
      const getNestedName = (obj) => {
        if (!obj) return "";
        return typeof obj === 'object' ? (obj.name || obj.CITY_NAME || "") : obj;
      };

      const education = user.education && user.education.length > 0 ? user.education[0] : {};
      const address = user.address || {};
      
      const instituteName = getNestedName(education.institute) || education.otherInstitute || "";
      const universityName = getNestedName(education.university) || education.otherUniversity || "";
      const cityName = getNestedName(address.city) || getNestedName(education.city) || "";

      const rowData = [
        user._id,
        `${user.firstName} ${user.lastName}`,
        user.email,
        typeof user.role === 'object' ? user.role.name : user.role,
        instituteName,
        universityName,
        cityName,
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      ];

      // Escape quotes and join
      const row = rowData.map(val => {
        let strVal = String(val || "");
        if (strVal.includes(",") || strVal.includes('"')) {
          strVal = `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      });
      
      csv += row.join(",") + "\n";
    });
    return csv;
  };

  const handleExportCSV = async (exportType) => {
    setIsExporting(true);
    setError("");

    let usersToExport = [];
    let fileName = "users_export.csv";

    try {
      if (exportType === "page") {
        usersToExport = users;
        fileName = `users_${activeTab}_page_${pagination.page}.csv`;
        if (usersToExport.length === 0) {
          setError(`No users on the current page to export.`);
          setIsExporting(false);
          return;
        }
      } else if (exportType === "all") {
        const endpoint = activeTab === "deleted" ? "/users/deleted" : "/users";
        
        // Pass current search AND filters to the export params
        const params = { 
          search: debouncedSearchTerm, 
          all: true,
          ...debouncedFilters
        };
        
        const response = await api.get(endpoint, { params });

        usersToExport = response.data.users || response.data;
        fileName = `users_${activeTab}_export_all.csv`;
        
        if (!usersToExport || usersToExport.length === 0) {
          setError("No users found to export.");
          setIsExporting(false);
          return;
        }
      }

      const csvData = convertToCSV(usersToExport);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(`Error exporting ${exportType} CSV:`, err);
      setError("Failed to export CSV: " + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  // --- StatCard Component ---
  const StatCard = ({ title, value, icon, bgColor, badge, children }) => (
    <div className={`${bgColor} p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      
      {badge && (
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs font-medium text-white/80">{badge.label}</span>
          <span className="text-sm font-bold text-white">{badge.value}</span>
        </div>
      )}
      
      {children}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Alumns Management</CardTitle>
                <CardDescription>
                  Manage and view all registered Alumns
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="flex items-center"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export"}
                    <ChevronUp className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleExportCSV("page")}
                    disabled={isExporting || users.length === 0}
                    className="cursor-pointer"
                  >
                    Export Current Page ({users.length} users)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportCSV("all")}
                    disabled={isExporting || pagination.total === 0}
                    className="cursor-pointer"
                  >
                    Export All Matches ({pagination.total} users)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="pl-10 h-11"
              />
            </div>
            
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 px-4 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some(x => x) && (
                 <Badge variant="secondary" className="px-1.5 h-5 ml-1">
                   {Object.values(filters).filter(x => x).length}
                 </Badge>
              )}
            </Button>

            <Button
              onClick={handleSearchSubmit}
              disabled={loading}
              className="h-11"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Advanced Filters Section */}
          {showFilters && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Advanced Filters
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                    <X className="h-3 w-3 mr-1" /> Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Institute</label>
                  <Input 
                      placeholder="e.g. NIT Allahabad" 
                      value={filters.institute}
                      onChange={(e) => handleFilterChange('institute', e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">University / Organization</label>
                  <Input 
                      placeholder="e.g. Delhi University" 
                      value={filters.university}
                      onChange={(e) => handleFilterChange('university', e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Qualification</label>
                  <Input 
                      placeholder="e.g. B.Tech, MBA" 
                      value={filters.qualification}
                      onChange={(e) => handleFilterChange('qualification', e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Specialization</label>
                  <Input 
                      placeholder="e.g. Computer Science" 
                      value={filters.specialization}
                      onChange={(e) => handleFilterChange('specialization', e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Batch (Year)</label>
                  <Input 
                      type="number"
                      placeholder="e.g. 2023" 
                      value={filters.batch}
                      onChange={(e) => handleFilterChange('batch', e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">City</label>
                  <Input 
                      placeholder="e.g. Mumbai" 
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stats Section - UPDATED with colorful solid cards */}
          {!loading && activeTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Total Users */}
              <StatCard 
                title="Total Users" 
                value={pagination.total}
                icon={<Users className="w-6 h-6 text-white" />}
                bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
                badge={{
                  label: "On this page",
                  value: users.length
                }}
              />

              {/* Card 2: Online Users */}
              <StatCard 
                title="Online Users" 
                value={onlineCount}
                icon={<Globe className="w-6 h-6 text-white" />}
                bgColor="bg-gradient-to-br from-emerald-600 to-emerald-700"
                badge={{
                  label: "Out of total",
                  value: `${onlineCount} / ${pagination.total}`
                }}
              />

              {/* Card 3: In Trash */}
              {cleanupStats && (
                <StatCard 
                  title="In Trash" 
                  value={cleanupStats.totalDeletedUsers}
                  icon={<Trash2 className="w-6 h-6 text-white" />}
                  bgColor="bg-gradient-to-br from-amber-600 to-amber-700"
                  badge={{
                    label: "Auto-clean in",
                    value: "90 days" // You might want to calculate this based on your cleanup stats
                  }}
                />
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Users</TabsTrigger>
              <TabsTrigger value="deleted">Deleted Users</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <UserTable
                users={users}
                loading={loading}
                onUserClick={handleUserClick}
                onDeleteUser={handleSoftDeleteUser}
                canEdit={true}
                showDeletedActions={false}
              />
            </TabsContent>

            <TabsContent value="deleted">
              <UserTable
                users={users}
                loading={loading}
                onUserClick={handleUserClick}
                onDeleteUser={handlePermanentDelete}
                onRestoreUser={handleRestoreUser}
                canEdit={false}
                showDeletedActions={false}
              />
            </TabsContent>
          </Tabs>

          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} entries
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                     const pageNum = index + 1;
                     if (
                        pagination.totalPages > 7 && 
                        Math.abs(pageNum - pagination.page) > 2 && 
                        pageNum !== 1 && 
                        pageNum !== pagination.totalPages
                     ) {
                         if (Math.abs(pageNum - pagination.page) === 3) {
                             return <PaginationItem key={pageNum}><span className="px-2">...</span></PaginationItem>
                         }
                         return null;
                     }

                     return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={pagination.page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                     );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={
                        pagination.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateUser}
          onDelete={handleSoftDeleteUser}
          isDeleted={activeTab === "deleted"}
        />
      )}

      {isDeletedUsersModalOpen && (
        <DeletedUsersModal
          onClose={() => setIsDeletedUsersModalOpen(false)}
          onRestoreUser={handleRestoreUser}
          onPermanentDelete={handlePermanentDelete}
        />
      )}
    </div>
  );
};

export default UserManagement;