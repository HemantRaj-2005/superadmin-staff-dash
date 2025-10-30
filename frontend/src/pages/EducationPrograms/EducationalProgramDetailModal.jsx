import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Trash2, 
  GraduationCap, 
  Calendar,
  FileText,
  Edit,
  Save,
  Clock
} from 'lucide-react';

const EducationalProgramDetailModal = ({ program, onClose, onUpdate, onHardDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    Program: program.Program,
    Specialization: program.Specialization
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(program._id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      Program: program.Program,
      Specialization: program.Specialization
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (program) => {
    if (!program.Program) return 'EP';
    return program.Program.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Program Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage educational program information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Program Information */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Program Information
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {isEditing ? 'Edit the program details below' : 'View program information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Program Name</label>
                {isEditing ? (
                  <Input
                    value={editData.Program}
                    onChange={(e) => setEditData(prev => ({ ...prev, Program: e.target.value }))}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter program name"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {program.Program}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
                {isEditing ? (
                  <Input
                    value={editData.Specialization}
                    onChange={(e) => setEditData(prev => ({ ...prev, Specialization: e.target.value }))}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter specialization"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-1">
                    <p className="text-gray-900 dark:text-white">
                      {program.Specialization}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium dark:text-white">
                  {formatDate(program.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-sm font-medium dark:text-white">
                  {formatDate(program.updatedAt)}
                </span>
              </div>
              {program.deletedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deleted At</span>
                  <span className="text-sm font-medium dark:text-white">
                    {formatDate(program.deletedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Separator className="my-6" />
          
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-400">
                Once you delete this educational program, there is no going back. Please be certain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="dark:bg-red-600 dark:hover:bg-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Program Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                      This action cannot be undone. This will permanently delete the program
                      "{program.Program} - {program.Specialization}" and remove it from the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    {/* <AlertDialogAction
                      onClick={() => onHardDelete(program._id)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                      Delete Program
                    </AlertDialogAction> */}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EducationalProgramDetailModal;