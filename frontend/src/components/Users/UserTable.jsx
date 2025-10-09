// components/UserTable.js (Updated)
import React from 'react';
import Avatar from '../Profile/Avatar';

const UserTable = ({ users, loading, onUserClick, onDeleteUser }) => {
  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr 
              key={user._id} 
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => onUserClick(user)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Avatar
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    size="md"
                  />
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="flex items-center mt-1 space-x-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      {user.isGoogleUser && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Google
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
                {user.mobileNumber && (
                  <div className="text-sm text-gray-500">+{user.mobileNumber}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    user.isEmailVerified 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    user.isPhoneVerified 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
                      onDeleteUser(user._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
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

export default UserTable;