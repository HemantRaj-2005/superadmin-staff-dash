import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Search,
  Filter,
  X,
  Plus,
  Building2,
  MapPin,
  Stethoscope,
  Download,
  Upload,
  Users,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import InstituteTable from "./InstituteTable";
import InstituteDetailModal from "./InstituteDetailModal";
import InstituteCreateModal from "./InstituteCreateModal";
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
import { Skeleton } from "@/components/ui/skeleton";

const InstituteManagement = () => {
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    cities: [],
    states: [],
    hospitalTypes: [],
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const controllerRef = useRef(null);

  const hasActiveFilters =
    searchTerm !== "" ||
    cityFilter !== "all" ||
    stateFilter !== "all" ||
    typeFilter !== "all" ||
    sortBy !== "name" ||
    sortOrder !== "asc";

  const clearFilters = () => {
    setSearchTerm("");
    setCityFilter("all");
    setStateFilter("all");
    setTypeFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Debounce searchTerm -> debouncedSearch
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch stats once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/institutes/stats/overview");
        console.log("Stats API response:", res.data);
        setStats(res.data || null);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const validCities = useMemo(
    () => (filters.cities || []).filter((c) => c && c.trim() !== ""),
    [filters.cities]
  );
  const validStates = useMemo(
    () => (filters.states || []).filter((s) => s && s.trim() !== ""),
    [filters.states]
  );
  const validHospitalTypes = useMemo(
    () => (filters.hospitalTypes || []).filter((t) => t && t.trim() !== ""),
    [filters.hospitalTypes]
  );

  const fetchInstitutes = useCallback(
    async (opts = {}) => {
      setLoading(true);

      // Abort previous request if any
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch {}
      }
      controllerRef.current = new AbortController();

      try {
        const res = await api.get("/institutes", {
          signal: controllerRef.current.signal,
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearch || "",
            city: cityFilter !== "all" ? cityFilter : "",
            state: stateFilter !== "all" ? stateFilter : "",
            type: typeFilter !== "all" ? typeFilter : "",
            sortBy,
            sortOrder,
          },
        });

        // DEBUG: inspect server response shape (remove after stable)
        console.log("fetchInstitutes response.data:", res?.data);

        const data = res?.data || {};

        // Accept common shapes from backend
        const list = data.institutes ?? data.organisations ?? data.items ?? [];
        const filtersPayload = data.filters ??
          data.filter ?? { cities: [], states: [], hospitalTypes: [] };

        const totalFromServer = Number(
          data.total ?? data.totalItems ?? data.totalInstitutes ?? 0
        );
        const totalPagesFromServer = Number(
          data.totalPages ??
            Math.max(1, Math.ceil(totalFromServer / (pagination.limit || 10)))
        );
        const currentPageFromServer = Number(
          data.currentPage ?? data.page ?? pagination.page ?? 1
        );

        setInstitutes(Array.isArray(list) ? list : []);
        setFilters(
          filtersPayload || { cities: [], states: [], hospitalTypes: [] }
        );

        setPagination((prev) => ({
          ...prev,
          page: Math.max(1, currentPageFromServer),
          total: Number.isFinite(totalFromServer) ? totalFromServer : 0,
          totalPages: Math.max(
            1,
            Number.isFinite(totalPagesFromServer) ? totalPagesFromServer : 1
          ),
        }));
      } catch (err) {
        // Suppress expected cancellation errors to avoid noise in console
        const isCancel =
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED" ||
          (err?.message &&
            String(err.message).toLowerCase().includes("canceled"));

        if (!isCancel) {
          console.error("Error fetching institutes:", err);
        } else {
          // optional debug:
          console.debug(
            "fetchInstitutes request canceled (expected during rapid filter changes)."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      cityFilter,
      stateFilter,
      typeFilter,
      sortBy,
      sortOrder,
      pagination.limit,
      pagination.page,
    ]
  );

  // Trigger fetch when inputs change
  useEffect(() => {
    // if filters/search changed and page != 1, reset to page 1 first
    if (
      pagination.page !== 1 &&
      (debouncedSearch ||
        cityFilter !== "all" ||
        stateFilter !== "all" ||
        typeFilter !== "all")
    ) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    fetchInstitutes({ page: pagination.page });
  }, [
    pagination.page,
    debouncedSearch,
    cityFilter,
    stateFilter,
    typeFilter,
    sortBy,
    sortOrder,
    fetchInstitutes,
  ]);

  const handleInstituteClick = (inst) => {
    setSelectedInstitute(inst);
    setIsDetailModalOpen(true);
  };

  const handleCreateInstitute = async (instituteData) => {
    setLoading(true);
    try {
      await api.post("/institutes", instituteData);
      setPagination((prev) => ({ ...prev, page: 1 }));
      await fetchInstitutes({ page: 1 });
      const s = await api.get("/institutes/stats/overview");
      setStats(s.data);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error creating institute:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstitute = async (instituteId, updateData) => {
    setLoading(true);
    try {
      await api.put(`/institutes/${instituteId}`, updateData);
      await fetchInstitutes({ page: pagination.page });
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error("Error updating institute:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstitute = async (instituteId) => {
    setLoading(true);
    try {
      await api.delete(`/institutes/${instituteId}`);
      await fetchInstitutes({ page: pagination.page });
      const s = await api.get("/institutes/stats/overview");
      setStats(s.data);
    } catch (err) {
      console.error("Error deleting institute:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination.totalPages || 1)) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getDisplayCity = (institute) =>
    institute?.City || institute?.city || "N/A";
  const getDisplayState = (institute) =>
    institute?.State || institute?.state || "N/A";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-blue-600" />
            Institutes Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor all healthcare institutes, universities, and
            medical college
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-linear-to-r from-blue-600 to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Institute
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Institutes
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {Number(stats.totalOrganisations ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Cities Covered
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {Number(stats.totalCities ?? 0)}
                  </p>
                  <p className="text-green-200 text-xs mt-1">Urban coverage</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    States Covered
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {Number(stats.totalStates ?? 0)}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    Regional coverage
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {/* Top states & types */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                Top States
              </CardTitle>
              <CardDescription>States with most institutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.stateStats?.slice(0, 5).map((state, i) => (
                  <div
                    key={state._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 flex items-center justify-center text-xs"
                      >
                        {i + 1}
                      </Badge>
                      <span className="text-sm font-medium">{state._id}</span>
                    </div>
                    <Badge variant="secondary">{state.count} institutes</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Stethoscope className="h-4 w-4 mr-2 text-green-600" />
                Top Hospital Types
              </CardTitle>
              <CardDescription>Most common healthcare facility types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.hospitalTypeStats?.slice(0, 5).map((type, i) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">{i + 1}</Badge>
                      <span className="text-sm font-medium truncate">{type._id}</span>
                    </div>
                    <Badge variant="secondary">{type.count} facilities</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </div>
          </div>
          <CardDescription>
            Find institutes by name, location, or hospital type
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-blue-500 transition-colors"
                id="searchInput"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          </div>

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
                {/* City Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    City
                  </label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="border-2 focus:border-blue-500 transition-colors bg-background">
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cities</SelectItem>
                      {validCities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    State
                  </label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="border-2 focus:border-blue-500 transition-colors bg-background">
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All states</SelectItem>
                      {validStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="border-2 focus:border-blue-500 transition-colors bg-background">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {validHospitalTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-2 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Institute Name</SelectItem>
                      <SelectItem value="hospitalType">
                        Hospital Type
                      </SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="createdAt">Date Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    Order
                  </label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="border-2 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display & Pagination Info */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {(() => {
                const total = Number(pagination?.total ?? 0);
                const page = Number(pagination?.page ?? 1);
                const limit = Number(pagination?.limit ?? 10);
                const from = total === 0 ? 0 : (page - 1) * limit + 1;
                const to = Math.min(page * limit, total);
                return (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {from} to {to} of {total.toLocaleString()}{" "}
                    institutes
                  </div>
                );
              })()}
            </div>

            {hasActiveFilters && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filters Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                Healthcare Institutes
              </CardTitle>
              <CardDescription>
                {Number(pagination?.total ?? 0).toLocaleString()} institutes
                across {Number(stats?.totalStates ?? 0)} states
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Page {Number(pagination?.page ?? 1)} of{" "}
              {Number(pagination?.totalPages ?? 1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <InstituteTable
            institutes={institutes}
            loading={loading}
            onInstituteClick={handleInstituteClick}
            onUpdateInstitute={handleUpdateInstitute}
            onDeleteInstitute={handleDeleteInstitute}
            getDisplayCity={getDisplayCity}
            getDisplayState={getDisplayState}
          />

          {Number(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between p-6 border-t">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {Number(pagination?.page ?? 1)} of{" "}
                {Number(pagination?.totalPages ?? 1)} •{" "}
                {Number(pagination?.total ?? 0).toLocaleString()} total
                institutes
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Number(pagination?.page ?? 1) - 1)
                      }
                      className={
                        Number(pagination?.page ?? 1) === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer border-2"
                      }
                    />
                  </PaginationItem>

                  {[
                    ...Array(Math.min(5, Number(pagination?.totalPages ?? 1))),
                  ].map((_, idx) => {
                    const totalPages = Number(pagination?.totalPages ?? 1);
                    let start = Math.max(
                      1,
                      Math.min(
                        Number(pagination?.page ?? 1) - 2,
                        totalPages - 4
                      )
                    );
                    start = Math.max(1, start);
                    const pageNum = start + idx;
                    if (pageNum > totalPages) return null;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={Number(pagination?.page ?? 1) === pageNum}
                          className="cursor-pointer border-2"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Number(pagination?.page ?? 1) + 1)
                      }
                      className={
                        Number(pagination?.page ?? 1) ===
                        Number(pagination?.totalPages ?? 1)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer border-2"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {isDetailModalOpen && selectedInstitute && (
        <InstituteDetailModal
          institute={selectedInstitute}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={handleUpdateInstitute}
          onDelete={handleDeleteInstitute}
          getDisplayCity={getDisplayCity}
          getDisplayState={getDisplayState}
        />
      )}

      {isCreateModalOpen && (
        <InstituteCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateInstitute}
        />
      )}
    </div>
  );
};

export default InstituteManagement;
