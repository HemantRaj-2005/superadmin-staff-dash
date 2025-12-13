import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Plus, Calendar, Download } from "lucide-react";
import EventTable from "./EventTable";
import EventDetailModal from "./EventDetailModal";
import EventStats from "./EventStats";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Separate search input and search term
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState({
    event_type: "all",
    status: "all",
    is_paid: "all",
    date_range: "",
  });
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [availableFilters, setAvailableFilters] = useState({
    eventTypes: [],
    statusTypes: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Track last logged search to avoid duplicates
  const lastLoggedSearchRef = useRef({
    search: '',
    filters: {},
    page: 1
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchTerm, filters]);

  useEffect(() => {
    // Update the date_range filter when dateRange changes
    if (dateRange.from && dateRange.to) {
      const fromStr = format(dateRange.from, "yyyy-MM-dd");
      const toStr = format(dateRange.to, "yyyy-MM-dd");
      setFilters((prev) => ({ ...prev, date_range: `${fromStr}_${toStr}` }));
    } else if (!dateRange.from && !dateRange.to) {
      setFilters((prev) => ({ ...prev, date_range: "" }));
    }
  }, [dateRange]);

  // Function to log search activity
  const logSearchActivity = async (currentSearchTerm, currentFilters, resultsCount = 0) => {
    try {
      const currentSearchData = {
        search: currentSearchTerm,
        filters: { ...currentFilters },
        page: pagination.page
      };

      const lastLogged = lastLoggedSearchRef.current;
      
      // Skip if same search was just logged
      if (
        currentSearchData.search === lastLogged.search &&
        JSON.stringify(currentSearchData.filters) === JSON.stringify(lastLogged.filters) &&
        currentSearchData.page === lastLogged.page
      ) {
        return;
      }

      // Build description based on active filters
      let description = 'Searched for events';
      const activeFilters = [];
      
      if (currentSearchTerm) {
        activeFilters.push(`search: "${currentSearchTerm}"`);
      }
      if (currentFilters.event_type && currentFilters.event_type !== 'all') {
        activeFilters.push(`event type: "${currentFilters.event_type}"`);
      }
      if (currentFilters.status && currentFilters.status !== 'all') {
        activeFilters.push(`status: "${currentFilters.status}"`);
      }
      if (currentFilters.is_paid && currentFilters.is_paid !== 'all') {
        activeFilters.push(`payment: ${currentFilters.is_paid === 'true' ? 'Paid' : 'Free'}`);
      }
      if (currentFilters.date_range) {
        const [from, to] = currentFilters.date_range.split('_');
        activeFilters.push(`date range: ${format(new Date(from), 'MMM dd, yyyy')} - ${format(new Date(to), 'MMM dd, yyyy')}`);
      }
      
      if (activeFilters.length > 0) {
        description += ` with ${activeFilters.join(', ')}`;
      }

      await api.post("/activity-logs", {
        action: "EVENT_SEARCH",
        description: description,
        module: "Event Management",
        metadata: {
          searchTerm: currentSearchTerm,
          eventType: currentFilters.event_type,
          status: currentFilters.status,
          isPaid: currentFilters.is_paid,
          dateRange: currentFilters.date_range,
          resultsCount: resultsCount,
          totalResults: pagination.total,
          page: pagination.page,
          timestamp: new Date().toISOString(),
        }
      });

      // Update last logged search
      lastLoggedSearchRef.current = { ...currentSearchData };
    } catch (error) {
      console.error("Error logging search activity:", error);
      // Don't show error to user
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Convert filter values for API - use empty string for 'all' values
      const apiParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        event_type: filters.event_type === "all" ? "" : filters.event_type,
        status: filters.status === "all" ? "" : filters.status,
        is_paid: filters.is_paid === "all" ? "" : filters.is_paid,
        date_range: filters.date_range,
      };

      const response = await api.get("/events", { params: apiParams });

      setEvents(response.data.events);
      setAvailableFilters(response.data.filters);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));

      // Log search activity after successful fetch
      const hasActiveSearch = 
        searchTerm.trim() !== '' || 
        filters.event_type !== 'all' || 
        filters.status !== 'all' || 
        filters.is_paid !== 'all' || 
        filters.date_range !== '';

      if (hasActiveSearch) {
        logSearchActivity(searchTerm, filters, response.data.events.length);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // This would be called separately for stats - left as placeholder
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilters({
      event_type: "all",
      status: "all",
      is_paid: "all",
      date_range: "",
    });
    setDateRange({ from: undefined, to: undefined });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleUpdateEvent = async (eventId, updateData) => {
    console.log("Update Data:", updateData);
    try {
      const response = await api.put(`/events/${eventId}`, updateData);
      console.log("Update Response:", response);
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    filters.event_type !== "all" ||
    filters.status !== "all" ||
    filters.is_paid !== "all" ||
    filters.date_range !== "";

  const formatDateRangeDisplay = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
        dateRange.to,
        "MMM dd, yyyy"
      )}`;
    }
    return "Select date range";
  };

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
      if (typeof value === "object") value = JSON.stringify(value);
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
        dataToExport = events;
      } else if (mode === "all") {
        // Try to fetch all events. NOTE: backend must support a large limit or provide an export endpoint.
        // We reuse current filters so export matches filtered results.
        const apiParams = {
          page: 1,
          limit: pagination.total || 100000, // if backend supports a large limit
          search: searchTerm,
          event_type: filters.event_type === "all" ? "" : filters.event_type,
          status: filters.status === "all" ? "" : filters.status,
          is_paid: filters.is_paid === "all" ? "" : filters.is_paid,
          date_range: filters.date_range,
        };

        const resp = await api.get("/events", { params: apiParams });
        dataToExport = resp.data.events || [];
      }

      if (!dataToExport || dataToExport.length === 0) {
        alert("No events to export.");
        return;
      }

      // Optional: define a column order you prefer, otherwise columns come from objects' keys
      // const columns = ["id", "title", "start_date", "end_date", "location", "event_type", "status", "is_paid"];
      const columns = null;

      const csv = convertObjectsToCSV(dataToExport, columns);
      const filename = `events_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
      downloadCSV(csv, filename);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export events. See console for details.");
    }
  };

  // ---------------- End CSV Export Helpers ----------------

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Manage and organize all events on the platform
          </p>
        </div>

        <div className="flex items-center space-x-2">
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
                    handleExport("visible");
                    // close popover
                    document.body.click();
                  }}
                >
                  Export Visible ({events.length})
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
{/* 
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button> */}
        </div>
      </div>

      {/* Event Statistics */}
      <EventStats />

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>
                  {pagination.total} total events • Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {events.length} showing
            </Badge>
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
            <CardContent>
              {/* Search Input with Button */}
              <div className="mb-4 space-y-2">
                <label className="text-sm font-medium">Search Events</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Title, description, location..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6"
                  >
                    {loading && searchTerm === searchInput ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground">
                    Current search: <span className="font-medium text-foreground">"{searchTerm}"</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Event Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type</label>
                  <Select
                    value={filters.event_type}
                    onValueChange={(value) => handleFilterChange("event_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {availableFilters.eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {availableFilters.statusTypes.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Paid/Free */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Type</label>
                  <Select
                    value={filters.is_paid}
                    onValueChange={(value) => handleFilterChange("is_paid", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Paid</SelectItem>
                      <SelectItem value="false">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDateRangeDisplay()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className="p-3"
                      />
                      <div className="flex items-center justify-between p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          Clear
                        </Button>
                        <Button size="sm" onClick={() => document.body.click()}>
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Active Filters & Clear Button */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex flex-wrap gap-2">
                  {hasActiveFilters && (
                    <>
                      {searchTerm && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>Search: "{searchTerm}"</span>
                          <button onClick={handleClearSearch}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.event_type !== "all" && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>Type: {filters.event_type}</span>
                          <button onClick={() => handleFilterChange("event_type", "all")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.status !== "all" && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>Status: {filters.status}</span>
                          <button onClick={() => handleFilterChange("status", "all")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.is_paid !== "all" && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>Payment: {filters.is_paid === "true" ? "Paid" : "Free"}</span>
                          <button onClick={() => handleFilterChange("is_paid", "all")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.date_range && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <span>Date: {formatDateRangeDisplay()}</span>
                          <button
                            onClick={() => {
                              setDateRange({ from: undefined, to: undefined });
                              handleFilterChange("date_range", "");
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <EventTable
            events={events}
            loading={loading}
            onEventClick={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
          />

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} events
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
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

      {/* Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
};

export default EventManagement;