// components/PostTable.js - Updated
import React from 'react';

const PostTable = ({ posts, loading, onPostClick, onDeletePost }) => {
  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 text-lg">No posts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Post
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reactions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <tr 
              key={post._id} 
              className="hover:bg-gray-50 cursor-pointer transition duration-150"
              onClick={() => onPostClick(post)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {post.imageUrl && post.imageUrl.length > 0 && (
                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={post.imageUrl[0]}
                        alt="Post thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {post.title || 'Untitled Post'}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {post.content || 'No content'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {post.authorDetails?.firstName} {post.authorDetails?.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {post.authorDetails?.email || post.author}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {post.reactions?.length || 0} reactions
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePost(post._id);
                  }}
                  className="text-red-600 hover:text-red-900 transition duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;