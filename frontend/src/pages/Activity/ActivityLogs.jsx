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
import { Search, Filter, X, BarChart3, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ActivityLogsTable from './ActivityLogsTable';
import ActivityLogDetailModal from './ActivityLogDetailModal';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    action: 'all',
    resourceType: 'all',
    adminId: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
    deviceType: 'all',
    os: 'all',
    browser: 'all'
  });

  const [availableFilters, setAvailableFilters] = useState({
    actions: [],
    resourceTypes: [],
    admins: [],
    deviceTypes: [],
    os: [],
    browsers: []
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
  }, [pagination.page, filters, admin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Convert filter values for API
      const apiParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        action: filters.action === 'all' ? '' : filters.action,
        resourceType: filters.resourceType === 'all' ? '' : filters.resourceType,
        adminId: filters.adminId === 'all' ? '' : filters.adminId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        deviceType: filters.deviceType === 'all' ? '' : filters.deviceType,
        os: filters.os === 'all' ? '' : filters.os,
        browser: filters.browser === 'all' ? '' : filters.browser
      };

      const response = await api.get('/activity-logs', { params: apiParams });

      setLogs(response.data.logs || []);
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
      action: 'all',
      resourceType: 'all',
      adminId: 'all',
      dateFrom: '',
      dateTo: '',
      search: '',
      deviceType: 'all',
      os: 'all',
      browser: 'all'
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateFrom' || key === 'dateTo' || key === 'search') {
      return value !== '';
    }
    return value !== 'all';
  });

  // Fallback options
  const defaultDeviceTypes = ['desktop', 'mobile', 'tablet'];
  const defaultOS = ['Windows', 'Mac OS', 'Linux', 'Android', 'iOS'];
  const defaultBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];

  if (admin?.role?.name !== 'Super Admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only super admins can view activity logs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all admin activities and changes
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {pagination.total} total activities
        </Badge>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Page {pagination.page} of {pagination.totalPages} • {logs.length} showing
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filters Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Description</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search in descriptions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) => handleFilterChange('action', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {availableFilters.actions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resource Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource Type</label>
                  <Select
                    value={filters.resourceType}
                    onValueChange={(value) => handleFilterChange('resourceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {availableFilters.resourceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin</label>
                  <Select
                    value={filters.adminId}
                    onValueChange={(value) => handleFilterChange('adminId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Admins" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admins</SelectItem>
                      {availableFilters.admins.map(adminOption => (
                        <SelectItem key={adminOption._id} value={adminOption._id}>
                          {adminOption.name} ({adminOption.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Device Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Device Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type</label>
                  <Select
                    value={filters.deviceType}
                    onValueChange={(value) => handleFilterChange('deviceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {(availableFilters.deviceTypes.length ? availableFilters.deviceTypes : defaultDeviceTypes).map(dt => (
                        <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* OS Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operating System</label>
                  <Select
                    value={filters.os}
                    onValueChange={(value) => handleFilterChange('os', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All OS</SelectItem>
                      {(availableFilters.os.length ? availableFilters.os : defaultOS).map(osOption => (
                        <SelectItem key={osOption} value={osOption}>{osOption}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Browser Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Browser</label>
                  <Select
                    value={filters.browser}
                    onValueChange={(value) => handleFilterChange('browser', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Browsers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Browsers</SelectItem>
                      {(availableFilters.browsers.length ? availableFilters.browsers : defaultBrowsers).map(br => (
                        <SelectItem key={br} value={br}>{br}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="flex-1 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {filters.search && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Search: "{filters.search}"</span>
                      <button onClick={() => handleFilterChange('search', '')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.action !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Action: {filters.action}</span>
                      <button onClick={() => handleFilterChange('action', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.resourceType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Resource: {filters.resourceType}</span>
                      <button onClick={() => handleFilterChange('resourceType', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.adminId !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Admin: {availableFilters.admins.find(a => a._id === filters.adminId)?.name}</span>
                      <button onClick={() => handleFilterChange('adminId', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.deviceType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Device: {filters.deviceType}</span>
                      <button onClick={() => handleFilterChange('deviceType', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.os !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>OS: {filters.os}</span>
                      <button onClick={() => handleFilterChange('os', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.browser !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Browser: {filters.browser}</span>
                      <button onClick={() => handleFilterChange('browser', 'all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Date: {filters.dateFrom} to {filters.dateTo}</span>
                      <button onClick={() => {
                        handleFilterChange('dateFrom', '');
                        handleFilterChange('dateTo', '');
                      }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs Table */}
          <ActivityLogsTable
            logs={logs}
            loading={loading}
            onLogClick={handleLogClick}
          />

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} activities
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={pagination.page === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

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