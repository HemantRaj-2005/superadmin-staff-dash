import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Shield,
  X,
  Linkedin,
  Trash2,
  Save,
  Edit
} from 'lucide-react';

const UserDetailModal = ({ user, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    isEmailVerified: user.isEmailVerified || false,
    isPhoneVerified: user.isPhoneVerified || false,
    isEmailPrivate: user.isEmailPrivate || false,
    isMobilePrivate: user.isMobilePrivate || false,
    emailNotifications: user.emailNotifications || false
  });

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    return status ? 
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
        Verified
      </Badge> :
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
        Not Verified
      </Badge>;
  };

  const getInitials = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleSecuritySettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSecuritySettings = async () => {
    try {
      await onUpdate(user._id, securitySettings);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating security settings:', error);
    }
  };

  const handleCancelEdit = () => {
    setSecuritySettings({
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isEmailPrivate: user.isEmailPrivate || false,
      isMobilePrivate: user.isMobilePrivate || false,
      emailNotifications: user.emailNotifications || false
    });
    setIsEditing(false);
  };

  const handleDeleteUser = async () => {
    try {
      await onDelete(user._id);
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={user.profileImage} 
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={user.role === 'admin' ? 'default' : 'secondary'}
              className={user.role === 'admin' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                : 'dark:bg-gray-800 dark:text-gray-300'
              }
            >
              {user.role}
            </Badge>
            {user.isGoogleUser && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                Google User
              </Badge>
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

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger 
                value="basic" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>Basic</span>
              </TabsTrigger>
              <TabsTrigger 
                value="personal" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="education" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Education</span>
              </TabsTrigger>
              <TabsTrigger 
                value="professional" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <Briefcase className="h-4 w-4" />
                <span>Professional</span>
              </TabsTrigger>
              <TabsTrigger 
                value="address" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center text-gray-900 dark:text-white">
                      <User className="h-4 w-4 mr-2" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">First Name</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Last Name</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Mobile</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.mobileNumber || 'Not provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Profile Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Role</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.role || 'User'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Joined Date</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Last Updated</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Bio & Introduction</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Bio</label>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {user.bio || 'No bio provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Intro Line</label>
                      <p className="text-sm text-gray-900 dark:text-white italic">
                        {user.introLine ? `"${user.introLine}"` : 'No intro line provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(user.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Gender</label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.gender || 'Not provided'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 dark:text-white">Email Notifications</span>
                      <Badge variant={user.emailNotifications ? "default" : "secondary"} className="dark:bg-gray-700 dark:text-gray-300">
                        {user.emailNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 dark:text-white">Email Privacy</span>
                      <Badge variant={user.isEmailPrivate ? "secondary" : "outline"} className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                        {user.isEmailPrivate ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.socialLinks?.linkedin ? (
                      <a 
                        href={user.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all"
                      >
                        {user.socialLinks.linkedin}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No social links provided</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              {user.education?.length > 0 ? user.education.map((edu, index) => (
                <Card key={edu._id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base text-gray-900 dark:text-white">{edu.institute}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{edu.program}</CardDescription>
                      </div>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{edu.qualification}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">University</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.university || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Specialization</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.specialization || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Duration</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {edu.startYear ? new Date(edu.startYear).getFullYear() : 'N/A'} - {' '}
                          {edu.completionYear ? new Date(edu.completionYear).getFullYear() : 'Present'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Performance</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.percentageOrCGPA || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {[edu.city, edu.state].filter(Boolean).join(', ') || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Medium</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.medium || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Program Type</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.programType || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Board</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.board || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <GraduationCap className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No education information available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-4">
              {user.professional?.length > 0 ? user.professional.map((prof, index) => (
                <Card key={prof._id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base text-gray-900 dark:text-white">{prof.designation}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{prof.companyName}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={prof.currentEmployment ? "default" : "secondary"} className="dark:bg-gray-700 dark:text-gray-300">
                          {prof.currentEmployment ? 'Current' : 'Previous'}
                        </Badge>
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{prof.employmentType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Location</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{prof.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Duration</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(prof.startYear)} - {' '}
                          {prof.currentEmployment ? 'Present' : formatDate(prof.completionYear)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Employment Type</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{prof.employmentType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Salary Band</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {prof.salaryBand ? `₹${prof.salaryBand.toLocaleString()}` : 'Not disclosed'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No professional experience available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4">
              {user.address ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <MapPin className="h-5 w-5 mr-2" />
                        Current Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Street</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address.street}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">City</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address.city}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">State</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address.state}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Country</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address.country}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Postal Code</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address.postalCode}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">Map integration placeholder</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No address information available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Privacy Settings</h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Settings</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSecuritySettings}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Shield className="h-4 w-4 mr-2" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="email-verification" className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          Email Verification
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mark email as verified</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="email-verification"
                          checked={securitySettings.isEmailVerified}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isEmailVerified', checked)
                          }
                        />
                      ) : (
                        getStatusBadge(user.isEmailVerified)
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="phone-verification" className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          Phone Verification
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mark phone as verified</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="phone-verification"
                          checked={securitySettings.isPhoneVerified}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isPhoneVerified', checked)
                          }
                        />
                      ) : (
                        getStatusBadge(user.isPhoneVerified)
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-900 dark:text-white">Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="email-privacy" className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          Email Privacy
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Make email private</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="email-privacy"
                          checked={securitySettings.isEmailPrivate}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isEmailPrivate', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.isEmailPrivate ? "secondary" : "outline"} className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                          {user.isEmailPrivate ? 'Private' : 'Public'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="mobile-privacy" className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          Mobile Privacy
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Make mobile number private</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="mobile-privacy"
                          checked={securitySettings.isMobilePrivate}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isMobilePrivate', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.isMobilePrivate ? "secondary" : "outline"} className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                          {user.isMobilePrivate ? 'Private' : 'Public'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="email-notifications" className="text-sm cursor-pointer text-gray-900 dark:text-white">
                          Email Notifications
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enable email notifications</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          id="email-notifications"
                          checked={securitySettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('emailNotifications', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.emailNotifications ? "default" : "secondary"} className="dark:bg-gray-700 dark:text-gray-300">
                          {user.emailNotifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delete User Section */}
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-400">
                    Once you delete a user, there is no going back. Please be certain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center space-x-2 dark:bg-red-600 dark:hover:bg-red-700">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete User Account</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                          This action cannot be undone. This will permanently delete the user account
                          for <strong className="dark:text-white">{user.firstName} {user.lastName}</strong> and remove all
                          their data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteUser}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;