// components/SchoolManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SchoolTable from './SchoolTable';
import SchoolDetailModal from './SchoolDetailModal';
import SchoolForm from './SchoolForm';
import SchoolStats from './SchoolStats';
import BulkImportModal from './BulkImportModal';
import api from '@/services/api';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    district: '',
    sortBy: 'school_name',
    sortOrder: 'asc'
  });
  const [availableFilters, setAvailableFilters] = useState({
    states: [],
    districts: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { checkPermission } = useAuth();

  useEffect(() => {
    fetchSchools();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await api.get('/schools/', { params });
      
      setSchools(response.data.schools);
      setAvailableFilters(response.data.filters);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // This would be called separately for stats
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      state: '',
      district: '',
      sortBy: 'school_name',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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
        await api.post('/schools', schoolData);
      }
      
      setIsFormOpen(false);
      setSelectedSchool(null);
      fetchSchools(); // Refresh the list
    } catch (error) {
      console.error('Error saving school:', error);
      throw error;
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await api.delete(`/schools/${schoolId}`);
        fetchSchools(); // Refresh the list
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  const exportSchools = async () => {
    try {
      const response = await api.get('/schools/export/data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `schools-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting schools:', error);
    }
  };

  const handleBulkImport = async (schoolsData) => {
    try {
      const response = await api.post('/schools/bulk-import', {
        schools: schoolsData
      });
      
      alert(`Bulk import completed: ${response.data.successful} successful, ${response.data.failed} failed`);
      setIsImportOpen(false);
      fetchSchools(); // Refresh the list
      
      if (response.data.failed > 0) {
        console.error('Import errors:', response.data.errors);
        // You could show a detailed error modal here
      }
    } catch (error) {
      console.error('Error in bulk import:', error);
      alert(error.response?.data?.message || 'Error importing schools');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Management</h2>
            <p className="text-gray-600 mt-1">Manage schools and their information</p>
          </div>
          <div className="flex space-x-3">
            {checkPermission('schools', 'export') && (
              <button
                onClick={exportSchools}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
              >
                Export CSV
              </button>
            )}
            {checkPermission('schools', 'create') && (
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200"
              >
                Bulk Import
              </button>
            )}
            {checkPermission('schools', 'create') && (
              <button
                onClick={handleCreateSchool}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add School
              </button>
            )}
          </div>
        </div>

        {/* School Statistics */}
        <SchoolStats />

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Schools
              </label>
              <input
                type="text"
                placeholder="Name, district, state, or UDISE code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All States</option>
                {availableFilters.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Districts</option>
                {availableFilters.districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="school_name">School Name</option>
                <option value="state">State</option>
                <option value="district">District</option>
                <option value="udise_code">UDISE Code</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {schools.length} of {pagination.total} schools
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Schools Table */}
        <SchoolTable
          schools={schools}
          loading={loading}
          onSchoolClick={handleSchoolClick}
          onEditSchool={checkPermission('schools', 'edit') ? handleEditSchool : null}
          onDeleteSchool={checkPermission('schools', 'delete') ? handleDeleteSchool : null}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === pagination.totalPages || 
                Math.abs(page - pagination.page) <= 2
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-1 rounded-lg transition duration-200 ${
                      pagination.page === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition duration-200"
          >
            Next
          </button>
        </div>
      </div>

      {/* School Detail Modal */}
      {isModalOpen && selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setIsModalOpen(false)}
          onEdit={checkPermission('schools', 'edit') ? () => {
            setIsModalOpen(false);
            handleEditSchool(selectedSchool);
          } : null}
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