// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import api from '../services/api';
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers:0,
      newUsersToday:0,
      verifiedUsers:0,
      googleUsers:0,
      totalPosts:0,
      totalEvents:0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, you'd have specific endpoints for these stats
      const postsResponse = await api.get('/posts?limit=1000');
      
      const usersResponse = await api.get('/users?limit=5&page=1');
      const allUsersResponse = await api.get('/users?limit=1000');
      
      const allUsers = allUsersResponse.data.users;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = allUsers.filter(user => 
        new Date(user.createdAt) >= today
      ).length;
      
      const verifiedUsers = allUsers.filter(user => 
        user.isEmailVerified || user.isPhoneVerified
      ).length;
      
      const googleUsers = allUsers.filter(user => 
        user.isGoogleUser
      ).length;
      
      const statsResponse = await api.get('/stats/dashboard');
   setStats(statsResponse.data);



      // setStats({
      //   totalUsers: allUsersResponse.data.total,
      //   newUsersToday,
      //   verifiedUsers,
      //   googleUsers,  
      //   totalPosts: postsResponse.data.total

      // });

      setRecentUsers(usersResponse.data.users);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">🆕</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Users Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newUsersToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>

           <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Google Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.googleUsers}</p>
            </div>
          </div>
        </div>

        
           <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>


      </div>

      

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentUsers.map((user) => (
            <div key={user._id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="h-10 w-10 rounded-full object-cover"
                
                ><Avatar
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    size="md"
                  /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>


{/* 
      <div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center">
    <div className="p-3 bg-indigo-100 rounded-lg">
      <span className="text-indigo-600 text-xl">📝</span>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Total Posts</p>
      <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
    </div>
  </div>
</div> */}

      {/* Admin Info */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{admin?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{admin?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{admin?.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;