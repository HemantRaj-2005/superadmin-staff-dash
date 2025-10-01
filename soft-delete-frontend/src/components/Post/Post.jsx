import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { Plus, Edit, Trash2, User } from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
    if (user) {
      loadMyPosts();
    }
  }, [user, currentPage]);

  const loadPosts = async () => {
    try {
      const data = await postService.getPosts(currentPage);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadMyPosts = async () => {
    try {
      const data = await postService.getMyPosts(currentPage);
      setMyPosts(data.posts);
    } catch (error) {
      console.error('Error loading my posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postService.createPost(newPost);
      setNewPost({ title: '', content: '' });
      loadPosts();
      loadMyPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postService.updatePost(editingPost._id, {
        title: editingPost.title,
        content: editingPost.content
      });
      setEditingPost(null);
      loadPosts();
      loadMyPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        loadPosts();
        loadMyPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const displayPosts = showMyPosts ? myPosts : posts;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {showMyPosts ? 'My Posts' : 'All Posts'}
          </h1>
          <p className="text-gray-600 mt-2">
            {displayPosts.length} {displayPosts.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>

        {user && (
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button
              onClick={() => setShowMyPosts(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showMyPosts 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setShowMyPosts(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showMyPosts 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Posts
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Post Form */}
      {user && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Post Title"
                value={editingPost ? editingPost.title : newPost.title}
                onChange={(e) => 
                  editingPost 
                    ? setEditingPost({ ...editingPost, title: e.target.value })
                    : setNewPost({ ...newPost, title: e.target.value })
                }
                className="input-field text-lg font-medium"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="What's on your mind?"
                value={editingPost ? editingPost.content : newPost.content}
                onChange={(e) =>
                  editingPost
                    ? setEditingPost({ ...editingPost, content: e.target.value })
                    : setNewPost({ ...newPost, content: e.target.value })
                }
                className="input-field min-h-[120px] resize-vertical"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading 
                  ? (editingPost ? 'Updating...' : 'Creating...') 
                  : (editingPost ? 'Update Post' : 'Create Post')
                }
              </button>
              {editingPost && (
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {displayPosts.map((post) => (
          <div key={post._id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.username}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {user && user._id === post.author._id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        ))}

        {displayPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">
              {showMyPosts 
                ? "You haven't created any posts yet." 
                : "No posts available. Be the first to create one!"
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === page
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;