// components/ActivityLogs.js (responsive compact filters version)
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  BarChart3,
  AlertCircle,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ActivityLogsTable from "./ActivityLogsTable";
import ActivityLogDetailModal from "./ActivityLogDetailModal";
import api from "../../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Separate search input and search term
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    action: "all",
    resourceType: "all",
    adminId: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
    deviceType: "all",
    os: "all",
    browser: "all",
  });

  const [availableFilters, setAvailableFilters] = useState({
    actions: [],
    resourceTypes: [],
    admins: [],
    deviceTypes: [],
    os: [],
    browsers: [],
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { admin } = useAuth();

  // Fetch when filters (applied) or page changes
  useEffect(() => {
    if (admin?.role?.name === "Super Admin") {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, admin]);

  // Keep uiFilters synced whenever filters changes (so UI reflects programmatic resets or updates)
  // Keep searchInput synced if filters change externally
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Convert filter values for API
      const apiParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        action: filters.action === "all" ? "" : filters.action,
        resourceType:
          filters.resourceType === "all" ? "" : filters.resourceType,
        adminId: filters.adminId === "all" ? "" : filters.adminId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        deviceType: filters.deviceType === "all" ? "" : filters.deviceType,
        os: filters.os === "all" ? "" : filters.os,
        browser: filters.browser === "all" ? "" : filters.browser,
      };

      const response = await api.get("/activity-logs", { params: apiParams });

      setLogs(response.data.logs || []);
      setAvailableFilters({
        actions: response.data.filters?.actions || [],
        resourceTypes: response.data.filters?.resourceTypes || [],
        admins: response.data.filters?.admins || [],
        deviceTypes: response.data.filters?.deviceTypes || [],
        os: response.data.filters?.os || [],
        browsers: response.data.filters?.browsers || [],
      });

      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update uiFilters when inputs change (does NOT trigger fetch)
  // Update uiFilters when inputs change (does NOT trigger fetch)
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange("search", searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleFilterChange("search", "");
  };

  const clearFilters = () => {
    const cleared = {
      action: "all",
      resourceType: "all",
      adminId: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
      deviceType: "all",
      os: "all",
      browser: "all",
    };
    setFilters(cleared);
    setSearchInput("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const handleLogClick = async (log) => {
    try {
      const response = await api.get(`/activity-logs/${log._id}`);
      setSelectedLog(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching log details:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "dateFrom" || key === "dateTo" || key === "search") {
      return value !== "";
    }
    return value !== "all";
  });

  // Fallback options
  const defaultDeviceTypes = ["desktop", "mobile", "tablet"];
  const defaultOS = ["Windows", "Mac OS", "Linux", "Android", "iOS"];
  const defaultBrowsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];

  if (admin?.role?.name !== "Super Admin") {
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
          action: filters.action === "all" ? "" : filters.action,
          resourceType:
            filters.resourceType === "all" ? "" : filters.resourceType,
          adminId: filters.adminId === "all" ? "" : filters.adminId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          deviceType: filters.deviceType === "all" ? "" : filters.deviceType,
          os: filters.os === "all" ? "" : filters.os,
          browser: filters.browser === "all" ? "" : filters.browser,
        };

        const resp = await api.get("/activity-logs", { params: apiParams });
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
      const filename = `activity_logs_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`;
      downloadCSV(csv, filename);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export logs. See console for details.");
    }
  };

  // ---------------- End CSV Export Helpers ----------------

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Activity Logs
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base truncate">
            Monitor all admin activities and changes
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            {pagination.total} total
          </Badge>

          {/* Export Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 whitespace-nowrap"
              >
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
                    handleExport("visible");
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
                    await handleExport("all");
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
                <CardTitle className="text-base sm:text-lg truncate">
                  Activity Logs
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Page {pagination.page} of {pagination.totalPages} •{" "}
                  {logs.length} showing
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Compact Filters Section */}
          {/* Search and Filters Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search descriptions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-1 h-5 px-1.5 min-w-[1.25rem]"
                >
                  !
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
            </Button>

            <Button onClick={handleSearch} disabled={loading} className="px-6">
              {loading && filters.search === searchInput ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {filters.search && (
            <p className="text-sm text-muted-foreground">
              Current search:{" "}
              <span className="font-medium text-foreground">
                "{filters.search}"
              </span>
            </p>
          )}

          {/* Advanced Filters Section */}
          {showFilters && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Advanced Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" /> Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Action Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Action
                  </label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) =>
                      handleFilterChange("action", value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {availableFilters.actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resource Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Resource
                  </label>
                  <Select
                    value={filters.resourceType}
                    onValueChange={(value) =>
                      handleFilterChange("resourceType", value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {availableFilters.resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Admin
                  </label>
                  <Select
                    value={filters.adminId}
                    onValueChange={(value) =>
                      handleFilterChange("adminId", value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admins</SelectItem>
                      {availableFilters.admins.map((adminOption) => (
                        <SelectItem
                          key={adminOption._id}
                          value={adminOption._id}
                        >
                          <span className="truncate">{adminOption.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="bg-background"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="bg-background"
                  />
                </div>

                {/* Device Type */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Device Type
                  </label>
                  <Select
                    value={filters.deviceType}
                    onValueChange={(value) =>
                      handleFilterChange("deviceType", value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {(availableFilters.deviceTypes.length
                        ? availableFilters.deviceTypes
                        : defaultDeviceTypes
                      ).map((dt) => (
                        <SelectItem key={dt} value={dt}>
                          {dt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* OS */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    OS
                  </label>
                  <Select
                    value={filters.os}
                    onValueChange={(value) => handleFilterChange("os", value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All OS</SelectItem>
                      {(availableFilters.os.length
                        ? availableFilters.os
                        : defaultOS
                      ).map((osOption) => (
                        <SelectItem key={osOption} value={osOption}>
                          {osOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Browser */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Browser
                  </label>
                  <Select
                    value={filters.browser}
                    onValueChange={(value) =>
                      handleFilterChange("browser", value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Browsers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Browsers</SelectItem>
                      {(availableFilters.browsers.length
                        ? availableFilters.browsers
                        : defaultBrowsers
                      ).map((br) => (
                        <SelectItem key={br} value={br}>
                          {br}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display & Results Count */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {/* Maybe show count here? */}
            </div>

            {hasActiveFilters && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filters Active
              </Badge>
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} activities
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        pagination.page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(pagination.totalPages, 5))].map(
                    (_, index) => {
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
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={
                        pagination.page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
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
