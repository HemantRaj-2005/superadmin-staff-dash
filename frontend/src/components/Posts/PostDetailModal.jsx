// components/PostDetailModal.js - Updated
import React, { useState } from 'react';

const PostDetailModal = ({ post, onClose, onUpdate, onRemoveReaction, onHardDelete }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title || '',
    content: post.content || '',
    imageUrl: post.imageUrl || []
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      await onUpdate(post._id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post: ' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: post.title || '',
      content: post.content || '',
      imageUrl: post.imageUrl || []
    });
    setIsEditing(false);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setEditData(prev => ({
        ...prev,
        imageUrl: [...prev.imageUrl, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index) => {
    setEditData(prev => ({
      ...prev,
      imageUrl: prev.imageUrl.filter((_, i) => i !== index)
    }));
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Post Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['details', 'reactions', 'images'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {!isEditing ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{post.title || 'Untitled Post'}</h4>
                        <p className="text-sm text-gray-500 mt-2">
                          By {post.authorDetails?.firstName} {post.authorDetails?.lastName} • {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                      >
                        Edit Post
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                        {post.content || 'No content'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={editData.content}
                        onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                        rows="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSave}
                        disabled={updateLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 disabled:opacity-50"
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'reactions' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Reactions ({post.reactions?.length || 0})
                </h4>
                
                {!post.reactions || post.reactions.length === 0 ? (
                  <p className="text-gray-500">No reactions yet</p>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {post.reactions?.map((reaction) => (
                      <div key={reaction._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{reaction.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900">{reaction.label}</p>
                            <p className="text-sm text-gray-500">By: {reaction.reactedBy}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveReaction(post._id, reaction._id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  Images ({post.imageUrl?.length || 0})
                </h4>

                {/* Add New Image URL */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addImageUrl}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Add Image
                  </button>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editData.imageUrl.map((url, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden group relative">
                      <img
                        src={url}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                          e.target.alt = 'Image not available';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => removeImageUrl(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {(!editData.imageUrl || editData.imageUrl.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No images added to this post</p>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-red-800">Permanently delete this post</p>
                  <p className="text-sm text-red-600 mt-1">
                    This action cannot be undone. All data associated with this post will be permanently removed.
                  </p>
                </div>
                <button
                  onClick={() => onHardDelete(post._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;