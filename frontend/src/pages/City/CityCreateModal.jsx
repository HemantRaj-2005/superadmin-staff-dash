import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  X, 
  MapPin,
  Save,
  Navigation
} from 'lucide-react';

const CityCreateModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    city_id: '',
    CITY_latitude: '',
    CITY_longitude: '',
    CITY_NAME: '',
    country_code: '',
    country_id: '',
    COUNTRY_ISO_2: '',
    COUNTRY_ISO_3: '',
    COUNTRY_NAME_CODE: '',
    COUNTRY_REGION2: '',
    COUNTRY_SUBREGION: '',
    STATE: '',
    state_code: '',
    state_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.city_id) newErrors.city_id = 'City ID is required';
    if (!formData.CITY_NAME) newErrors.CITY_NAME = 'City name is required';
    if (!formData.COUNTRY_NAME_CODE) newErrors.COUNTRY_NAME_CODE = 'Country name is required';
    if (!formData.STATE) newErrors.STATE = 'State is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Convert numeric fields
      const submitData = {
        ...formData,
        city_id: parseInt(formData.city_id),
        country_id: parseInt(formData.country_id) || 0,
        state_id: parseInt(formData.state_id) || 0,
        CITY_latitude: parseFloat(formData.CITY_latitude) || 0,
        CITY_longitude: parseFloat(formData.CITY_longitude) || 0
      };

      await onCreate(submitData);
    } catch (error) {
      console.error('Error creating city:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create city' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const inputFields = [
    { id: 'city_id', label: 'City ID', type: 'number', required: true },
    { id: 'CITY_NAME', label: 'City Name', type: 'text', required: true },
    { id: 'STATE', label: 'State/Region', type: 'text', required: true },
    { id: 'state_code', label: 'State Code', type: 'text', required: true },
    { id: 'state_id', label: 'State ID', type: 'number' },
    { id: 'COUNTRY_NAME_CODE', label: 'Country Name', type: 'text', required: true },
    { id: 'country_code', label: 'Country Code', type: 'text' },
    { id: 'country_id', label: 'Country ID', type: 'number' },
    { id: 'COUNTRY_ISO_2', label: 'ISO 2 Code', type: 'text' },
    { id: 'COUNTRY_ISO_3', label: 'ISO 3 Code', type: 'text' },
    { id: 'COUNTRY_REGION2', label: 'Region', type: 'text' },
    { id: 'COUNTRY_SUBREGION', label: 'Subregion', type: 'text' },
    { id: 'CITY_latitude', label: 'Latitude', type: 'number', step: 'any' },
    { id: 'CITY_longitude', label: 'Longitude', type: 'number', step: 'any' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New City
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the city details to add it to the database
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 border-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {errors.submit && (
              <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inputFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`border-2 focus:border-blue-500 transition-colors ${
                      errors[field.id] ? 'border-red-500' : ''
                    }`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={loading}
                    step={field.step}
                  />
                  {errors[field.id] && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Coordinates Helper */}
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Navigation className="h-4 w-4 mr-2 text-blue-600" />
                  Coordinate Helper
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Use negative values for southern latitudes and western longitudes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Examples:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                      <li>New York: 40.7128, -74.0060</li>
                      <li>London: 51.5074, -0.1278</li>
                      <li>Sydney: -33.8688, 151.2093</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Formats:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                      <li>Latitude: -90 to 90</li>
                      <li>Longitude: -180 to 180</li>
                      <li>Use decimal degrees</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create City'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityCreateModal;