import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const ProgramCard = ({ 
  programName, 
  specializations, 
  totalSpecializations,
  latestUpdate,
  onProgramClick 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get sample specializations for preview (max 3)
  const sampleSpecializations = specializations
    .map(s => s.Specialization)
    .filter((value, index, self) => self.indexOf(value) === index) // Get unique
    .slice(0, 3);

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
      onClick={onProgramClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {programName}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{totalSpecializations} Specialization(s)</span>
              </CardDescription>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
        </div>
        
        {latestUpdate && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(latestUpdate)}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Specializations Preview */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Sparkles className="h-3 w-3" />
            <span>Specializations:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sampleSpecializations.map((specialization, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              >
                {specialization}
              </Badge>
            ))}
            {totalSpecializations > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{totalSpecializations - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{specializations.length} entries</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={(e) => {
              e.stopPropagation();
              onProgramClick();
            }}
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramCard;