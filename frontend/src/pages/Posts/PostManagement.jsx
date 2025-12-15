import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, FileText, Users, BarChart } from "lucide-react";
import PostTable from "./PostTable";
import PostDetailModal from "./PostDetailModal";
import api from "../../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const lastLoggedSearchRef = useRef("");
  const [stats, setStats] = useState({
    averageLikes: 0,
    averageComments: 0,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();
    fetchPostStats();
  }, [pagination.page, debouncedSearchTerm]);

  // Function to log search activity
  const logSearchActivity = async (searchQuery, resultsCount = 0) => {
    if (!searchQuery.trim()) return;

    // Skip if same search term was just logged
    if (lastLoggedSearchRef.current === searchQuery) {
      return;
    }

    try {
      await api.post("/activity-logs", {
        action: "SEARCH_POSTS",
        description: `Searched for posts with query: "${searchQuery}"`,
        module: "Post Management",
        metadata: {
          searchQuery: searchQuery,
          resultsCount: resultsCount,
          timestamp: new Date().toISOString(),
        }
      });

      // Update last logged search
      lastLoggedSearchRef.current = searchQuery;
    } catch (error) {
      console.error("Error logging search activity:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/posts", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
        },
      });

      setPosts(response.data.posts);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));

      // Log search activity after successful fetch
      if (debouncedSearchTerm.trim() !== "") {
        logSearchActivity(debouncedSearchTerm, response.data.posts.length);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostStats = async () => {
    try {
      const response = await api.get("/posts/stats/summary");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching post stats:", error);
    }
  };

  // StatCard Component
  const StatCard = ({ title, value, icon, bgColor, subtitle, children }) => (
    <div className={`${bgColor} p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-white/80 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      
      {children && (
        <div className="mt-4 pt-3 border-t border-white/30">
          {children}
        </div>
      )}
    </div>
  );

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleUpdatePost = async (postId, updateData) => {
    try {
      await api.put(`/posts/${postId}`, updateData);
      fetchPosts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleRemoveReaction = async (postId, reactionId) => {
    try {
      await api.delete(`/posts/${postId}/reactions/${reactionId}`);
      fetchPosts();
      if (selectedPost && selectedPost._id === postId) {
        const updatedPost = await api.get(`/posts/${postId}`);
        setSelectedPost(updatedPost.data);
      }
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  };

  const handleHardDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}/hard`);
      fetchPosts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error hard deleting post:", error);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setDebouncedSearchTerm(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Post Management</CardTitle>
                <CardDescription>
                  Manage and moderate all posts on the platform
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Single Combined Search Bar */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Search Posts
              </CardTitle>
              <CardDescription className="text-xs">
                Search by title, content, or author name/email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts by title, content, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  {searchTerm && (
                    <Button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Active Search Badge */}
              {searchTerm && (
                <div className="mt-4">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>Search: "{searchTerm}"</span>
                    <Button onClick={handleClearSearch}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards - UPDATED with colorful solid backgrounds */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Posts Card */}
              <StatCard 
                title="Total Posts" 
                value={pagination.total}
                icon={<FileText className="w-6 h-6 text-white" />}
                bgColor="bg-gradient-to-br from-indigo-600 to-indigo-700"
                subtitle="All platform posts"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                    Showing {Math.min(pagination.limit, posts.length)} on this page
                  </span>
                </div>
              </StatCard>

              {/* Current Page Card */}
              <StatCard 
                title="Current Page" 
                value={pagination.page}
                icon={<Users className="w-6 h-6 text-white" />}
                bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
                subtitle={`of ${pagination.totalPages} pages`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80">Posts per page:</span>
                  <span className="font-bold text-white">{pagination.limit}</span>
                </div>
              </StatCard>

             
            </div>
          )}

          {/* Post Table */}
          <PostTable
            posts={posts}
            loading={loading}
            onPostClick={handlePostClick}
            onDeletePost={handleDeletePost}
          />

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} posts
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

      {/* Post Detail Modal */}
      {isModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdatePost}
          onRemoveReaction={handleRemoveReaction}
          onHardDelete={handleHardDelete}
        />
      )}
    </div>
  );
};

export default PostManagement;