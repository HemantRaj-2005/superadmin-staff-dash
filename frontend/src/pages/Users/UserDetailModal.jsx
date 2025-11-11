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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
        Verified
      </Badge> :
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300">
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background shadow-xl border-l animate-in slide-in-from-right-0 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage 
                    src={user.profileImage} 
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold truncate">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="default" className="text-xs">
                      {user.role || 'User'}
                    </Badge>
                    {user.isGoogleUser && (
                      <Badge variant="outline" className="text-xs">
                        Google User
                      </Badge>
                    )}
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Mail className="h-3 w-3 mr-1" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic" className="flex items-center gap-2 text-xs">
                  <User className="h-4 w-4" />
                  <span>Basic</span>
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center gap-2 text-xs">
                  <User className="h-4 w-4" />
                  <span>Personal</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2 text-xs">
                  <GraduationCap className="h-4 w-4" />
                  <span>Education</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center gap-2 text-xs">
                  <Briefcase className="h-4 w-4" />
                  <span>Professional</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2 text-xs">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2 text-xs">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Personal Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">First Name</p>
                        <p className="font-semibold">{user.firstName || 'Not provided'}</p>
                      </div>
                      <Badge variant="outline">First Name</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Last Name</p>
                        <p className="font-semibold">{user.lastName || 'Not provided'}</p>
                      </div>
                      <Badge variant="outline">Last Name</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                      <Badge variant="outline">Email</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Mobile</p>
                        <p className="font-semibold">{user.mobileNumber || 'Not provided'}</p>
                      </div>
                      <Badge variant="outline">Mobile</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-semibold">{user.role || 'User'}</p>
                      </div>
                      <Badge variant="outline">Role</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Joined Date</p>
                        <p className="font-semibold">{formatDate(user.createdAt)}</p>
                      </div>
                      <Badge variant="secondary">Joined</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-semibold">{formatDate(user.updatedAt)}</p>
                      </div>
                      <Badge variant="secondary">Updated</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Bio & Introduction */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Bio & Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">
                          {user.bio || 'No bio provided'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Intro Line</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="italic">
                          {user.introLine ? `"${user.introLine}"` : 'No intro line provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-semibold">{formatDate(user.dateOfBirth)}</p>
                      </div>
                      <Badge variant="outline">DOB</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-semibold">{user.gender || 'Not provided'}</p>
                      </div>
                      <Badge variant="outline">Gender</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mail className="h-4 w-4" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Email Notifications</p>
                        <p className="font-semibold">{user.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <Badge variant={user.emailNotifications ? "default" : "secondary"}>
                        {user.emailNotifications ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Email Privacy</p>
                        <p className="font-semibold">{user.isEmailPrivate ? 'Private' : 'Public'}</p>
                      </div>
                      <Badge variant={user.isEmailPrivate ? "secondary" : "outline"}>
                        {user.isEmailPrivate ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Linkedin className="h-4 w-4" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.socialLinks?.linkedin ? (
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">LinkedIn</p>
                          <a 
                            href={user.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            View Profile
                          </a>
                        </div>
                        <Badge variant="outline">LinkedIn</Badge>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Linkedin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No social links provided</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                {user.education?.length > 0 ? user.education.map((edu, index) => (
                  <Card key={edu._id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{edu.institute}</CardTitle>
                          <CardDescription>{edu.program}</CardDescription>
                        </div>
                        <Badge variant="outline">{edu.qualification}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">University</span>
                          <span className="font-medium">{edu.university || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Specialization</span>
                          <span className="font-medium">{edu.specialization || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-medium">
                            {edu.startYear ? new Date(edu.startYear).getFullYear() : 'N/A'} - {' '}
                            {edu.completionYear ? new Date(edu.completionYear).getFullYear() : 'Present'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Performance</span>
                          <span className="font-medium">{edu.percentageOrCGPA || 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No education information available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-6">
                {user.professional?.length > 0 ? user.professional.map((prof, index) => (
                  <Card key={prof._id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{prof.designation}</CardTitle>
                          <CardDescription>{prof.companyName}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={prof.currentEmployment ? "default" : "secondary"}>
                            {prof.currentEmployment ? 'Current' : 'Previous'}
                          </Badge>
                          <Badge variant="outline">{prof.employmentType}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Location</span>
                          <span className="font-medium">{prof.location || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-medium">
                            {formatDate(prof.startYear)} - {' '}
                            {prof.currentEmployment ? 'Present' : formatDate(prof.completionYear)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Employment Type</span>
                          <span className="font-medium">{prof.employmentType}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm text-muted-foreground">Salary Band</span>
                          <span className="font-medium">
                            {prof.salaryBand ? `₹${prof.salaryBand.toLocaleString()}` : 'Not disclosed'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No professional experience available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                {user.address ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Current Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Street</p>
                          <p className="font-semibold">{user.address.street}</p>
                        </div>
                        <Badge variant="outline">Street</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">City</p>
                          <p className="font-semibold">{user.address.city}</p>
                        </div>
                        <Badge variant="outline">City</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">State</p>
                          <p className="font-semibold">{user.address.state}</p>
                        </div>
                        <Badge variant="outline">State</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Country</p>
                          <p className="font-semibold">{user.address.country}</p>
                        </div>
                        <Badge variant="outline">Country</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Postal Code</p>
                          <p className="font-semibold">{user.address.postalCode}</p>
                        </div>
                        <Badge variant="outline">Postal Code</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No address information available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Security & Privacy Settings</h3>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Settings</span>
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveSecuritySettings}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                    </div>
                  )}
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium cursor-pointer">Email Verification</Label>
                        <p className="text-xs text-muted-foreground">Mark email as verified</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={securitySettings.isEmailVerified}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isEmailVerified', checked)
                          }
                        />
                      ) : (
                        getStatusBadge(user.isEmailVerified)
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium cursor-pointer">Phone Verification</Label>
                        <p className="text-xs text-muted-foreground">Mark phone as verified</p>
                      </div>
                      {isEditing ? (
                        <Switch
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

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium cursor-pointer">Email Privacy</Label>
                        <p className="text-xs text-muted-foreground">Make email private</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={securitySettings.isEmailPrivate}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isEmailPrivate', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.isEmailPrivate ? "secondary" : "outline"}>
                          {user.isEmailPrivate ? 'Private' : 'Public'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium cursor-pointer">Mobile Privacy</Label>
                        <p className="text-xs text-muted-foreground">Make mobile number private</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={securitySettings.isMobilePrivate}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('isMobilePrivate', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.isMobilePrivate ? "secondary" : "outline"}>
                          {user.isMobilePrivate ? 'Private' : 'Public'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium cursor-pointer">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Enable email notifications</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={securitySettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            handleSecuritySettingChange('emailNotifications', checked)
                          }
                        />
                      ) : (
                        <Badge variant={user.emailNotifications ? "default" : "secondary"}>
                          {user.emailNotifications ? 'Enabled' : 'Disabled'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delete User Section */}
                <Separator />
                
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <CardHeader className="pb-3">
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
                        <Button variant="destructive" className="dark:bg-red-600 dark:hover:bg-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            for <strong>{user.firstName} {user.lastName}</strong> and remove all
                            their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default UserDetailModal;