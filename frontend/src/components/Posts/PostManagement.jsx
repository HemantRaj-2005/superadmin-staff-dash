// components/PostManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostTable from './PostTable';
import PostDetailModal from './PostDetailModal';
import api from '../../services/api';

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
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}`);
        fetchPosts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting post:', error);
      }
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
    if (window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      try {
        await api.delete(`/posts/${postId}/hard`);
        fetchPosts(); // Refresh the list
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error hard deleting post:', error);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAuthorFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Management</h2>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Posts
              </label>
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Author
              </label>
              <input
                type="text"
                placeholder="Author name..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Post Table */}
        <PostTable
          posts={posts}
          loading={loading}
          onPostClick={handlePostClick}
          onDeletePost={handleDeletePost}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total posts)
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition duration-200"
          >
            Next
          </button>
        </div>
      </div>

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