// pages/Users/UserManagement.js
import React, { useState, useEffect } from "react";
import { Search, Users, AlertCircle, Trash2, UserCheck } from "lucide-react";
import UserTable from "./UserTable";
import UserDetailModal from "./UserDetailModal";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm, showDeleted]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // Use the same endpoint but with different query parameters
      const response = await api.get('/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          includeDeleted: showDeleted // Add this parameter
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

  const handleUserClick = async (user) => {
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

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await api.patch(`/users/${userId}/restore`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error restoring user:", error);
      setError("Failed to restore user");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleToggleDeleted = () => {
    setShowDeleted(!showDeleted);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when toggling
  };

  // Fetch user statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deletedUsers: 0,
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
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
                <CardTitle className="text-2xl">User Management</CardTitle>
                <CardDescription>
                  {showDeleted ? 'Manage deleted users' : 'Manage and view all registered users'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {showDeleted ? `${stats.deletedUsers} deleted` : `${stats.activeUsers} active`}
              </Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showDeleted}
                  onCheckedChange={handleToggleDeleted}
                  id="show-deleted"
                />
                <Label htmlFor="show-deleted" className="flex items-center space-x-2 cursor-pointer">
                  {showDeleted ? (
                    <>
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Deleted Users</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>Active Users</span>
                    </>
                  )}
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={showDeleted 
                ? "Search deleted users by name or email..." 
                : "Search users by name or email..."
              }
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 h-11"
            />
          </div>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Deleted Users
                      </p>
                      <p className="text-2xl font-bold text-red-600">{stats.deletedUsers}</p>
                    </div>
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Current View
                      </p>
                      <p className="text-2xl font-bold">
                        {showDeleted ? 'Deleted' : 'Active'}
                      </p>
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        loading ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Table */}
          <UserTable
            users={users}
            loading={loading}
            onUserClick={handleUserClick}
            onDeleteUser={showDeleted ? null : handleDeleteUser}
            onRestoreUser={showDeleted ? handleRestoreUser : null}
            canEdit={!showDeleted}
            showDeleted={showDeleted}
          />

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} entries
                {showDeleted && (
                  <span className="ml-2 text-red-600">
                    (These users will be permanently deleted after 90 days)
                  </span>
                )}
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

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagement;