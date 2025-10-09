import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Trash2, 
  Edit3, 
  Filter, 
  Download, 
  Upload, 
  Search,
  BarChart3,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Activity
} from 'lucide-react';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deletedUsers: 0,
    totalPosts: 0,
    visiblePosts: 0,
    hiddenPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersData, deletedUsersData, postsData, allPostsData] = await Promise.all([
        userService.getUsers(1, 5),
        userService.getDeletedUsers(1, 5),
        postService.getPosts(1, 5),
        postService.getAllPosts(1, 5)
      ]);

      const visiblePosts = postsData.posts.length;
      const totalPosts = allPostsData.posts.length;
      const hiddenPosts = totalPosts - visiblePosts;

      setStats({
        totalUsers: usersData.total + deletedUsersData.total,
        activeUsers: usersData.total,
        deletedUsers: deletedUsersData.total,
        totalPosts,
        visiblePosts,
        hiddenPosts
      });

      // Mock recent activity (you can replace with actual activity log)
      setRecentActivity([
        { type: 'user_deleted', user: 'john_doe', admin: 'admin_user', time: new Date(Date.now() - 1000000) },
        { type: 'user_restored', user: 'jane_smith', admin: 'admin_user', time: new Date(Date.now() - 2000000) },
        { type: 'post_created', user: 'bob_wilson', admin: null, time: new Date(Date.now() - 3000000) },
        { type: 'user_created', user: 'alice_brown', admin: null, time: new Date(Date.now() - 4000000) },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityText = () => {
      switch (activity.type) {
        case 'user_deleted':
          return `Deleted user ${activity.user}`;
        case 'user_restored':
          return `Restored user ${activity.user}`;
        case 'post_created':
          return `New post by ${activity.user}`;
        case 'user_created':
          return `New user ${activity.user} registered`;
        default:
          return 'Unknown activity';
      }
    };

    const getActivityColor = () => {
      switch (activity.type) {
        case 'user_deleted':
          return 'text-red-600 bg-red-50';
        case 'user_restored':
          return 'text-green-600 bg-green-50';
        case 'post_created':
          return 'text-blue-600 bg-blue-50';
        case 'user_created':
          return 'text-purple-600 bg-purple-50';
        default:
          return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className="flex items-center space-x-3 py-3">
        <div className={`p-2 rounded-full ${getActivityColor()}`}>
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{getActivityText()}</p>
          <p className="text-xs text-gray-500">
            {activity.time.toLocaleDateString()} at {activity.time.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your platform</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button className="btn-primary flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Deleted Users"
          value={stats.deletedUsers}
          icon={UserX}
          color="bg-red-500"
          change={-3}
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          color="bg-purple-500"
          change={15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <Users className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">Manage Users</h3>
              <p className="text-sm text-gray-600 mt-1">View, edit, and manage user accounts</p>
            </Link>
            
            <Link
              to="/admin/posts"
              className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">Manage Posts</h3>
              <p className="text-sm text-gray-600 mt-1">Moderate and manage all posts</p>
            </Link>
            
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group cursor-pointer">
              <Shield className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">Security Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure security and permissions</p>
            </div>
            
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group cursor-pointer">
              <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">View detailed analytics and reports</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Activity
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-green-900">Database</p>
              <p className="text-sm text-green-700">All systems operational</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-green-900">API</p>
              <p className="text-sm text-green-700">Responding normally</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-yellow-900">Storage</p>
              <p className="text-sm text-yellow-700">75% used</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;