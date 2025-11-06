import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SpecializationsModal = ({ program, onClose, onAddSpecialization }) => {
  const [specializations, setSpecializations] = useState([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setSpecializations(program.specializations);
  }, [program]);

  useEffect(() => {
    let filtered = specializations;
    
    if (searchTerm) {
      filtered = filtered.filter(spec => 
        spec.Specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSpecializations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, specializations]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSpecializations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSpecializations = filteredSpecializations.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (specialization, e) => {
    e.stopPropagation();
    setSelectedSpecialization(specialization);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Implement delete functionality here
    console.log('Deleting:', selectedSpecialization);
    setIsDeleteDialogOpen(false);
    setSelectedSpecialization(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {program.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1">
                <BookOpen className="h-4 w-4" />
                <span>{program.specializations.length} specializations</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={onAddSpecialization}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 border-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Stats */}
          <div className="p-6 border-b dark:border-gray-700 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search specializations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Showing {currentSpecializations.length} of {filteredSpecializations.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Filter className="h-4 w-4" />
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specializations Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentSpecializations.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No specializations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm 
                    ? "No specializations match your search. Try different keywords."
                    : "This program doesn't have any specializations yet."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={onAddSpecialization}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Specialization
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSpecializations.map((specialization, index) => (
                  <Card 
                    key={specialization._id} 
                    className="group hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {specialization.Specialization}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {program.name}
                            </Badge>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(specialization, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDate(specialization.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Updated {formatDate(specialization.updatedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSpecializations.length)} of{' '}
                  {filteredSpecializations.length} specializations
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        key={index + 1}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(index + 1)}
                        className="h-8 w-8 p-0"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the specialization "{selectedSpecialization?.Specialization}"? 
              This action cannot be undone and will remove this specialization from the program.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Specialization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SpecializationsModal;