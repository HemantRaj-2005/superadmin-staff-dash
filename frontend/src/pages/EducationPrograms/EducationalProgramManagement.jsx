import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Plus, GraduationCap, BookOpen, Users, ChevronRight } from 'lucide-react';
import ProgramCard from './ProgramCard';
import SpecializationsModal from './SpecilizationModal';
import EducationalProgramCreateModal from './EducationalProgramCreateModal';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const EducationalProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isSpecializationsModalOpen, setIsSpecializationsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // For input field
  const [searchTerm, setSearchTerm] = useState(''); // For actual search
  const [programInput, setProgramInput] = useState(''); // For program filter input
  const [programFilter, setProgramFilter] = useState(''); // For actual program filter
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, // 6 programs per page
    total: 0,
    totalPages: 0
  });
  
  // Track last logged search to avoid duplicates
  const lastLoggedSearchRef = useRef({
    search: '',
    program: '',
    page: 1
  });

  useEffect(() => {
    fetchPrograms();
  }, [pagination.page, searchTerm, programFilter]);

  // Function to log search activity
  const logSearchActivity = async (searchQuery, programQuery, resultsCount = 0) => {
    try {
      const currentSearchData = {
        search: searchQuery,
        program: programQuery,
        page: pagination.page
      };

      const lastLogged = lastLoggedSearchRef.current;
      
      // Skip if same search was just logged
      if (
        currentSearchData.search === lastLogged.search &&
        currentSearchData.program === lastLogged.program &&
        currentSearchData.page === lastLogged.page
      ) {
        return;
      }

      // Build description based on active filters
      let description = 'Searched for educational programs';
      const activeFilters = [];
      
      if (searchQuery) {
        activeFilters.push(`search: "${searchQuery}"`);
      }
      if (programQuery) {
        activeFilters.push(`program: "${programQuery}"`);
      }
      
      if (activeFilters.length > 0) {
        description += ` with ${activeFilters.join(', ')}`;
      }

      await api.post("/activity-logs", {
        action: "SEARCH_EDUCATIONAL_PROGRAMS",
        description: description,
        module: "Educational Program Management",
        metadata: {
          searchTerm: searchQuery,
          programFilter: programQuery,
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

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      console.log('Fetching GROUPED programs with params:', {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        program: programFilter
      });

      // Use the new grouped endpoint
      const response = await api.get('/educational-programs/grouped/programs', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          program: programFilter
        }
      });
      
      console.log('GROUPED API Response:', response.data);
      
      setPrograms(response.data.programs);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));

      // Log search activity after successful fetch
      // Only log if there are active search or filters
      const hasActiveSearch = searchTerm.trim() !== '' || programFilter.trim() !== '';
      
      if (hasActiveSearch) {
        logSearchActivity(searchTerm, programFilter, response.data.programs.length);
      }
    } catch (error) {
      console.error('Error fetching grouped educational programs:', error);
      // Fallback to regular endpoint if grouped endpoint fails
      try {
        console.log('Falling back to regular endpoint...');
        const fallbackResponse = await api.get('/educational-programs', {
          params: {
            page: pagination.page,
            limit: pagination.limit * 10, // Get more documents to group
            search: searchTerm,
            program: programFilter
          }
        });
        
        // Group manually as fallback
        const grouped = groupProgramsManually(fallbackResponse.data.programs);
        const paginatedGroups = Object.values(grouped).slice(
          (pagination.page - 1) * pagination.limit,
          pagination.page * pagination.limit
        );
        
        setPrograms(paginatedGroups);
        setPagination(prev => ({
          ...prev,
          total: Object.keys(grouped).length,
          totalPages: Math.ceil(Object.keys(grouped).length / pagination.limit)
        }));

        // Log search activity for fallback
        const hasActiveSearch = searchTerm.trim() !== '' || programFilter.trim() !== '';
        if (hasActiveSearch) {
          logSearchActivity(searchTerm, programFilter, paginatedGroups.length);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback grouping function
  const groupProgramsManually = (programsList) => {
    const grouped = {};
    
    programsList.forEach(program => {
      const programName = program.Program;
      
      if (!grouped[programName]) {
        grouped[programName] = {
          programName: programName,
          specializations: [],
          totalSpecializations: 0,
          latestUpdate: program.updatedAt,
          createdAt: program.createdAt
        };
      }
      
      grouped[programName].specializations.push({
        _id: program._id,
        Specialization: program.Specialization,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        isDeleted: program.isDeleted,
        deletedAt: program.deletedAt
      });
      
      grouped[programName].totalSpecializations = grouped[programName].specializations.length;
      
      // Update latest update time
      if (new Date(program.updatedAt) > new Date(grouped[programName].latestUpdate)) {
        grouped[programName].latestUpdate = program.updatedAt;
      }
    });
    
    return grouped;
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setProgramFilter(programInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setProgramInput('');
    setSearchTerm('');
    setProgramFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setProgramInput('');
    setSearchTerm('');
    setProgramFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle Enter key press in search inputs
  const handleKeyPress = (e, inputType) => {
    if (e.key === 'Enter') {
      if (inputType === 'search' && searchInput.trim() !== '') {
        handleSearch();
      } else if (inputType === 'program' && programInput.trim() !== '') {
        handleSearch();
      }
    }
  };

  const handleProgramClick = (programData) => {
    console.log('Clicked program:', programData);
    setSelectedProgram(programData);
    setIsSpecializationsModalOpen(true);
  };

  const handleCreateProgram = async (programData) => {
    try {
      await api.post('/educational-programs', programData);
      fetchPrograms(); // Refresh the list
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating educational program:', error);
      throw error;
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      await api.delete(`/educational-programs/${programId}`);
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error('Error deleting educational program:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = searchTerm || programFilter;

  // Calculate statistics
  const totalPrograms = pagination.total;
  const totalSpecializations = programs.reduce((sum, program) => sum + program.totalSpecializations, 0);
  
  // Get programs with most specializations for popular section
  const popularPrograms = [...programs]
    .sort((a, b) => b.totalSpecializations - a.totalSpecializations)
    .slice(0, 3);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Educational Programs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all academic programs and their specializations
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Programs</p>
                <p className="text-3xl font-bold mt-1">{totalPrograms}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Specializations</p>
                <p className="text-3xl font-bold mt-1">{totalSpecializations}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Current Page</p>
                <p className="text-3xl font-bold mt-1">{pagination.page}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">of {pagination.totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Results</p>
                <p className="text-3xl font-bold mt-1">{programs.length}</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Programs & Specializations
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by program name or specialization..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'search')}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    {searchInput && (
                      <button
                        onClick={() => setSearchInput('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Program
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter program name..."
                      value={programInput}
                      onChange={(e) => setProgramInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'program')}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    {programInput && (
                      <button
                        onClick={() => setProgramInput('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                {loading && (searchTerm === searchInput || programFilter === programInput) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Current Search Display */}
          {(searchTerm || programFilter) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Current Search</p>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {programFilter && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    Program: "{programFilter}"
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
                  <span>Search: "{searchTerm}"</span>
                  <button onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} className="hover:text-blue-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {programFilter && (
                <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                  <span>Program: "{programFilter}"</span>
                  <button onClick={() => {
                    setProgramInput('');
                    setProgramFilter('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }} className="hover:text-green-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Programs */}
      {!loading && popularPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              Most Popular Programs
            </CardTitle>
            <CardDescription>
              Programs with the most specializations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {popularPrograms.map((program) => (
                <div 
                  key={program.programName}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProgramClick(program)}
                >
                  <span className="font-medium text-purple-900 dark:text-purple-100">{program.programName}</span>
                  <Badge className="bg-purple-500 text-white">{program.totalSpecializations}</Badge>
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programs Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Programs</CardTitle>
              <CardDescription>
                {totalPrograms} programs with {totalSpecializations} specializations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-8 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {hasActiveFilters ? 'No programs match your search' : 'No programs found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first educational program."
                }
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Program
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <ProgramCard
                    key={program.programName}
                    programName={program.programName}
                    specializations={program.specializations}
                    totalSpecializations={program.totalSpecializations}
                    latestUpdate={program.latestUpdate}
                    onProgramClick={() => handleProgramClick(program)}
                    onDeleteProgram={handleDeleteProgram}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} programs
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Specializations Modal */}
      {isSpecializationsModalOpen && selectedProgram && (
        <SpecializationsModal
          program={selectedProgram}
          onClose={() => setIsSpecializationsModalOpen(false)}
          onAddSpecialization={() => {
            setIsSpecializationsModalOpen(false);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* Create Program Modal */}
      {isCreateModalOpen && (
        <EducationalProgramCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProgram}
        />
      )}
    </div>
  );
};

export default EducationalProgramManagement;