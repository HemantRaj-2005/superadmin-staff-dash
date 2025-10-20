// // components/ActivityLogs.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '..//../contexts/AuthContext';
// import ActivityLogsTable from './ActivityLogsTable';
// import ActivityLogDetailModal from './ActivityLogDetailModal';
// import api from '../../services/api';

// const ActivityLogs = () => {
//   const [logs, setLogs] = useState([]);
//   const [selectedLog, setSelectedLog] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     action: '',
//     resourceType: '',
//     adminId: '',
//     dateFrom: '',
//     dateTo: '',
//     search: ''
//   });
//   const [availableFilters, setAvailableFilters] = useState({
//     actions: [],
//     resourceTypes: [],
//     admins: []
//   });
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     totalPages: 0
//   });

//   const { admin } = useAuth();

//   useEffect(() => {
//     if (admin?.role.name === 'Super Admin') {
//       fetchLogs();
//     }
//   }, [pagination.page, filters, admin]);

//   const fetchLogs = async () => {
//     setLoading(true);
//     try {
//       const params = {
//         page: pagination.page,
//         limit: pagination.limit,
//         ...filters
//       };

//       const response = await api.get('/activity-logs', { params });
      
//       setLogs(response.data.logs);
//       setAvailableFilters(response.data.filters);
//       setPagination(prev => ({
//         ...prev,
//         total: response.data.total,
//         totalPages: response.data.totalPages
//       }));
//     } catch (error) {
//       console.error('Error fetching activity logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       action: '',
//       resourceType: '',
//       adminId: '',
//       dateFrom: '',
//       dateTo: '',
//       search: ''
//     });
//     setPagination(prev => ({ ...prev, page: 1 }));
//   };

//   const handleLogClick = async (log) => {
//     try {
//       const response = await api.get(`/activity-logs/${log._id}`);
//       setSelectedLog(response.data);
//       setIsModalOpen(true);
//     } catch (error) {
//       console.error('Error fetching log details:', error);
//     }
//   };

//   if (admin?.role.name !== 'Super Admin') {
//     return (
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-red-50 border border-red-200 rounded-xl p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <span className="text-red-600 text-2xl">🚫</span>
//             </div>
//             <div className="ml-4">
//               <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
//               <p className="text-red-700 mt-1">Only super admins can view activity logs.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="mb-6">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
//             <p className="text-gray-600 mt-1">Monitor all admin activities and changes</p>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//             {/* Action Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Action Type
//               </label>
//               <select
//                 value={filters.action}
//                 onChange={(e) => handleFilterChange('action', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Actions</option>
//                 {availableFilters.actions.map(action => (
//                   <option key={action} value={action}>{action}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Resource Type Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Resource Type
//               </label>
//               <select
//                 value={filters.resourceType}
//                 onChange={(e) => handleFilterChange('resourceType', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Resources</option>
//                 {availableFilters.resourceTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Admin Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Admin
//               </label>
//               <select
//                 value={filters.adminId}
//                 onChange={(e) => handleFilterChange('adminId', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Admins</option>
//                 {availableFilters.admins.map(admin => (
//                   <option key={admin._id} value={admin._id}>
//                     {admin.name} ({admin.email})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Search */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Search Description
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search in descriptions..."
//                 value={filters.search}
//                 onChange={(e) => handleFilterChange('search', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Date Range Filters */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date From
//               </label>
//               <input
//                 type="date"
//                 value={filters.dateFrom}
//                 onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date To
//               </label>
//               <input
//                 type="date"
//                 value={filters.dateTo}
//                 onChange={(e) => handleFilterChange('dateTo', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>

//           {/* Filter Stats */}
//           <div className="flex justify-between items-center text-sm text-gray-500">
//             <span>Showing {logs.length} of {pagination.total} activities</span>
//             <span>Page {pagination.page} of {pagination.totalPages}</span>
//           </div>
//         </div>

//         {/* Activity Logs Table */}
//         <ActivityLogsTable
//           logs={logs}
//           loading={loading}
//           onLogClick={handleLogClick}
//         />

//         {/* Pagination */}
//         <div className="flex justify-between items-center mt-6">
//           <button
//             onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
//             disabled={pagination.page === 1}
//             className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
//           >
//             Previous
//           </button>
          
//           <div className="flex items-center space-x-2">
//             {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
//               .filter(page => 
//                 page === 1 || 
//                 page === pagination.totalPages || 
//                 Math.abs(page - pagination.page) <= 2
//               )
//               .map((page, index, array) => (
//                 <React.Fragment key={page}>
//                   {index > 0 && array[index - 1] !== page - 1 && (
//                     <span className="px-2 text-gray-500">...</span>
//                   )}
//                   <button
//                     onClick={() => setPagination(prev => ({ ...prev, page }))}
//                     className={`px-3 py-1 rounded-lg transition duration-200 ${
//                       pagination.page === page
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 </React.Fragment>
//               ))}
//           </div>
          
//           <button
//             onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//             disabled={pagination.page === pagination.totalPages}
//             className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Activity Log Detail Modal */}
//       {isModalOpen && selectedLog && (
//         <ActivityLogDetailModal
//           log={selectedLog}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ActivityLogs;




// components/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '..//../contexts/AuthContext';
import ActivityLogsTable from './ActivityLogsTable';
import ActivityLogDetailModal from './ActivityLogDetailModal';
import api from '../../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Added device filters here
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    adminId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    deviceType: '', // desktop | mobile | tablet
    os: '', // OS name (partial match)
    browser: '' // Browser name (partial match)
  });

  const [availableFilters, setAvailableFilters] = useState({
    actions: [],
    resourceTypes: [],
    admins: [],
    deviceTypes: [], // from backend
    os: [],          // from backend
    browsers: []     // from backend
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { admin } = useAuth();

  useEffect(() => {
    if (admin?.role?.name === 'Super Admin') {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, admin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await api.get('/activity-logs', { params });

      setLogs(response.data.logs || []);
      // ensure defaults for missing pieces
      setAvailableFilters({
        actions: response.data.filters?.actions || [],
        resourceTypes: response.data.filters?.resourceTypes || [],
        admins: response.data.filters?.admins || [],
        deviceTypes: response.data.filters?.deviceTypes || [],
        os: response.data.filters?.os || [],
        browsers: response.data.filters?.browsers || []
      });

      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      resourceType: '',
      adminId: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      deviceType: '',
      os: '',
      browser: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLogClick = async (log) => {
    try {
      const response = await api.get(`/activity-logs/${log._id}`);
      setSelectedLog(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching log details:', error);
    }
  };

  if (admin?.role?.name !== 'Super Admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-2xl">🚫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
              <p className="text-red-700 mt-1">Only super admins can view activity logs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // fallback options if backend hasn't provided lists
  const defaultDeviceTypes = ['desktop', 'mobile', 'tablet'];
  const defaultOS = ['Windows', 'Mac OS', 'Linux', 'Android', 'iOS'];
  const defaultBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-600 mt-1">Monitor all admin activities and changes</p>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {availableFilters.actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Resources</option>
                {availableFilters.resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Admin Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin</label>
              <select
                value={filters.adminId}
                onChange={(e) => handleFilterChange('adminId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Admins</option>
                {availableFilters.admins.map(adminOption => (
                  <option key={adminOption._id} value={adminOption._id}>
                    {adminOption.name} ({adminOption.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Description</label>
              <input
                type="text"
                placeholder="Search in descriptions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Device Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
              <select
                value={filters.deviceType}
                onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Devices</option>
                {(availableFilters.deviceTypes.length ? availableFilters.deviceTypes : defaultDeviceTypes).map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>

            {/* OS Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating System</label>
              <select
                value={filters.os}
                onChange={(e) => handleFilterChange('os', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All OS</option>
                {(availableFilters.os.length ? availableFilters.os : defaultOS).map(osOption => (
                  <option key={osOption} value={osOption}>{osOption}</option>
                ))}
              </select>
            </div>

            {/* Browser Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Browser</label>
              <select
                value={filters.browser}
                onChange={(e) => handleFilterChange('browser', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Browsers</option>
                {(availableFilters.browsers.length ? availableFilters.browsers : defaultBrowsers).map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Filter Stats */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Showing {logs.length} of {pagination.total} activities</span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>
        </div>

        {/* Activity Logs Table */}
        <ActivityLogsTable
          logs={logs}
          loading={loading}
          onLogClick={handleLogClick}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === pagination.totalPages || 
                Math.abs(page - pagination.page) <= 2
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-1 rounded-lg transition duration-200 ${
                      pagination.page === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages || prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
          >
            Next
          </button>
        </div>
      </div>

      {/* Activity Log Detail Modal */}
      {isModalOpen && selectedLog && (
        <ActivityLogDetailModal
          log={selectedLog}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
export default ActivityLogs;
