// components/SchoolDetailModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { X, Edit2, Clipboard, MapPin, Copy, Check, Building, Calendar, Mail, Phone, Globe } from 'lucide-react';
import PropTypes from 'prop-types';

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const SchoolDetailModal = ({ school, onClose, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = async (text, type = 'UDISE Code') => {
    try {
      await navigator.clipboard.writeText(String(text ?? ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const openMaps = () => {
    const q = encodeURIComponent(`${school.district ?? ''} ${school.state ?? ''} ${school.school_name ?? ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      case 'verified': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                  {school.school_name || 'School Details'}
                  <Badge variant={getStatusVariant(school.status)}>
                    {school.status || 'Active'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {school.district || '—'}, {school.state || '—'}
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {onEdit && (
                <Button 
                  onClick={() => onEdit(school)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="h-[calc(85vh-140px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {/* <TabsTrigger value="details">Details</TabsTrigger> */}
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* UDISE Code Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      UDISE Code
                      <Badge variant="secondary" className="font-mono text-xs">
                        Unique Identifier
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <code className="text-lg font-mono font-semibold">
                        {school.udise_code || '—'}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(school.udise_code)}
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      11-digit unique code for school identification in the Unified District Information System for Education
                    </p>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">District</div>
                        <div className="font-medium">{school.district || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">State</div>
                        <div className="font-medium">{school.state || '—'}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openMaps}
                        className="w-full flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">{formatDate(school.createdAt)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">{formatDate(school.updatedAt)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {school.email && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Email</div>
                            <div className="text-sm text-muted-foreground">{school.email}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(school.email, 'Email')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {school.phone && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Phone</div>
                            <div className="text-sm text-muted-foreground">{school.phone}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(school.phone, 'Phone')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {school.website && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Website</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {school.website}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(school.website, '_blank')}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {!school.email && !school.phone && !school.website && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No contact information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Add more school fields here as needed */}
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">School Type</div>
                        <div className="font-medium">{school.school_type || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Category</div>
                        <div className="font-medium">{school.category || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Management</div>
                        <div className="font-medium">{school.management || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Board</div>
                        <div className="font-medium">{school.board || '—'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Technical Information</CardTitle>
                    <CardDescription>
                      Raw data and technical details for development purposes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">School ID</div>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {school._id}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(school._id, 'School ID')}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy ID
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <div className="text-sm font-medium mb-2">Complete Data</div>
                        <ScrollArea className="h-64 border rounded-lg">
                          <pre className="p-4 text-xs bg-muted/50">
                            {JSON.stringify(school, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

SchoolDetailModal.propTypes = {
  school: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func
};

export default SchoolDetailModal;