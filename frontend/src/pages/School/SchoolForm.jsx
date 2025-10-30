// components/SchoolForm.js
import React, { useState, useEffect } from 'react';

const SchoolForm = ({ school, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    school_name: '',
    district: '',
    state: '',
    udise_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (school) {
      setFormData({
        school_name: school.school_name || '',
        district: school.district || '',
        state: school.state || '',
        udise_code: school.udise_code || ''
      });
    }
  }, [school]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.school_name.trim()) {
      newErrors.school_name = 'School name is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.udise_code) {
      newErrors.udise_code = 'UDISE code is required';
    } else if (isNaN(formData.udise_code)) {
      newErrors.udise_code = 'UDISE code must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave({
        ...formData,
        udise_code: Number(formData.udise_code)
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {school ? 'Edit School' : 'Add New School'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => handleChange('school_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.school_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter school name"
                  />
                  {errors.school_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.school_name}</p>
                  )}
                </div>

                {/* UDISE Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UDISE Code *
                  </label>
                  <input
                    type="text"
                    value={formData.udise_code}
                    onChange={(e) => handleChange('udise_code', e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.udise_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter UDISE code"
                  />
                  {errors.udise_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.udise_code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Unique 11-digit code assigned to each school
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.district ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter district"
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Saving...' : (school ? 'Update School' : 'Create School')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolForm;