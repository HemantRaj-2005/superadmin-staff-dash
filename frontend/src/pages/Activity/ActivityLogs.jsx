// components/ActivityLogs.js (responsive compact filters version)
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, BarChart3, AlertCircle, Upload, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    setShowAdvancedFilters(false);
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
      <div className="container mx-auto p-4 sm:p-6">
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Activity Logs</h1>
          <p className="text-muted-foreground text-sm sm:text-base truncate">
            Monitor all admin activities and changes
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
          <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
            {pagination.total} total
          </Badge>

          {/* Export Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2 whitespace-nowrap">
                <Upload className="h-4 w-4" />
                <span className="hidden xs:inline">Export</span>
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
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">Activity Logs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Page {pagination.page} of {pagination.totalPages} • {logs.length} showing
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Compact Filters Section */}
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Main Search and Quick Filters Row */}
            <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-end">
              {/* Search Input */}
              <div className="flex-1 w-full xs:min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search descriptions..."
                    value={uiFilters.search}
                    onChange={(e) => handleUIFilterChange('search', e.target.value)}
                    className="pl-8 h-9 text-sm w-full"
                  />
                </div>
              </div>

              {/* Quick Filters - Responsive grid */}
              <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-2 w-full xs:w-auto">
                <div className="min-w-[120px] xs:w-28">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Action</label>
                  <Select
                    value={uiFilters.action}
                    onValueChange={(value) => handleUIFilterChange('action', value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {availableFilters.actions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[120px] xs:w-32">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Resource</label>
                  <Select
                    value={uiFilters.resourceType}
                    onValueChange={(value) => handleUIFilterChange('resourceType', value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {availableFilters.resourceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[120px] xs:w-36 col-span-2 xs:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Admin</label>
                  <Select
                    value={uiFilters.adminId}
                    onValueChange={(value) => handleUIFilterChange('adminId', value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admins</SelectItem>
                      {availableFilters.admins.map(adminOption => (
                        <SelectItem key={adminOption._id} value={adminOption._id}>
                          <span className="truncate">{adminOption.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons - Responsive layout */}
              <div className="flex gap-2 w-full xs:w-auto justify-between xs:justify-start">
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="h-9 px-3 flex items-center space-x-1 flex-1 xs:flex-none"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Apply</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-9 px-3 flex items-center space-x-1 flex-1 xs:flex-none"
                >
                  <span className="hidden xs:inline">
                    {showAdvancedFilters ? 'Less' : 'More'} Filters
                  </span>
                  <span className="xs:hidden">Filters</span>
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearFilters}
                    className="h-9 px-3 flex items-center space-x-1 flex-1 xs:flex-none"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Clear</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t">
                {/* Device Filters */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Device Info</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Device Type</label>
                      <Select
                        value={uiFilters.deviceType}
                        onValueChange={(value) => handleUIFilterChange('deviceType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
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

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">OS</label>
                      <Select
                        value={uiFilters.os}
                        onValueChange={(value) => handleUIFilterChange('os', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
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

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Browser</label>
                      <Select
                        value={uiFilters.browser}
                        onValueChange={(value) => handleUIFilterChange('browser', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                      <Input
                        type="date"
                        value={uiFilters.dateFrom}
                        onChange={(e) => handleUIFilterChange('dateFrom', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                      <Input
                        type="date"
                        value={uiFilters.dateTo}
                        onChange={(e) => handleUIFilterChange('dateTo', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Filters</h4>
                  <div className="flex flex-wrap gap-1 min-h-[2rem] max-h-20 overflow-y-auto">
                    {hasActiveFilters ? (
                      <>
                        {filters.search && (
                          <Badge variant="secondary" className="text-xs h-6 px-2 flex items-center space-x-1 max-w-full">
                            <span className="truncate">Search: "{filters.search}"</span>
                            <button 
                              onClick={() => { 
                                setUiFilters(prev => ({ ...prev, search: '' })); 
                                setFilters(prev => ({ ...prev, search: '' })); 
                              }}
                              className="hover:bg-muted-foreground/20 rounded flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {filters.action !== 'all' && (
                          <Badge variant="secondary" className="text-xs h-6 px-2 flex items-center space-x-1">
                            <span className="truncate">Action: {filters.action}</span>
                            <button 
                              onClick={() => { 
                                setUiFilters(prev => ({ ...prev, action: 'all' })); 
                                setFilters(prev => ({ ...prev, action: 'all' })); 
                              }}
                              className="hover:bg-muted-foreground/20 rounded flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {filters.resourceType !== 'all' && (
                          <Badge variant="secondary" className="text-xs h-6 px-2 flex items-center space-x-1">
                            <span className="truncate">Resource: {filters.resourceType}</span>
                            <button 
                              onClick={() => { 
                                setUiFilters(prev => ({ ...prev, resourceType: 'all' })); 
                                setFilters(prev => ({ ...prev, resourceType: 'all' })); 
                              }}
                              className="hover:bg-muted-foreground/20 rounded flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {/* Add other active filters as needed */}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No active filters</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Logs Table */}
          <div className="overflow-x-auto">
            <ActivityLogsTable
              logs={logs}
              loading={loading}
              onLogClick={handleLogClick}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
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
                  
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = index + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + index;
                    } else {
                      pageNum = pagination.page - 2 + index;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pagination.page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
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