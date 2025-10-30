import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
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

const EducationalProgramCard = ({ 
  programName, 
  specializations, 
  onProgramClick, 
  onDeleteProgram,
  onAddSpecialization 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getLatestUpdate = () => {
    if (!specializations.length) return null;
    return new Date(Math.max(...specializations.map(s => new Date(s.updatedAt))));
  };

  const latestUpdate = getLatestUpdate();

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate" title={programName}>
                {programName}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <BookOpen className="h-3 w-3" />
                <span>{specializations.length} specialization(s)</span>
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddSpecialization}>
                <Plus className="h-4 w-4 mr-2" />
                Add Specialization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onProgramClick(specializations[0])}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Program
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {latestUpdate && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(latestUpdate)}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Specializations List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {specializations.map((specialization, index) => (
            <div 
              key={specialization._id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors cursor-pointer group/item"
              onClick={() => onProgramClick(specialization)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-normal hover:bg-secondary/80 transition-colors"
                  >
                    {specialization.Specialization}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(specialization.createdAt)}</span>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{specialization.Specialization}"? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteProgram(specialization._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>

        {/* Add Specialization Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onAddSpecialization}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Specialization
        </Button>
      </CardContent>
    </Card>
  );
};

export default EducationalProgramCard;