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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  MapPin,
  Stethoscope,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Eye
} from 'lucide-react';

const InstituteTable = ({
  institutes,
  loading,
  onInstituteClick,
  onUpdateInstitute,
  onDeleteInstitute,
  getDisplayCity,
  getDisplayState
}) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleDelete = async (instituteId, e) => {
    e.stopPropagation();
    setActionLoading(instituteId);
    try {
      await onDeleteInstitute(instituteId);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Defensive: ensure institutes is an array
  const list = Array.isArray(institutes) ? institutes : [];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
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
    );
  }

  if (!list || list.length === 0) {
    return (
      <div className="p-12 text-center">
        <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No institutes found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          There are no healthcare institutes to display at the moment.
        </p>
      </div>
    );
  }

  const shortId = (id) => (id ? String(id).slice(-8) : 'N/A');

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="w-[300px]">Institute</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((institute) => (
            <TableRow
              key={institute?._id ?? Math.random().toString(36).slice(2, 9)}
              className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => onInstituteClick(institute)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {institute?.name || 'Unnamed Institute'}
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>ID: {shortId(institute?._id)}</span>
                    </div>
                  </div>
                </div>
              </TableCell>

           

              <TableCell>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getDisplayCity(institute)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {getDisplayState(institute)}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(institute?.createdAt)}
                </div>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onInstituteClick(institute)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onInstituteClick(institute); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Institute
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Institute
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Institute</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {institute?.name || 'this institute'}?
                            This action cannot be undone and will permanently remove the institute from the database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => handleDelete(institute?._id, e)}
                            disabled={actionLoading === institute?._id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {actionLoading === institute?._id ? 'Deleting...' : 'Delete Institute'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstituteTable;
