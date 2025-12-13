// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../Profile/Avatar';
import api from '../../services/api';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CalendarDays, 
  FileText, 
  Search,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deletedUsers: 0,
    newUsersToday: 0,
    verifiedUsers: 0,
    googleUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
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

      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/users?limit=5&page=1')
      ]);

      setStats(statsResponse.data);
      setRecentUsers(usersResponse.data.users);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {admin?.name}.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* UPDATED: Total Users Card with Breakdown */}
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          >
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {stats.activeUsers} Active
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                {stats.deletedUsers} Deleted
              </span>
            </div>
          </StatCard>

          <StatCard 
            title="New Users Today" 
            value={stats.newUsersToday} 
            icon={<UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <StatCard 
            title="Verified Phone and Email Users" 
            value={stats.verifiedUsers} 
            icon={<ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />}
            bgColor="bg-violet-50 dark:bg-violet-900/20"
          />
          <StatCard 
            title="Google Users" 
            value={stats.googleUsers} 
            icon={<Search className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
            bgColor="bg-rose-50 dark:bg-rose-900/20"
          />
          <StatCard 
            title="Total Events" 
            value={stats.totalEvents} 
            icon={<CalendarDays className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            bgColor="bg-amber-50 dark:bg-amber-900/20"
          />
          <StatCard 
            title="Total Posts" 
            value={stats.totalPosts} 
            icon={<FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
            bgColor="bg-cyan-50 dark:bg-cyan-900/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Registrations</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user._id} className="group px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm">
                        <Avatar
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          size="md"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">No recent users found.</div>
              )}
            </div>
          </div>

          {/* Admin Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-fit">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Admin Profile
            </h3>
            
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 mb-3">
                <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-200">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{admin?.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{admin?.email}</p>
              <div className="mt-3 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100 dark:border-indigo-800">
                {admin?.role?.name || 'Admin'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-300">Account Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// UPDATED: Reusable Modern Card Component accepts 'children'
const StatCard = ({ title, value, icon, bgColor, children }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        {icon}
      </div>
    </div>
    
    {/* Render Children (stats breakdown) if present */}
    {children && (
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        {children}
      </div>
    )}
  </div>
);

export default Dashboard;