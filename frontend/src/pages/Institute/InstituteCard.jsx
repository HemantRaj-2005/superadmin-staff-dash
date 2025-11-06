import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Stethoscope,
  MoreVertical,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const InstituteCard = ({ institute, onInstituteClick, onDeleteInstitute, getDisplayValue }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  const displayCity = getDisplayValue(institute, 'city');
  const displayState = getDisplayValue(institute, 'state');
  const hospitalType = institute.Hospitals;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-md"
      onClick={() => onInstituteClick(institute)}
    >
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {institute.name || 'Unnamed Institute'}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{displayCity}, {displayState}</span>
              </CardDescription>
            </div>
          </div>
          
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
              <DropdownMenuItem onClick={() => onInstituteClick(institute)}>
                View Details
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Delete Institute
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Institute</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {institute.name || 'this institute'}? 
                      This action cannot be undone and will permanently remove the institute from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteInstitute(institute._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Institute
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Hospital Type Badge */}
        {hospitalType && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
              <Stethoscope className="h-3 w-3 mr-1" />
              {hospitalType}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Location Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium dark:text-white">
                {displayCity}, {displayState}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {institute.city && institute.City && institute.city !== institute.City && (
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">City (Alt)</div>
              <div className="font-medium dark:text-white">{institute.City}</div>
            </div>
          )}
          {institute.state && institute.State && institute.state !== institute.State && (
            <div className="space-y-1">
              <div className="text-gray-500 dark:text-gray-400">State (Alt)</div>
              <div className="font-medium dark:text-white">{institute.State}</div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Added {formatDate(institute.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs border-2"
            onClick={(e) => {
              e.stopPropagation();
              onInstituteClick(institute);
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstituteCard;