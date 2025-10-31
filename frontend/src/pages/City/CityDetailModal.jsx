import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  MapPin, 
  Navigation, 
  Flag, 
  Globe,
  Mountain,
  Building2,
  ExternalLink,
  Copy,
  Calendar
} from 'lucide-react';
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

const CityDetailModal = ({ city, onClose, onDeleteCity }) => {
  const getCountryFlag = (countryCode) => {
    const flags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'BR': '🇧🇷', 'RU': '🇷🇺', 'ZA': '🇿🇦'
    };
    return flags[countryCode] || '🏴';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openInMaps = () => {
    if (city.CITY_latitude && city.CITY_longitude) {
      const url = `https://www.google.com/maps?q=${city.CITY_latitude},${city.CITY_longitude}`;
      window.open(url, '_blank');
    }
  };

  const openInOpenStreetMap = () => {
    if (city.CITY_latitude && city.CITY_longitude) {
      const url = `https://www.openstreetmap.org/?mlat=${city.CITY_latitude}&mlon=${city.CITY_longitude}#map=10/${city.CITY_latitude}/${city.CITY_longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {city.CITY_NAME}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1">
                <Flag className="h-4 w-4" />
                <span>{city.STATE}, {city.COUNTRY_NAME_CODE} {getCountryFlag(city.COUNTRY_ISO_2)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={openInMaps}
              disabled={!city.CITY_latitude || !city.CITY_longitude}
              className="flex items-center space-x-2 border-2"
            >
              <Navigation className="h-4 w-4" />
              <span>View on Map</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 border-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City ID</label>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm dark:text-white">{city.city_id}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(city.city_id.toString())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City Name</label>
                    <p className="font-medium dark:text-white">{city.CITY_NAME}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State/Region</label>
                    <p className="font-medium dark:text-white">{city.STATE}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographical Data */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  Geographical Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude</label>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm dark:text-white">
                        {city.CITY_latitude?.toFixed(6) || 'N/A'}
                      </p>
                      {city.CITY_latitude && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(city.CITY_latitude.toString())}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude</label>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm dark:text-white">
                        {city.CITY_longitude?.toFixed(6) || 'N/A'}
                      </p>
                      {city.CITY_longitude && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(city.CITY_longitude.toString())}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State Code</label>
                    <p className="font-medium dark:text-white">{city.state_code}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State ID</label>
                    <p className="font-mono text-sm dark:text-white">{city.state_id}</p>
                  </div>
                </div>

                {/* Map Actions */}
                {(city.CITY_latitude && city.CITY_longitude) && (
                  <div className="flex space-x-3 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={openInMaps}
                      className="flex items-center space-x-2"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Google Maps</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={openInOpenStreetMap}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>OpenStreetMap</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Country Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2 text-purple-600" />
                  Country Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCountryFlag(city.COUNTRY_ISO_2)}</span>
                      <p className="font-medium dark:text-white">{city.COUNTRY_NAME_CODE}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country Code</label>
                    <p className="font-medium dark:text-white">{city.country_code}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ISO Codes</label>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{city.COUNTRY_ISO_2}</Badge>
                      <Badge variant="outline">{city.COUNTRY_ISO_3}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country ID</label>
                    <p className="font-mono text-sm dark:text-white">{city.country_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</label>
                    <p className="font-medium dark:text-white">{city.COUNTRY_REGION2}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subregion</label>
                    <p className="font-medium dark:text-white">{city.COUNTRY_SUBREGION}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-sm dark:text-white">{formatDate(city.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm dark:text-white">{formatDate(city.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Separator />
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 border-2">
              <CardHeader>
                <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-400">
                  Once you delete this city, there is no going back. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="dark:bg-red-600 dark:hover:bg-red-700">
                      Delete City
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-400">
                        This action cannot be undone. This will permanently delete the city
                        "{city.CITY_NAME}" and remove all associated data from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDeleteCity(city._id);
                          onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Delete City
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityDetailModal;