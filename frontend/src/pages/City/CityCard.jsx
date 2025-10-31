import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Flag, 
  Mountain,
  MoreVertical,
  ExternalLink
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

const CityCard = ({ city, onCityClick, onDeleteCity }) => {
  const getCountryFlag = (countryCode) => {
    const flags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'BR': '🇧🇷', 'RU': '🇷🇺', 'ZA': '🇿🇦'
    };
    return flags[countryCode] || '🏴';
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat?.toFixed(4) || 'N/A'}, ${lng?.toFixed(4) || 'N/A'}`;
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  const openInMaps = (e) => {
    e.stopPropagation();
    if (city.CITY_latitude && city.CITY_longitude) {
      const url = `https://www.google.com/maps?q=${city.CITY_latitude},${city.CITY_longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 shadow-md"
      onClick={() => onCityClick(city)}
    >
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {city.CITY_NAME}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Flag className="h-4 w-4" />
                <span className="font-medium">{city.COUNTRY_NAME_CODE}</span>
                <span>{getCountryFlag(city.COUNTRY_ISO_2)}</span>
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
              <DropdownMenuItem onClick={() => onCityClick(city)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openInMaps}>
                <Navigation className="h-4 w-4 mr-2" />
                Open in Maps
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Delete City
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete City</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {city.CITY_NAME}, {city.STATE}? 
                      This action cannot be undone and will permanently remove the city from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteCity(city._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete City
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* State Badge */}
        <div className="mt-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
            {city.STATE}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
      

        {/* Country Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-gray-500 dark:text-gray-400">Country Code</div>
            <div className="font-medium dark:text-white">{city.COUNTRY_ISO_2}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 dark:text-gray-400">State Code</div>
            <div className="font-medium dark:text-white">{city.state_code}</div>
          </div>
        </div>

        {/* Region Info */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Mountain className="h-3 w-3" />
            <span className="truncate">{city.COUNTRY_SUBREGION}</span>
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
              onCityClick(city);
            }}
          >
            View Details
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-3 border-2"
            onClick={openInMaps}
            disabled={!city.CITY_latitude || !city.CITY_longitude}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityCard;