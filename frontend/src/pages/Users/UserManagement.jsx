// // components/UserManagement.js
import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  AlertCircle,
  FileDown,
  ChevronDown,
  Trash2,
  RefreshCw,
  ChevronUp,
  FileUp,
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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedUsersModalOpen, setIsDeletedUsersModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  useEffect(() => {
    fetchUsers();
    if (activeTab === "active") {
      fetchCleanupStats();
    }
  }, [pagination.page, searchTerm, activeTab]);

  // Function to log search activity
  const logSearchActivity = async (searchQuery) => {
    if (!searchQuery.trim()) return; // Don't log empty searches

    try {
      await api.post("/activity-logs", {
        action: "SEARCH_USERS",
        description: `Searched for users with query: "${searchQuery}"`,
        module: "USER_MANAGEMENT",
        details: {
          searchQuery: searchQuery,
          timestamp: new Date().toISOString(),
          resultsCount: users.length,
          totalUsers: pagination.total,
        },
      });
    } catch (error) {
      console.error("Error logging search activity:", error);
      // Don't show this error to the user as it shouldn't affect their search experience
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = activeTab === "deleted" ? "/users/deleted" : "/users";
      const response = await api.get(endpoint, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          includeDeleted: activeTab === "deleted",
        },
      });

      setUsers(response.data.users);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
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

  const handleUserClick = async (user) => {
    // If we are on the 'deleted' tab, just use the user data we
    // already have from the table. No new API call is needed.
    if (activeTab === "deleted") {
      console.log("Showing details for deleted user (no fetch):", user._id);
      setSelectedUser(user);
      setIsModalOpen(true);
      return; // Stop the function here
    }

    // --- This part will now ONLY run for 'active' users ---
    try {
      console.log("Fetching user details for:", user._id);
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
      fetchUsers(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user");
    }
  };

  const handleSoftDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to move this user to trash? They can be restored within 90 days."
      )
    ) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
        fetchCleanupStats();
      } catch (error) {
        console.error("Error soft deleting user:", error);
        setError(
          "Failed to move user to trash: " +
            (error.response?.data?.message || error.message)
        );
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
      console.error("Error restoring user:", error);
      setError(
        "Failed to restore user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/users/${userId}/permanent`);
        fetchUsers();
        fetchCleanupStats();
      } catch (error) {
        console.error("Error permanently deleting user:", error);
        setError(
          "Failed to permanently delete user: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const runManualCleanup = async () => {
    if (
      window.confirm(
        "Run manual user cleanup? This will permanently delete users that were soft-deleted more than 90 days ago."
      )
    ) {
      try {
        const response = await api.post("/users/cleanup/run");
        alert(response.data.message);
        fetchUsers();
        fetchCleanupStats();
      } catch (error) {
        console.error("Error running cleanup:", error);
        setError(
          "Failed to run cleanup: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Handle input change (without logging)
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission (Enter key or search button)
  const handleSearchSubmit = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Log the search activity
    if (searchTerm.trim()) {
      logSearchActivity(searchTerm);
    }

    // Trigger the API call to fetch users
    fetchUsers();
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) {
      return "";
    }
    const headers = [
      "_id",
      "name",
      "email",
      "role",
      "verified",
      "isPublic",
      "createdAt",
      "deletedAt",
    ];
    let csv = headers.join(",") + "\n";
    data.forEach((user) => {
      const row = headers.map((header) => {
        let val = user[header];
        if (header === "role" && typeof val === "object" && val !== null) {
          val = val.name || val._id || "object";
        }
        if (typeof val === "boolean") {
          val = val ? "Yes" : "No";
        }
        if (header === "createdAt" || header === "deletedAt") {
          val = val ? new Date(val).toLocaleString() : "";
        }
        if (val === null || val === undefined) {
          val = "";
        }
        let strVal = String(val);
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
        const response = await api.get(endpoint, {
          params: {
            search: searchTerm,
            all: true,
          },
        });

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
      setError(
        "Failed to export CSV: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsExporting(false);
    }
  };

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
                    Export All ({pagination.total} users)
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

          {/* // -----------------------------------------------------------------
            //   START: MODIFIED SECTION
            // -----------------------------------------------------------------
            //
            // The "Cleanup Stats" block was removed from here.
            // The "Active User Stats" block below was modified to include
            // "In Trash" and the grid was changed to 3 columns.
            //
            // -----------------------------------------------------------------
          */}

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
              onClick={handleSearchSubmit}
              disabled={loading}
              className="h-11"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* // -----------------------------------------------------------------
            //   START: MODIFIED SECTION
            // -----------------------------------------------------------------
          */}
          {!loading && activeTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Total Users */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold">{pagination.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Online Users */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Online Users
                      </p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      / {pagination.total}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: In Trash (conditionally rendered) */}
              {cleanupStats && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          In Trash
                        </p>
                        <p className="text-2xl font-bold">
                          {cleanupStats.totalDeletedUsers}
                        </p>
                      </div>
                      <Trash2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {/* // -----------------------------------------------------------------
            //   END: MODIFIED SECTION
            // -----------------------------------------------------------------
          */}

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
                showDeletedActions={true}
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

                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={pagination.page === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

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