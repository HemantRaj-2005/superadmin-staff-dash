import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Building2, 
  Edit,
  Save,
  Globe
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const InstituteDetailModal = ({ 
  institute, 
  onClose, 
  onUpdate, 
  onDelete,
  getDisplayCity,
  getDisplayState 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    type: '',
    industry: '',
    establishmentYear: '',
    location: {
      country: ''
    }
  });
  const [loading, setLoading] = useState(false);

  // Initialize editData when institute changes
  useEffect(() => {
    setEditData({
      name: institute.name || '',
      type: institute.type || '',
      industry: institute.industry || '',
      establishmentYear: institute.establishmentYear || '',
      location: {
        country: institute.location?.country || '',
        city: institute.location?.city || '',
        state: institute.location?.state || ''
      }
    });
  }, [institute]);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Sending update data:', editData);
      
      // Create payload with only the fields that match the schema
      const payload = {
        name: editData.name,
        type: editData.type,
        industry: editData.industry,
        establishmentYear: editData.establishmentYear,
        location: {
          country: editData.location.country,
          // Only include city/state if they exist in your actual data
          ...(editData.location.city && { city: editData.location.city }),
          ...(editData.location.state && { state: editData.location.state })
        }
      };

      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('Final payload:', payload);
      await onUpdate(institute._id, payload);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating institute:', error);
      console.error('Server response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: institute.name || '',
      type: institute.type || '',
      industry: institute.industry || '',
      establishmentYear: institute.establishmentYear || '',
      location: {
        country: institute.location?.country || '',
        city: institute.location?.city || '',
        state: institute.location?.state || ''
      }
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(institute._id);
      onClose();
    } catch (error) {
      console.error('Error deleting institute:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update location field helper
  const updateLocationField = (field, value) => {
    setEditData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {institute.name || 'Unnamed Institute'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                  {institute.type || 'Educational Institute'}
                </Badge>
                {institute.industry && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
                    {institute.industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="dark:border-gray-600 dark:text-gray-300 border-2"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="dark:border-gray-600 dark:text-gray-300 border-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
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

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Institute Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {isEditing ? 'Edit the institute details below' : 'View institute information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institute Name *</label>
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter institute name"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {institute.name || 'Unnamed Institute'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institute Type *</label>
                    {isEditing ? (
                      <Input
                        value={editData.type}
                        onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="e.g., University, College"
                      />
                    ) : (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
                          {institute.type || 'Educational Institute'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry *</label>
                    {isEditing ? (
                      <Input
                        value={editData.industry}
                        onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="e.g., Education, Healthcare"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {institute.industry || 'N/A'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Establishment Year</label>
                    {isEditing ? (
                      <Input
                        value={editData.establishmentYear}
                        onChange={(e) => setEditData(prev => ({ ...prev, establishmentYear: e.target.value }))}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="e.g., 1990"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                        {institute.establishmentYear || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  Location Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Geographical details of the institute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country *</label>
                    {isEditing ? (
                      <Input
                        value={editData.location.country}
                        onChange={(e) => updateLocationField('country', e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter country"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{institute.location?.country || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    {isEditing ? (
                      <Input
                        value={editData.location.city || ''}
                        onChange={(e) => updateLocationField('city', e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{institute.location?.city || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                    {isEditing ? (
                      <Input
                        value={editData.location.state || ''}
                        onChange={(e) => updateLocationField('state', e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{institute.location?.state || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the component remains the same */}
            {/* Timestamps and Danger Zone sections... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDetailModal;