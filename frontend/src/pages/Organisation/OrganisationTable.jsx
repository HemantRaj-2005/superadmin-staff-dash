import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { 
  Edit, 
  Trash2, 
  Building2, 
  MapPin, 
  Calendar,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const OrganisationTable = ({ 
  organisations, 
  loading, 
  onOrganisationClick, 
  onUpdateOrganisation,
  onDeleteOrganisation,
  getCountryFlag,
  formatEstablishmentYear 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  if (loading) {
    return (
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (!organisations || organisations.length === 0) {
    return (
      <CardContent className="py-12 text-center">
        <div className="text-muted-foreground space-y-2">
          <Building2 className="h-12 w-12 mx-auto text-gray-300" />
          <p className="text-lg font-medium">No organisations found</p>
          <p className="text-sm">There are no organisations to display at the moment.</p>
        </div>
      </CardContent>
    );
  }

  const handleEdit = (organisation, e) => {
    e.stopPropagation();
    setEditingId(organisation.id);
    setEditData({
      name: organisation.name,
      industry: organisation.industry,
      type: organisation.type
    });
  };

  const handleSave = async (organisationId, e) => {
    e.stopPropagation();
    try {
      await onUpdateOrganisation(organisationId, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating organisation:', error);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditData({});
  };

  const handleDeleteClick = (e, organisationId) => {
    e.stopPropagation();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">Organisation</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Est. Year</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organisations.map((organisation) => (
            <TableRow 
              key={organisation.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors group"
              onClick={() => onOrganisationClick(organisation)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingId === organisation.id ? (
                      <input
                        value={editData.name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-1 border rounded text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {organisation.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {organisation.id.slice(-8)}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {editingId === organisation.id ? (
                  <input
                    value={editData.industry || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
                    {organisation.industry}
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                {editingId === organisation.id ? (
                  <input
                    value={editData.type || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{organisation.type}</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(organisation.location.country)}</span>
                  <span className="text-sm font-medium">{organisation.location.country}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatEstablishmentYear(organisation.establishmentYear)}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(organisation.createdAt)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  {editingId === organisation.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleSave(organisation.id, e)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        ✓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        ✕
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEdit(organisation, e)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOrganisationClick(organisation)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-700"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Organisation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{organisation.name}"? 
                                This action cannot be undone and will permanently remove the organisation from the database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteOrganisation(organisation.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Organisation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrganisationTable;