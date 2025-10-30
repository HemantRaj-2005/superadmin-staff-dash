import React from 'react';
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
import { Trash2, GraduationCap, Calendar } from 'lucide-react';

const EducationalProgramTable = ({ programs, loading, onProgramClick, onDeleteProgram }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
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
      </Card>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground space-y-2">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-lg font-medium">No educational programs found</p>
            <p className="text-sm">There are no educational programs to display at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDeleteClick = (e, programId) => {
    e.stopPropagation();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Program</TableHead>
              <TableHead className="w-[300px]">Specialization</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow 
                key={program._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onProgramClick(program)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-medium text-sm line-clamp-2"
                        title={program.Program}
                      >
                        {program.Program}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {program.Specialization}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(program.createdAt)}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(program.updatedAt)}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, program._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Educational Program</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{program.Program} - {program.Specialization}"? 
                          This action cannot be undone and the program will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteProgram(program._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Program
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default EducationalProgramTable;