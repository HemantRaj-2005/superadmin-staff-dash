import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  GraduationCap,
  Save,
  BookOpen
} from 'lucide-react';

const EducationalProgramCreateModal = ({ onClose, onCreate, defaultProgram = '' }) => {
  const [formData, setFormData] = useState({
    Program: defaultProgram,
    Specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultProgram) {
      setFormData(prev => ({ ...prev, Program: defaultProgram }));
    }
  }, [defaultProgram]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.Program.trim()) newErrors.Program = 'Program name is required';
    if (!formData.Specialization.trim()) newErrors.Specialization = 'Specialization is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await onCreate(formData);
      // Modal will close on success via parent component
    } catch (error) {
      console.error('Error creating program:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create program' });
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

  const isEditingProgram = !!defaultProgram;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isEditingProgram 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-blue-100 dark:bg-blue-900'
            }`}>
              {isEditingProgram ? (
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditingProgram ? 'Add Specialization' : 'Create Program'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditingProgram 
                  ? `Add a new specialization to ${defaultProgram}`
                  : 'Create a new educational program'
                }
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {errors.submit && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-md">
                {errors.submit}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Program Name {!isEditingProgram && '*'}
              </label>
              <Input
                value={formData.Program}
                onChange={(e) => handleChange('Program', e.target.value)}
                className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.Program ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Computer Science, Business Administration"
                disabled={loading || isEditingProgram}
              />
              {errors.Program && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.Program}</p>
              )}
              {isEditingProgram && (
                <p className="text-xs text-muted-foreground">
                  Program name is fixed when adding specializations
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Specialization *
              </label>
              <Input
                value={formData.Specialization}
                onChange={(e) => handleChange('Specialization', e.target.value)}
                className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.Specialization ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Artificial Intelligence, Marketing, Finance"
                disabled={loading}
              />
              {errors.Specialization && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.Specialization}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading 
                ? (isEditingProgram ? 'Adding...' : 'Creating...') 
                : (isEditingProgram ? 'Add Specialization' : 'Create Program')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationalProgramCreateModal;