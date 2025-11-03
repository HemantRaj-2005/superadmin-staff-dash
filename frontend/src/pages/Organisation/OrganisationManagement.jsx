import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  Building2, 
  Globe, 
  Users, 
  BarChart3,
  Download,
  Upload,
  Calendar,
  MapPin,
  Factory
} from 'lucide-react';
import OrganisationTable from './OrganisationTable';
import OrganisationDetailModal from './OrganisationDetailModal';
import OrganisationCreateModal from './OrganisationCreateModal';
import api from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const OrganisationManagement = () => {
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ industries: [], types: [], countries: [] });
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchOrganisations();
    fetchStats();
  }, [pagination.page, searchTerm, industryFilter, typeFilter, countryFilter, sortBy, sortOrder]);

  const fetchOrganisations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organisations', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          industry: industryFilter !== 'all' ? industryFilter : '',
          type: typeFilter !== 'all' ? typeFilter : '',
          country: countryFilter !== 'all' ? countryFilter : '',
          sortBy,
          sortOrder
        }
      });
      
      setOrganisations(response.data.organisations);
      setFilters(response.data.filters);
      setStatistics(response.data.statistics);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));

    } catch (error) {
      console.error('Error fetching organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/organisations/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching organisation stats:', error);
    }
  };

  const handleOrganisationClick = (organisation) => {
    setSelectedOrganisation(organisation);
    setIsDetailModalOpen(true);
  };

  const handleCreateOrganisation = async (organisationData) => {
    try {
      await api.post('/organisations', organisationData);
      fetchOrganisations(); // Refresh the list
      fetchStats(); // Refresh stats
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating organisation:', error);
      throw error;
    }
  };

  const handleUpdateOrganisation = async (organisationId, updateData) => {
    try {
      await api.put(`/organisations/${organisationId}`, updateData);
      fetchOrganisations(); // Refresh the list
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Error updating organisation:', error);
      throw error;
    }
  };

  const handleDeleteOrganisation = async (organisationId) => {
    try {
      await api.delete(`/organisations/${organisationId}`);
      fetchOrganisations(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting organisation:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('all');
    setTypeFilter('all');
    setCountryFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = searchTerm || industryFilter !== 'all' || typeFilter !== 'all' || countryFilter !== 'all';

  const getCountryFlag = (countryCode) => {
    const flags = {
      'United States': '🇺🇸', 'India': 'IN', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Japan': '🇯🇵',
      'China': '🇨🇳', 'Brazil': '🇧🇷', 'Russia': '🇷🇺', 'South Africa': '🇿🇦'
    };
    return flags[countryCode] || '';
  };

  const formatEstablishmentYear = (year) => {
    if (year === null || year === undefined || year === '') return 'N/A';
    if (typeof year === 'boolean') return year ? 'Yes' : 'No';
    return year.toString();
  };

  // Filter out empty/null values from filters
  const validIndustries = filters.industries?.filter(industry => industry && industry.trim() !== '') || [];
  const validTypes = filters.types?.filter(type => type && type.trim() !== '') || [];
  const validCountries = filters.countries?.filter(country => country && country.trim() !== '') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-blue-600" />
            Organisation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and analyze all organisations with comprehensive insights and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button> */}
          {/* <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button> */}
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Organisation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Organisations</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalOrganisations.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1">Across all industries</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Industries</p>
                  <p className="text-3xl font-bold mt-1">{stats.industriesCount}</p>
                  <p className="text-green-200 text-xs mt-1">Diverse sectors</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Factory className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Countries</p>
                  <p className="text-3xl font-bold mt-1">{stats.countriesCount}</p>
                  <p className="text-purple-200 text-xs mt-1">Global presence</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Recent Growth</p>
                  <p className="text-3xl font-bold mt-1">{stats.recentOrganisations}</p>
                  <p className="text-orange-200 text-xs mt-1">Last 30 days</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger value="all" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
            <Building2 className="h-4 w-4" />
            <span>All Organisations</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="industries" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
            <Factory className="h-4 w-4" />
            <span>By Industry</span>
          </TabsTrigger>
          <TabsTrigger value="countries" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
            <Globe className="h-4 w-4" />
            <span>By Country</span>
          </TabsTrigger>
        </TabsList>

        {/* All Organisations Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Search and Filters */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
              <CardTitle className="flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Advanced Filters & Search
              </CardTitle>
              <CardDescription>
                Find organisations by name, industry, type, or location
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Search Row */}
              <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search Organisations
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, industry, type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Industry
                    </label>
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="All industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All industries</SelectItem>
                        {validIndustries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {validTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        {validCountries.map(country => (
                          <SelectItem key={country} value={country}>
                            <div className="flex items-center space-x-2">
                              <span>{getCountryFlag(country)}</span>
                              <span>{country}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="whitespace-nowrap border-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Sort Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="establishmentYear">Est. Year</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-32 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} organisations
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800 border-blue-200">
                      <span>Search: "{searchTerm}"</span>
                      <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {industryFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800 border-green-200">
                      <span>Industry: "{industryFilter}"</span>
                      <button onClick={() => setIndustryFilter('all')} className="hover:text-green-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {typeFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-purple-100 text-purple-800 border-purple-200">
                      <span>Type: "{typeFilter}"</span>
                      <button onClick={() => setTypeFilter('all')} className="hover:text-purple-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {countryFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-100 text-orange-800 border-orange-200">
                      <span>Country: "{countryFilter}"</span>
                      <button onClick={() => setCountryFilter('all')} className="hover:text-orange-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organisations Table */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                    All Organisations
                  </CardTitle>
                  <CardDescription>
                    {pagination.total.toLocaleString()} organisations across {stats?.countriesCount} countries
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Page {pagination.page} of {pagination.totalPages}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <OrganisationTable
                organisations={organisations}
                loading={loading}
                onOrganisationClick={handleOrganisationClick}
                onUpdateOrganisation={handleUpdateOrganisation}
                onDeleteOrganisation={handleDeleteOrganisation}
                getCountryFlag={getCountryFlag}
                formatEstablishmentYear={formatEstablishmentYear}
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-6 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages} •{' '}
                    {pagination.total.toLocaleString()} total organisations
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer border-2'}
                        />
                      </PaginationItem>
                      
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        const pageNum = pagination.page <= 3 
                          ? index + 1 
                          : pagination.page >= pagination.totalPages - 2 
                            ? pagination.totalPages - 4 + index 
                            : pagination.page - 2 + index;
                        
                        if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={pagination.page === pageNum}
                              className="cursor-pointer border-2"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer border-2'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Industries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Factory className="h-5 w-5 mr-2 text-green-600" />
                    Top Industries
                  </CardTitle>
                  <CardDescription>
                    Distribution of organisations by industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statistics.organisationsByIndustry.map((item, index) => (
                    <div key={item._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item._id || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">{item.count} orgs</span>
                      </div>
                      <Progress 
                        value={(item.count / statistics.totalOrganisations) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Countries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    Top Countries
                  </CardTitle>
                  <CardDescription>
                    Geographical distribution of organisations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statistics.organisationsByCountry.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getCountryFlag(item._id)}</span>
                        <span className="font-medium">{item._id || 'Unknown'}</span>
                      </div>
                      <Badge variant="secondary">{item.count} organisations</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Industries Tab */}
        <TabsContent value="industries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Factory className="h-5 w-5 mr-2 text-green-600" />
                Browse by Industry
              </CardTitle>
              <CardDescription>
                Click on an industry to view organisations in that sector
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {validIndustries.map(industry => (
                  <Card 
                    key={industry} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                    onClick={() => {
                      setIndustryFilter(industry);
                      setActiveTab('all');
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Factory className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <h3 className="font-semibold text-lg mb-1">{industry}</h3>
                      <p className="text-sm text-gray-500">
                        {statistics?.organisationsByIndustry.find(item => item._id === industry)?.count || 0} organisations
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Browse by Country
              </CardTitle>
              <CardDescription>
                Click on a country to view organisations in that location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {validCountries.map(country => (
                  <Card 
                    key={country} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                    onClick={() => {
                      setCountryFilter(country);
                      setActiveTab('all');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCountryFlag(country)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{country}</h3>
                          <p className="text-sm text-gray-500">
                            {statistics?.organisationsByCountry.find(item => item._id === country)?.count || 0} organisations
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Organisation Detail Modal */}
      {isDetailModalOpen && selectedOrganisation && (
        <OrganisationDetailModal
          organisation={selectedOrganisation}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={handleUpdateOrganisation}
          onDelete={handleDeleteOrganisation}
          getCountryFlag={getCountryFlag}
          formatEstablishmentYear={formatEstablishmentYear}
        />
      )}

      {/* Create Organisation Modal */}
      {isCreateModalOpen && (
        <OrganisationCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateOrganisation}
        />
      )}
    </div>
  );
};

export default OrganisationManagement;
