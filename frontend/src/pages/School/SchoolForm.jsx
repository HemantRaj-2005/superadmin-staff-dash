// src/pages/School/SchoolForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X, Building, MapPin, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { getAllStates, getDistrictsByState } from './StateDistrictData';

const SchoolForm = ({ school, onSave, onClose, open = true }) => {
  const [formData, setFormData] = useState({
    school_name: '',
    district: '',
    state: '',
    udise_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  useEffect(() => {
    // Load all states on component mount
    setAvailableStates(getAllStates());
  }, []);

  useEffect(() => {
    if (school) {
      const schoolData = {
        school_name: school.school_name || '',
        district: school.district || '',
        state: school.state || '',
        udise_code: school.udise_code || ''
      };
      setFormData(schoolData);
      
      // Load districts if state is already set
      if (schoolData.state) {
        const districts = getDistrictsByState(schoolData.state);
        setAvailableDistricts(districts);
      }
    } else {
      // Reset form when adding new school
      setFormData({
        school_name: '',
        district: '',
        state: '',
        udise_code: ''
      });
      setAvailableDistricts([]);
    }
    setErrors({});
    setAlert({ show: false, message: '', type: '' });
    setStateSearch('');
    setDistrictSearch('');
  }, [school, open]);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleStateChange = (state) => {
    setFormData(prev => ({ 
      ...prev, 
      state,
      district: '' // Reset district when state changes
    }));
    
    // Load districts for selected state
    const districts = getDistrictsByState(state);
    setAvailableDistricts(districts);
    
    // Clear errors
    if (errors.state) {
      setErrors(prev => ({ ...prev, state: '' }));
    }
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }));
    }
    
    // Hide alert when user starts correcting errors
    if (alert.show && alert.type === 'error') {
      setAlert(prev => ({ ...prev, show: false }));
    }
  };

  const handleDistrictChange = (district) => {
    setFormData(prev => ({ ...prev, district }));
    
    // Clear error
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }));
    }
    
    // Hide alert when user starts correcting errors
    if (alert.show && alert.type === 'error') {
      setAlert(prev => ({ ...prev, show: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Hide alert when user starts correcting errors
    if (alert.show && alert.type === 'error') {
      setAlert(prev => ({ ...prev, show: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.school_name.trim()) {
      newErrors.school_name = 'School name is required';
    } else if (formData.school_name.trim().length < 3) {
      newErrors.school_name = 'School name must be at least 3 characters long';
    }
    
    if (!formData.district) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.udise_code) {
      newErrors.udise_code = 'UDISE code is required';
    } else if (isNaN(formData.udise_code)) {
      newErrors.udise_code = 'UDISE code must be a number';
    } else if (formData.udise_code.length !== 11) {
      newErrors.udise_code = 'UDISE code must be 11 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Please fix the errors in the form before submitting.', 'error');
      return;
    }
    
    setLoading(true);
    setAlert({ show: false, message: '', type: '' });
    
    try {
      await onSave({
        ...formData,
        udise_code: Number(formData.udise_code)
      });
      showAlert(
        school 
          ? 'School information has been updated successfully.' 
          : 'New school has been added successfully.',
        'success'
      );
      // Close dialog after successful save
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      showAlert(
        error.message || 'Something went wrong. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter states based on search
  const filteredStates = availableStates.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter districts based on search
  const filteredDistricts = availableDistricts.filter(district =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building className="h-6 w-6" />
              {school ? 'Edit School' : 'Add New School'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {school 
              ? "Update the school information below."
              : "Fill in the details to add a new school to the system."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Alert Display */}
        {alert.show && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            {alert.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* School Name */}
              <div className="space-y-2">
                <Label htmlFor="school_name">
                  School Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="school_name"
                  type="text"
                  value={formData.school_name}
                  onChange={(e) => handleInputChange('school_name', e.target.value)}
                  placeholder="Enter school name"
                  className={errors.school_name ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.school_name && (
                  <p className="text-sm text-destructive">{errors.school_name}</p>
                )}
              </div>

              {/* UDISE Code */}
              <div className="space-y-2">
                <Label htmlFor="udise_code">
                  UDISE Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="udise_code"
                  type="text"
                  value={formData.udise_code}
                  onChange={(e) => handleInputChange('udise_code', e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Enter 11-digit UDISE code"
                  className={errors.udise_code ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.udise_code && (
                  <p className="text-sm text-destructive">{errors.udise_code}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Unique 11-digit code assigned to each school
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={handleStateChange}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input
                          placeholder="Search states..."
                          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                      {filteredStates.length === 0 && (
                        <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                          No states found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state}</p>
                  )}
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district">
                    District <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={handleDistrictChange}
                    disabled={loading || !formData.state}
                  >
                    <SelectTrigger className={errors.district ? "border-destructive" : ""}>
                      <SelectValue 
                        placeholder={
                          !formData.state 
                            ? "Please select state first" 
                            : "Select district"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input
                          placeholder="Search districts..."
                          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                      {filteredDistricts.length === 0 && (
                        <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                          {!formData.state ? 'Please select a state first' : 'No districts found'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-24"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                school ? 'Update School' : 'Create School'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolForm;