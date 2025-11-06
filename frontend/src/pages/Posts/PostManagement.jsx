import React, { useState, useEffect } from 'react';
import { Search, Filter, X, FileText, Users } from 'lucide-react';
import PostTable from './PostTable';
import PostDetailModal from './PostDetailModal';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, searchTerm, authorFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          author: authorFilter
        }
      });
      
      setPosts(response.data.posts);
      console.log(response.data.posts)
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleUpdatePost = async (postId, updateData) => {
    try {
      await api.put(`/posts/${postId}`, updateData);
      fetchPosts(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleRemoveReaction = async (postId, reactionId) => {
    try {
      await api.delete(`/posts/${postId}/reactions/${reactionId}`);
      fetchPosts(); // Refresh the list
      // If the modal is open, refresh the selected post
      if (selectedPost && selectedPost._id === postId) {
        const updatedPost = await api.get(`/posts/${postId}`);
        setSelectedPost(updatedPost.data);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleHardDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}/hard`);
      fetchPosts(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error hard deleting post:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = searchTerm || authorFilter;

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
          {/* Search and Filter Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Posts</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Author</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Author name..."
                      value={authorFilter}
                      onChange={(e) => setAuthorFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Search: "{searchTerm}"</span>
                      <button onClick={() => setSearchTerm('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {authorFilter && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Author: "{authorFilter}"</span>
                      <button onClick={() => setAuthorFilter('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold">{pagination.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
             
             
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Page Size</p>
                      <p className="text-2xl font-bold">{pagination.limit}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} posts
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                      className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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