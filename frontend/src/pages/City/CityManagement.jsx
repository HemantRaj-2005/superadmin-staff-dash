import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  MapPin, 
  Globe, 
  Navigation, 
  Building2,
  Flag,
  Mountain,
  Users,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';
import CityCard from './CityCard';
import CityDetailModal from './CityDetailModal';
import CityCreateModal from './CityCreateModal';
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

const CityManagement = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('CITY_NAME');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ countries: [], states: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCities();
    fetchStats();
  }, [pagination.page, searchTerm, countryFilter, stateFilter, sortBy, sortOrder]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cities', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          country: countryFilter !== 'all' ? countryFilter : '',
          state: stateFilter !== 'all' ? stateFilter : '',
          sortBy,
          sortOrder
        }
      });
      
      setCities(response.data.cities);
      setFilters(response.data.filters);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));

    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/cities/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching city stats:', error);
    }
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setIsDetailModalOpen(true);
  };

  const handleCreateCity = async (cityData) => {
    try {
      await api.post('/cities', cityData);
      fetchCities(); // Refresh the list
      fetchStats(); // Refresh stats
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      await api.delete(`/cities/${cityId}`);
      fetchCities(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting city:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCountryFilter('all');
    setStateFilter('all');
    setSortBy('CITY_NAME');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = searchTerm || countryFilter !== 'all' || stateFilter !== 'all';

  const getCountryFlag = (countryCode) => {
    const flags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'BR': '🇧🇷', 'RU': '🇷🇺', 'ZA': '🇿🇦'
    };
    return flags[countryCode] || '🏴';
  };

  // Filter out empty/null values from filters
  const validCountries = filters.countries?.filter(country => country && country.trim() !== '') || [];
  const validStates = filters.states?.filter(state => state && state.trim() !== '') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <MapPin className="h-8 w-8 mr-3 text-blue-600" />
            World Cities Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore and manage cities from around the world with detailed geographical data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add City
          </Button> */}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Cities</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalCities.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1">Worldwide coverage</p>
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
                  <p className="text-green-100 text-sm font-medium">Countries</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalCountries}</p>
                  <p className="text-green-200 text-xs mt-1">Global reach</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">States/Regions</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalStates.toLocaleString()}</p>
                  <p className="text-purple-200 text-xs mt-1">Administrative divisions</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Flag className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Geo Coverage</p>
                  <p className="text-3xl font-bold mt-1">{stats.coverage}%</p>
                  <p className="text-orange-200 text-xs mt-1">With coordinates</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Navigation className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Advanced Filters & Search
          </CardTitle>
          <CardDescription>
            Find cities by name, country, state, or geographical data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search Row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Cities
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by city, state, or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Country
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by State
                </label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="border-2 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {validStates.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
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
                  <SelectItem value="CITY_NAME">City Name</SelectItem>
                  <SelectItem value="COUNTRY_NAME_CODE">Country</SelectItem>
                  <SelectItem value="STATE">State</SelectItem>
                  <SelectItem value="city_id">City ID</SelectItem>
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
              {pagination.total.toLocaleString()} cities
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
              {countryFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800 border-green-200">
                  <span>Country: "{countryFilter}"</span>
                  <button onClick={() => setCountryFilter('all')} className="hover:text-green-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {stateFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1 bg-purple-100 text-purple-800 border-purple-200">
                  <span>State: "{stateFilter}"</span>
                  <button onClick={() => setStateFilter('all')} className="hover:text-purple-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cities Grid */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                World Cities
              </CardTitle>
              <CardDescription>
                {pagination.total.toLocaleString()} cities across {stats?.totalCountries} countries
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-md">
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
          ) : cities.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No cities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by adding your first city to the database."
                }
              </p>
              {!hasActiveFilters && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First City
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cities.map((city) => (
                  <CityCard
                    key={city._id}
                    city={city}
                    onCityClick={handleCityClick}
                    onDeleteCity={handleDeleteCity}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages} •{' '}
                    {pagination.total.toLocaleString()} total cities
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
            </>
          )}
        </CardContent>
      </Card>

      {/* City Detail Modal */}
      {isDetailModalOpen && selectedCity && (
        <CityDetailModal
          city={selectedCity}
          onClose={() => setIsDetailModalOpen(false)}
          onDeleteCity={handleDeleteCity}
        />
      )}

      {/* Create City Modal */}
      {isCreateModalOpen && (
        <CityCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCity}
        />
      )}
    </div>
  );
};

export default CityManagement;