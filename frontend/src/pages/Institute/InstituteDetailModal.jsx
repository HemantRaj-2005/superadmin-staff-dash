import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Building2, 
  MapPin, 
  Stethoscope,
  Edit,
  Save,
  Calendar,
  Trash2
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
    name: institute.name || '',
    Hospitals: institute.Hospitals || '',
    city: institute.city || '',
    City: institute.City || '',
    state: institute.state || '',
    State: institute.State || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(institute._id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating institute:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: institute.name || '',
      Hospitals: institute.Hospitals || '',
      city: institute.city || '',
      City: institute.City || '',
      state: institute.state || '',
      State: institute.State || ''
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {institute.name || 'Unnamed Institute'}
              </h2>
             
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institute Name</label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hospital Type</label>
                    {isEditing ? (
                      <Input
                        value={editData.Hospitals}
                        onChange={(e) => setEditData(prev => ({ ...prev, Hospitals: e.target.value }))}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter hospital type"
                      />
                    ) : (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
                          {institute.Hospitals || 'General'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Location Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Geographical details of the institute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City (Primary)</label>
                    {isEditing ? (
                      <Input
                        value={editData.City}
                        onChange={(e) => setEditData(prev => ({ ...prev, City: e.target.value }))}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{getDisplayCity(institute)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City (Alternate)</label>
                    {isEditing ? (
                      <Input
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter alternate city"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{institute.city || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State (Primary)</label>
                    {isEditing ? (
                      <Input
                        value={editData.State}
                        onChange={(e) => setEditData(prev => ({ ...prev, State: e.target.value }))}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{getDisplayState(institute)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State (Alternate)</label>
                    {isEditing ? (
                      <Input
                        value={editData.state}
                        onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white border-2"
                        placeholder="Enter alternate state"
                      />
                    ) : (
                      <p className="font-medium dark:text-white">{institute.state || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-sm dark:text-white">{formatDate(institute.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm dark:text-white">{formatDate(institute.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Separator />
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 border-2">
              <CardHeader>
                <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-400">
                  Once you delete this institute, there is no going back. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="dark:bg-red-600 dark:hover:bg-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Institute
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-400">
                        This action cannot be undone. This will permanently delete the institute
                        "{institute.name}" and remove all associated data from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        {loading ? 'Deleting...' : 'Delete Institute'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDetailModal;