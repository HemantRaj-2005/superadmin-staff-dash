// src/pages/School/SchoolManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import SchoolTable from "./SchoolTable";
import SchoolDetailModal from "./SchoolDetailModal";
import SchoolForm from "./SchoolForm";
import SchoolStats from "./SchoolStats";
import BulkImportModal from "./BulkImportModal";
import api from "@/services/api";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  Plus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // For the input field
  const [searchTerm, setSearchTerm] = useState(""); // For actual search
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    state: "all",
    district: "all",
    sortBy: "school_name",
    sortOrder: "asc",
  });
  const [availableFilters, setAvailableFilters] = useState({
    states: [],
    districts: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Search states for dropdowns
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  // Track last logged search to avoid duplicates
  const lastLoggedSearchRef = useRef({
    search: "",
    state: "",
    district: "",
    sortBy: "",
    sortOrder: "",
    page: 1,
  });

  const { checkPermission } = useAuth();

  useEffect(() => {
    fetchSchools();
    fetchStats();
  }, [pagination.page, searchTerm, filters]);

  // Function to log search activity
  const logSearchActivity = async (currentFilters, resultsCount = 0) => {
    try {
      const currentSearchData = {
        search: searchTerm,
        state: currentFilters.state,
        district: currentFilters.district,
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
        page: pagination.page,
      };

      const lastLogged = lastLoggedSearchRef.current;

      // Skip if same search was just logged
      if (
        currentSearchData.search === lastLogged.search &&
        currentSearchData.state === lastLogged.state &&
        currentSearchData.district === lastLogged.district &&
        currentSearchData.sortBy === lastLogged.sortBy &&
        currentSearchData.sortOrder === lastLogged.sortOrder &&
        currentSearchData.page === lastLogged.page
      ) {
        return;
      }

      // Build description based on active filters
      let description = "Searched for schools";
      const activeFilters = [];

      if (searchTerm) {
        activeFilters.push(`search: "${searchTerm}"`);
      }
      if (currentFilters.state && currentFilters.state !== "all") {
        activeFilters.push(`state: "${currentFilters.state}"`);
      }
      if (currentFilters.district && currentFilters.district !== "all") {
        activeFilters.push(`district: "${currentFilters.district}"`);
      }
      if (currentFilters.sortBy) {
        activeFilters.push(
          `sorted by: ${currentFilters.sortBy} ${currentFilters.sortOrder}`
        );
      }

      if (activeFilters.length > 0) {
        description += ` with ${activeFilters.join(", ")}`;
      }

      await api.post("/activity-logs", {
        action: "SCHOOL_SEARCH",
        description: description,
        module: "School Management",
        metadata: {
          searchTerm: searchTerm,
          state: currentFilters.state,
          district: currentFilters.district,
          sortBy: currentFilters.sortBy,
          sortOrder: currentFilters.sortOrder,
          resultsCount: resultsCount,
          totalResults: pagination.total,
          page: pagination.page,
          timestamp: new Date().toISOString(),
        },
      });

      // Update last logged search
      lastLoggedSearchRef.current = { ...currentSearchData };
    } catch (error) {
      console.error("Error logging search activity:", error);
      // Don't show error to user
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Convert filter values for API (convert 'all' to empty string)
      const apiFilters = {
        ...filters,
        state: filters.state === "all" ? "" : filters.state,
        district: filters.district === "all" ? "" : filters.district,
        search: searchTerm,
      };

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...apiFilters,
      };

      const response = await api.get("/schools/", { params });

      setSchools(response.data.schools);
      setAvailableFilters(response.data.filters);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));

      // Log search activity after successful fetch
      // Only log if there are active filters or search term
      const hasActiveSearch =
        searchTerm.trim() !== "" ||
        filters.state !== "all" ||
        filters.district !== "all" ||
        filters.sortBy !== "school_name" ||
        filters.sortOrder !== "asc";

      if (hasActiveSearch) {
        logSearchActivity(filters, response.data.schools.length);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // This would be called separately for stats
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Reset district when state changes
    if (key === "state" && value === "all") {
      setFilters((prev) => ({ ...prev, district: "all" }));
    }
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

  // Handle clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilters({
      state: "all",
      district: "all",
      sortBy: "school_name",
      sortOrder: "asc",
    });
    setStateSearch("");
    setDistrictSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSchoolClick = (school) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const handleCreateSchool = () => {
    setSelectedSchool(null);
    setIsFormOpen(true);
  };

  const handleEditSchool = (school) => {
    setSelectedSchool(school);
    setIsFormOpen(true);
  };

  const handleSaveSchool = async (schoolData) => {
    try {
      if (selectedSchool) {
        // Update existing school
        await api.put(`/schools/${selectedSchool._id}`, schoolData);
      } else {
        // Create new school
        await api.post("/schools", schoolData);
      }

      setIsFormOpen(false);
      setSelectedSchool(null);
      fetchSchools(); // Refresh the list
    } catch (error) {
      console.error("Error saving school:", error);
      throw error;
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await api.delete(`/schools/${schoolId}`);
        fetchSchools(); // Refresh the list
      } catch (error) {
        console.error("Error deleting school:", error);
      }
    }
  };

  const exportSchools = async () => {
    try {
      const response = await api.get("/schools/export/data", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `schools-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting schools:", error);
    }
  };

  const handleBulkImport = async (schoolsData) => {
    try {
      const response = await api.post("/schools/bulk-import", {
        schools: schoolsData,
      });
      alert(
        `Bulk import completed: ${response.data.successful} successful, ${response.data.failed} failed`
      );
      setIsImportOpen(false);
      fetchSchools(); // Refresh the list

      if (response.data.failed > 0) {
        console.error("Import errors:", response.data.errors);
      }
    } catch (error) {
      console.error("Error in bulk import:", error);
      alert(error.response?.data?.message || "Error importing schools");
    }
  };

  // Filter states based on search
  const filteredStates = availableFilters.states.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter districts based on search
  const filteredDistricts = availableFilters.districts.filter((district) =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filters.state !== "all" ||
    filters.district !== "all" ||
    filters.sortBy !== "school_name" ||
    filters.sortOrder !== "asc";

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            School Management
          </h1>
          <p className="text-muted-foreground">
            Manage schools and their information across the platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* {checkPermission('schools', 'export') && (
            <Button
              onClick={exportSchools}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )} */}
          {checkPermission("schools", "create") && (
            <Button
              onClick={() => setIsImportOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
          )}
          {checkPermission("schools", "create") && (
            <Button
              onClick={handleCreateSchool}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add School
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* School Statistics */}
      <SchoolStats />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </div>
          </div>
          <CardDescription>
            Filter and search through the school database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, district, state, or UDISE code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full pl-10 pr-10 h-10"
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
              className="px-4 gap-2 h-10"
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

            <Button onClick={handleSearch} disabled={loading} className="px-6 h-10">
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
              Current search:{" "}
              <span className="font-medium text-foreground">
                "{searchTerm}"
              </span>
            </p>
          )}

          {/* Advanced Filters Section - SIMPLE AND CLICKABLE */}
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

              {/* Simple, consistent filter blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* State Filter with Search */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    State
                  </label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) =>
                      handleFilterChange("state", value)
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input
                          placeholder="Search states..."
                          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <SelectItem value="all">All States</SelectItem>
                      {filteredStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                      {filteredStates.length === 0 && (
                        <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                          No states found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* District Filter with Search */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    District
                  </label>
                  <Select
                    value={filters.district}
                    onValueChange={(value) =>
                      handleFilterChange("district", value)
                    }
                    disabled={!filters.state || filters.state === "all"}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue
                        placeholder={
                          !filters.state || filters.state === "all"
                            ? "Select state first"
                            : "All Districts"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input
                          placeholder="Search districts..."
                          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <SelectItem value="all">All Districts</SelectItem>
                      {filteredDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value)
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_name">School Name</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="udise_code">UDISE Code</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">
                    Order
                  </label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) =>
                      handleFilterChange("sortOrder", value)
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Actions - Full width at bottom */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1 h-9"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 h-9"
                >
                  {loading && searchTerm === searchInput ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  ) : (
                    "Apply Filters"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/20 rounded-lg border">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Active Filters
              </Badge>

              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={handleClearSearch}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.state !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  State: {filters.state}
                  <button
                    onClick={() => handleFilterChange("state", "all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.district !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  District: {filters.district}
                  <button
                    onClick={() => handleFilterChange("district", "all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.sortBy !== "school_name" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Sort: {filters.sortBy} ({filters.sortOrder})
                  <button
                    onClick={() => {
                      handleFilterChange("sortBy", "school_name");
                      handleFilterChange("sortOrder", "asc");
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto h-7 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>
            Manage all schools in the system. Click on a school to view details.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <SchoolTable
            schools={schools}
            loading={loading}
            onSchoolClick={handleSchoolClick}
            onEditSchool={
              checkPermission("schools", "edit") ? handleEditSchool : null
            }
            onDeleteSchool={
              checkPermission("schools", "delete") ? handleDeleteSchool : null
            }
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={
                          pagination.page === page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                        className="w-10 h-10 p-0"
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Page {pagination.page} of {pagination.totalPages} •{" "}
              {pagination.total} total schools
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {/* School Detail Modal */}
      {isModalOpen && selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setIsModalOpen(false)}
          onEdit={
            checkPermission("schools", "edit")
              ? () => {
                  setIsModalOpen(false);
                  handleEditSchool(selectedSchool);
                }
              : null
          }
        />
      )}

      {/* School Form Modal */}
      {isFormOpen && (
        <SchoolForm
          school={selectedSchool}
          onSave={handleSaveSchool}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedSchool(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {isImportOpen && (
        <BulkImportModal
          onImport={handleBulkImport}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  );
};

export default SchoolManagement;