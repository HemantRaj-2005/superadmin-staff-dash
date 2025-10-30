// components/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, BarChart3, AlertCircle, Download } from 'lucide-react';
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // The actual filters used by the fetch
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

  // uiFilters: controlled inputs in the UI. Apply button will copy uiFilters -> filters.
  const [uiFilters, setUiFilters] = useState({ ...filters });

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

  // Fetch when filters (applied) or page changes
  useEffect(() => {
    if (admin?.role?.name === 'Super Admin') {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, admin]);

  // Keep uiFilters synced whenever filters changes (so UI reflects programmatic resets or updates)
  useEffect(() => {
    setUiFilters((prev) => ({ ...prev, ...filters }));
  }, [filters]);

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

  // Update uiFilters when inputs change (does NOT trigger fetch)
  const handleUIFilterChange = (key, value) => {
    setUiFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply button: copy uiFilters -> filters and reset to page 1
  const applyFilters = () => {
    setFilters({ ...uiFilters });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    const cleared = {
      action: 'all',
      resourceType: 'all',
      adminId: 'all',
      dateFrom: '',
      dateTo: '',
      search: '',
      deviceType: 'all',
      os: 'all',
      browser: 'all'
    };
    setFilters(cleared);
    setUiFilters(cleared);
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
    if (newPage < 1 || newPage > pagination.totalPages) return;
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

  // ---------------- CSV Export Helpers ----------------

  // Convert array of objects -> CSV string
  const convertObjectsToCSV = (data, columns = null) => {
    if (!Array.isArray(data) || data.length === 0) return "";

    // Determine keys (use provided columns or union of keys from all objects)
    const keys =
      Array.isArray(columns) && columns.length > 0
        ? columns
        : Array.from(
            data.reduce((set, item) => {
              Object.keys(item || {}).forEach((k) => set.add(k));
              return set;
            }, new Set())
          );

    const escapeCell = (value) => {
      if (value === null || value === undefined) return "";
      // stringify objects/arrays so they remain single cell
      if (typeof value === "object") {
        try {
          value = JSON.stringify(value);
        } catch (e) {
          value = String(value);
        }
      }
      const s = String(value);
      if (/[,\"\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const headerRow = keys.map((k) => escapeCell(k)).join(",") + "\n";
    const rows = data
      .map((row) => keys.map((k) => escapeCell(row[k])).join(","))
      .join("\n");

    // BOM for Excel UTF-8 compatibility
    return "\uFEFF" + headerRow + rows;
  };

  // Trigger browser download for CSV string
  const downloadCSV = (csvString, filename = "data.csv") => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export handler. mode: 'visible' | 'all'
  const handleExport = async (mode = "visible") => {
    try {
      let dataToExport = [];

      if (mode === "visible") {
        dataToExport = logs;
      } else if (mode === "all") {
        // Try to fetch all logs. NOTE: backend must support this or provide a dedicated export endpoint.
        // Reuse current filters so exported set matches UI filters.
        const apiParams = {
          page: 1,
          limit: pagination.total || 100000, // adjust depending on backend capability
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

        const resp = await api.get('/activity-logs', { params: apiParams });
        dataToExport = resp.data.logs || [];
      }

      if (!dataToExport || dataToExport.length === 0) {
        alert("No logs to export.");
        return;
      }

      // Optional: pick columns in desired order, otherwise will use union of keys found in logs
      // const columns = ['_id', 'action', 'resourceType', 'admin', 'description', 'ip', 'deviceType', 'os', 'browser', 'createdAt'];
      const columns = null;

      const csv = convertObjectsToCSV(dataToExport, columns);
      const filename = `activity_logs_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
      downloadCSV(csv, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export logs. See console for details.');
    }
  };

  // ---------------- End CSV Export Helpers ----------------

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

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {pagination.total} total activities
          </Badge>

          {/* Export Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleExport('visible');
                    // close popover
                    document.body.click();
                  }}
                >
                  Export Visible ({logs.length})
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={async () => {
                    await handleExport('all');
                    document.body.click();
                  }}
                >
                  Export All
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
                      value={uiFilters.search}
                      onChange={(e) => handleUIFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select
                    value={uiFilters.action}
                    onValueChange={(value) => handleUIFilterChange('action', value)}
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
                    value={uiFilters.resourceType}
                    onValueChange={(value) => handleUIFilterChange('resourceType', value)}
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
                    value={uiFilters.adminId}
                    onValueChange={(value) => handleUIFilterChange('adminId', value)}
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
                    value={uiFilters.deviceType}
                    onValueChange={(value) => handleUIFilterChange('deviceType', value)}
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
                    value={uiFilters.os}
                    onValueChange={(value) => handleUIFilterChange('os', value)}
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
                    value={uiFilters.browser}
                    onValueChange={(value) => handleUIFilterChange('browser', value)}
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
                    value={uiFilters.dateFrom}
                    onChange={(e) => handleUIFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <Input
                    type="date"
                    value={uiFilters.dateTo}
                    onChange={(e) => handleUIFilterChange('dateTo', e.target.value)}
                  />
                </div>

                {/* Apply / Clear controls */}
                <div className="flex items-end space-x-2">
                 <Button
  variant="primary"
  onClick={applyFilters}
  className="flex-1 flex items-center justify-center transition-all duration-300 
             hover:shadow-[0_0_15px_#3b82f6] active:shadow-[0_0_25px_#2563eb] 
             hover:scale-105 active:scale-95"
>
  Apply Filters
</Button>


                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="flex-1 flex items-center space-x-2 justify-center"
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
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, search: '' })); setFilters(prev => ({ ...prev, search: '' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.action !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Action: {filters.action}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, action: 'all' })); setFilters(prev => ({ ...prev, action: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.resourceType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Resource: {filters.resourceType}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, resourceType: 'all' })); setFilters(prev => ({ ...prev, resourceType: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.adminId !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Admin: {availableFilters.admins.find(a => a._id === filters.adminId)?.name}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, adminId: 'all' })); setFilters(prev => ({ ...prev, adminId: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.deviceType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Device: {filters.deviceType}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, deviceType: 'all' })); setFilters(prev => ({ ...prev, deviceType: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.os !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>OS: {filters.os}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, os: 'all' })); setFilters(prev => ({ ...prev, os: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.browser !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Browser: {filters.browser}</span>
                      <button onClick={() => { setUiFilters(prev => ({ ...prev, browser: 'all' })); setFilters(prev => ({ ...prev, browser: 'all' })); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>Date: {filters.dateFrom || '—'} to {filters.dateTo || '—'}</span>
                      <button onClick={() => {
                        setUiFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
                        setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
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
