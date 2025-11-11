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
  Globe,
  Calendar,
  MapPin,
  Trash2
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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
    <TooltipProvider>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
        {/* Slide-over panel */}
        <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl border-l animate-in slide-in-from-right-0 duration-300">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold truncate">
                      {institute.name || 'Institute Details'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="default" className="text-xs">
                        {institute.type || 'Educational Institute'}
                      </Badge>
                      {institute.industry && (
                        <Badge variant="outline" className="text-xs">
                          {institute.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Edit Button */}
              {!isEditing && (
                <div className="sm:hidden mt-3">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Institute
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4" />
                    Institute Information
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edit the institute details below' : 'View institute information'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Institute Name</p>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter institute name"
                          />
                        ) : (
                          <p className="font-semibold">{institute.name || 'Unnamed Institute'}</p>
                        )}
                      </div>
                      <Badge variant="outline">Name</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Institute Type</p>
                        {isEditing ? (
                          <Input
                            value={editData.type}
                            onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                            className="mt-1"
                            placeholder="e.g., University, College"
                          />
                        ) : (
                          <p className="font-semibold">{institute.type || 'Educational Institute'}</p>
                        )}
                      </div>
                      <Badge variant="outline">Type</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        {isEditing ? (
                          <Input
                            value={editData.industry}
                            onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                            className="mt-1"
                            placeholder="e.g., Education, Healthcare"
                          />
                        ) : (
                          <p className="font-semibold">{institute.industry || 'N/A'}</p>
                        )}
                      </div>
                      <Badge variant="outline">Industry</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Establishment Year</p>
                        {isEditing ? (
                          <Input
                            value={editData.establishmentYear}
                            onChange={(e) => setEditData(prev => ({ ...prev, establishmentYear: e.target.value }))}
                            className="mt-1"
                            placeholder="e.g., 1990"
                          />
                        ) : (
                          <p className="font-semibold">{institute.establishmentYear || 'N/A'}</p>
                        )}
                      </div>
                      <Badge variant="outline">Year</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Location Information
                  </CardTitle>
                  <CardDescription>
                    Geographical details of the institute
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      {isEditing ? (
                        <Input
                          value={editData.location.country}
                          onChange={(e) => updateLocationField('country', e.target.value)}
                          className="mt-1"
                          placeholder="Enter country"
                        />
                      ) : (
                        <p className="font-semibold">{institute.location?.country || 'N/A'}</p>
                      )}
                    </div>
                    <Badge variant="outline">Country</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      {isEditing ? (
                        <Input
                          value={editData.location.city || ''}
                          onChange={(e) => updateLocationField('city', e.target.value)}
                          className="mt-1"
                          placeholder="Enter city"
                        />
                      ) : (
                        <p className="font-semibold">{institute.location?.city || 'N/A'}</p>
                      )}
                    </div>
                    <Badge variant="outline">City</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      {isEditing ? (
                        <Input
                          value={editData.location.state || ''}
                          onChange={(e) => updateLocationField('state', e.target.value)}
                          className="mt-1"
                          placeholder="Enter state"
                        />
                      ) : (
                        <p className="font-semibold">{institute.location?.state || 'N/A'}</p>
                      )}
                    </div>
                    <Badge variant="outline">State</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-semibold">{formatDate(institute.createdAt)}</p>
                    </div>
                    <Badge variant="secondary">Created</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-semibold">{formatDate(institute.updatedAt)}</p>
                    </div>
                    <Badge variant="secondary">Updated</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Separator />
              
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Warning!
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
                        Delete Institute Permanently
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the institute
                          "{institute.name || 'Unnamed Institute'}" and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Institute
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default InstituteDetailModal;