// components/SchoolTable.js
import React from 'react';
import { Edit2, Trash2, MapPin, Building, Search, Filter, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const SchoolTable = ({ 
  schools, 
  loading, 
  onSchoolClick, 
  onEditSchool, 
  onDeleteSchool,
  searchTerm = '',
  onSearchChange,
  filters = {},
  onFilterChange 
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">No schools found</CardTitle>
          <CardDescription className="max-w-md">
            {searchTerm || Object.values(filters).some(Boolean) 
              ? "Try adjusting your search filters to find what you're looking for."
              : "Get started by adding your first school to the system."
            }
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Schools</CardTitle>
            <CardDescription>
              {schools.length} school{schools.length !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">School Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>UDISE Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow 
                key={school._id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSchoolClick(school)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {school.school_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        ID: {school._id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{school.district}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {school.state}
                      </p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {school.udise_code}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={school.status === 'active' ? 'default' : 'secondary'}
                    className={
                      school.status === 'active' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : ''
                    }
                  >
                    {school.status || 'active'}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onSchoolClick(school);
                      }}>
                        <Building className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      {onEditSchool && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEditSchool(school);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit School
                        </DropdownMenuItem>
                      )}
                      
                      {/* {onDeleteSchool && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSchool(school._id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete School
                        </DropdownMenuItem>
                      )} */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchoolTable;