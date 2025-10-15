// // components/Dashboard.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../contexts/AuthContext';
// import Avatar from '../Profile/Avatar';
// import api from '../../services/api';
// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalUsers:0,
//       newUsersToday:0,
//       verifiedUsers:0,
//       googleUsers:0,
//       totalPosts:0,
//       totalEvents:0,
//   });
//   const [recentUsers, setRecentUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { admin } = useAuth();

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // In a real app, you'd have specific endpoints for these stats
//       const postsResponse = await api.get('/posts?limit=1000');
      
//       const usersResponse = await api.get('/users?limit=5&page=1');
//       const allUsersResponse = await api.get('/users?limit=1000');
      
//       const allUsers = allUsersResponse.data.users;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       const newUsersToday = allUsers.filter(user => 
//         new Date(user.createdAt) >= today
//       ).length;
      
//       const verifiedUsers = allUsers.filter(user => 
//         user.isEmailVerified || user.isPhoneVerified
//       ).length;
      
//       const googleUsers = allUsers.filter(user => 
//         user.isGoogleUser
//       ).length;
      
//       const statsResponse = await api.get('/stats/dashboard');
//    setStats(statsResponse.data);



//       // setStats({
//       //   totalUsers: allUsersResponse.data.total,
//       //   newUsersToday,
//       //   verifiedUsers,
//       //   googleUsers,  
//       //   totalPosts: postsResponse.data.total

//       // });

//       setRecentUsers(usersResponse.data.users);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto">
//       <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <span className="text-blue-600 text-xl">👥</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Users</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <span className="text-green-600 text-xl">🆕</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">New Users Today</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.newUsersToday}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <span className="text-purple-600 text-xl">✅</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Verified Users</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.verifiedUsers}</p>
//             </div>
//           </div>
//         </div>

//            <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <span className="text-purple-600 text-xl">✅</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Google Users</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.googleUsers}</p>
//             </div>
//           </div>
//         </div>

        
//            <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <span className="text-purple-600 text-xl">✅</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="p-3 bg-orange-100 rounded-lg">
//               <span className="text-orange-600 text-xl">📝</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Posts</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
//             </div>
//           </div>
//         </div>


//       </div>

      

//       {/* Recent Users */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
//         </div>
//         <div className="divide-y divide-gray-200">
//           {recentUsers.map((user) => (
//             <div key={user._id} className="px-6 py-4 flex items-center justify-between">
//               <div className="flex items-center">
//                 <div
//                   className="h-10 w-10 rounded-full object-cover"
                
//                 ><Avatar
//                     src={user.profileImage}
//                     alt={`${user.firstName} ${user.lastName}`}
//                     size="md"
//                   /></div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-900">
//                     {user.firstName} {user.lastName}
//                   </p>
//                   <p className="text-sm text-gray-500">{user.email}</p>
//                 </div>
//               </div>
//               <div className="text-sm text-gray-500">
//                 Joined {new Date(user.createdAt).toLocaleDateString()}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>


// {/* 
//       <div className="bg-white rounded-lg shadow p-6">
//   <div className="flex items-center">
//     <div className="p-3 bg-indigo-100 rounded-lg">
//       <span className="text-indigo-600 text-xl">📝</span>
//     </div>
//     <div className="ml-4">
//       <p className="text-sm font-medium text-gray-600">Total Posts</p>
//       <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
//     </div>
//   </div>
// </div> */}

//       {/* Admin Info */}
//       <div className="mt-8 bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <p className="mt-1 text-sm text-gray-900">{admin?.name}</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <p className="mt-1 text-sm text-gray-900">{admin?.email}</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Role</label>
//             <p className="mt-1 text-sm text-gray-900 capitalize">{admin?.role}</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//               Active
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


// components/Home/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    newUsersToday: 0,
    verifiedUsers: 0,
    googleUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { admin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch users with proper error handling
      let usersResponse;
      try {
        usersResponse = await api.get('/users?limit=5&page=1');
        
        setRecentUsers(usersResponse.data.users || []);

      } catch (userError) {
        console.warn('Could not fetch users:', userError.response?.data?.message);
        // Continue with other stats even if users fail
      }

      // Fetch posts
      let postsResponse;
      try {
        postsResponse = await api.get('/posts?limit=1000');
      } catch (postError) {
        console.warn('Could not fetch posts:', postError.response?.data?.message);
        postsResponse = { data: { total: 0, posts: [] } };
      }

      // Fetch events
      let eventsResponse;
      try {
        eventsResponse = await api.get('/events?limit=1000');
      } catch (eventError) {
        console.warn('Could not fetch events:', eventError.response?.data?.message);
        eventsResponse = { data: { total: 0, events: [] } };
      }

      // Calculate stats from successful responses
      const allUsers = usersResponse?.data?.users || [];
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

      setStats({
        totalUsers: usersResponse?.data?.total || 0,
        totalPosts: postsResponse?.data?.total || 0,
        totalEvents: eventsResponse?.data?.total || 0,
        newUsersToday,
        verifiedUsers,
        googleUsers
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Safe role display function
  const getRoleName = () => {
    if (!admin?.role) return 'Unknown';
    
    if (typeof admin.role === 'object') {
      return admin.role.name || 'Unknown';
    }
    
    return admin.role === 'super_admin' ? 'Super Admin' : 
           admin.role === 'admin' ? 'Admin' : admin.role;
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
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Dashboard Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Info */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{admin?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{admin?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900">{getRoleName()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <span className="text-green-600 text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">🆕</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newUsersToday}</p>
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
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div key={user._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.profileImage || '/default-avatar.png'}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
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
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No users found or insufficient permissions to view users.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Users</h3>
          <p className="text-sm text-gray-500 mb-4">View and manage all users</p>
          <button
            onClick={() => window.location.href = '/users'}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Go to Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Posts</h3>
          <p className="text-sm text-gray-500 mb-4">View and manage all posts</p>
          <button
            onClick={() => window.location.href = '/posts'}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Go to Posts
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Events</h3>
          <p className="text-sm text-gray-500 mb-4">View and manage all events</p>
          <button
            onClick={() => window.location.href = '/events'}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-200"
          >
            Go to Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;