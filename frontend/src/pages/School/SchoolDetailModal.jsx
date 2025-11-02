// pages/src/Schools/SchoolDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit2, 
  MapPin, 
  Copy, 
  Check, 
  Building, 
  Calendar, 
  Mail, 
  Phone, 
  Globe,
  Users,
  BookOpen,
  Shield,
  ExternalLink
} from 'lucide-react';
import PropTypes from 'prop-types';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SchoolDetailModal = ({ school, onClose, onEdit }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(String(text ?? ''));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const openMaps = () => {
    // Include school name for better location accuracy
    const query = encodeURIComponent(`${school.school_name || ''} ${school.district || ''} ${school.state || ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      case 'verified': return 'default';
      default: return 'secondary';
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SC';
  };

  // Mock data for demonstration
  const schoolStats = {
    students: 1250,
    teachers: 45,
    classes: 35,
    established: '1998'
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
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(school.school_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold truncate">
                      {school.school_name || 'School Details'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={getStatusVariant(school.status)} className="text-xs">
                        {school.status || 'Active'}
                      </Badge>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{school.district || '—'}, {school.state || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button 
                      onClick={() => onEdit(school)}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
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
              {onEdit && (
                <div className="sm:hidden mt-3">
                  <Button 
                    onClick={() => onEdit(school)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit School
                  </Button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                    <Building className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2 text-xs">
                    <Users className="h-4 w-4" />
                    <span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2 text-xs">
                    <Shield className="h-4 w-4" />
                    <span>Advanced</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Scrollable Content - SINGLE ScrollArea */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">UDISE Code</p>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold font-mono">{school.udise_code || '—'}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => copyToClipboard(school.udise_code, 'udise')}
                                >
                                  {copiedField === 'udise' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy UDISE Code</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Students</p>
                          <p className="font-semibold">{schoolStats.students.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Teachers</p>
                          <p className="font-semibold">{schoolStats.teachers}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Established</p>
                          <p className="font-semibold">{schoolStats.established}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Location */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Location Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* School Name in Location Details */}
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">School Name</p>
                          <p className="font-semibold">{school.school_name || '—'}</p>
                        </div>
                        <Badge variant="outline">School</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">District</p>
                          <p className="font-semibold">{school.district || '—'}</p>
                        </div>
                        <Badge variant="outline">District</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">State</p>
                          <p className="font-semibold">{school.state || '—'}</p>
                        </div>
                        <Badge variant="outline">State</Badge>
                      </div>
                      <Button
                        onClick={openMaps}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Find School on Google Maps
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Opens Google Maps with school name and location
                      </p>
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
                          <p className="font-semibold">{formatDate(school.createdAt)}</p>
                        </div>
                        <Badge variant="secondary">Created</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="font-semibold">{formatDate(school.updatedAt)}</p>
                        </div>
                        <Badge variant="secondary">Updated</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building className="h-4 w-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">School Name</p>
                            <p className="font-semibold">{school.school_name || '—'}</p>
                          </div>
                          <Badge variant="outline">Primary</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">School Type</span>
                          <Badge variant="outline">{school.school_type || '—'}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">Category</span>
                          <Badge variant="outline">{school.category || '—'}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">Management</span>
                          <Badge variant="outline">{school.management || '—'}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">Board</span>
                          <Badge variant="outline">{school.board || '—'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {school.email ? (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">{school.email}</p>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(school.email, 'email')}
                              >
                                {copiedField === 'email' ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy Email</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground border rounded-lg">
                          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No email available</p>
                        </div>
                      )}

                      {school.phone ? (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Phone</p>
                              <p className="text-sm text-muted-foreground">{school.phone}</p>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(school.phone, 'phone')}
                              >
                                {copiedField === 'phone' ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy Phone</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground border rounded-lg">
                          <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No phone available</p>
                        </div>
                      )}

                      {school.website && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Website</p>
                              <p className="text-sm text-muted-foreground truncate">{school.website}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(school.website, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Location Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Location Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">District</p>
                          <p className="font-semibold">{school.district || '—'}</p>
                        </div>
                        <Badge variant="outline">District</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">State</p>
                          <p className="font-semibold">{school.state || '—'}</p>
                        </div>
                        <Badge variant="outline">State</Badge>
                      </div>
                      <Button
                        onClick={openMaps}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Locate School on Google Maps
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Technical Information
                    </CardTitle>
                    <CardDescription>
                      System data and technical details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">School ID</p>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {school._id || '—'}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(school._id, 'schoolId')}
                      >
                        {copiedField === 'schoolId' ? (
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium mb-2">Complete Data</p>
                      <div className="border rounded-lg bg-muted/50 max-h-64 overflow-auto">
                        <pre className="p-3 text-xs">
                          {JSON.stringify(school, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

SchoolDetailModal.propTypes = {
  school: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func
};

export default SchoolDetailModal;