// components/UserDetailModal.js
import React, { useState } from 'react';

const UserDetailModal = ({ user, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
  const [editingEducationField, setEditingEducationField] = useState(null);

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const handleEducationEdit = (index, field, value) => {
    setEditingEducationIndex(index);
    setEditingEducationField(field);
    setEditValue(value || '');
  };

  let data=user[editingField];
  const handleSave = (e) => {
    e.preventDefault();
    if (editingField && editValue !== undefined) {
      onUpdate(user._id, { [editingField]: editValue});
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleEducationSave = (e) => {
    e.preventDefault();
    if (editingEducationIndex !== null && editingEducationField && editValue !== undefined) {
      const updatedEducation = [...user.education];
      updatedEducation[editingEducationIndex] = {
        ...updatedEducation[editingEducationIndex],
        [editingEducationField]: editValue
      };
      onUpdate(user._id, { education: updatedEducation });
    }
    setEditingEducationIndex(null);
    setEditingEducationField(null);
    setEditValue('');
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setEditingField(null);
    setEditingEducationIndex(null);
    setEditingEducationField(null);
    setEditValue('');
  };

  const renderField = (label, value, fieldName, type = 'text') => {
    const displayValue = value || 'Not provided';
    
    if (editingField === fieldName) {
      return (
        <div className="flex items-center space-x-2 mt-1">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <div className="flex space-x-1">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-start mt-1">
        <span className={`text-gray-900 ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`}>
          {displayValue}
        </span>
        <button
          onClick={() => handleEdit(fieldName, value)}
          className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  };

  const renderEducationField = (edu, index, field, label, type = 'text') => {
    const value = edu[field] || '';
    const displayValue = value || 'Not specified';
    
    if (editingEducationIndex === index && editingEducationField === field) {
      return (
        <div className="flex items-center space-x-2 mt-1">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="3"
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          )}
          <div className="flex space-x-1">
            <button
              onClick={handleEducationSave}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-start mt-1">
        <span className={`text-gray-900 text-sm ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`}>
          {displayValue}
        </span>
        <button
          onClick={() => handleEducationEdit(index, field, value)}
          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEducationDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).getFullYear();
  };

  const getStatusBadge = (status) => {
    return status ? 
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span> :
      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Not Verified</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header Section with Profile Photo */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 pb-6 border-b">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                src={user.profileImage || '/default-avatar.png'}
                alt={`${user.firstName} ${user.lastName}`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-lg text-gray-600 mt-1">{user.email}</p>
                  {user.introLine && (
                    <p className="text-gray-700 italic mt-2">"{user.introLine}"</p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.isGoogleUser && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Google User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'basic', name: 'Basic Info', icon: '👤' },
                { id: 'personal', name: 'Personal', icon: '🎯' },
                { id: 'education', name: 'Education', icon: '🎓' },
                { id: 'professional', name: 'Professional', icon: '💼' },
                { id: 'address', name: 'Address', icon: '📍' },
                { id: 'security', name: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Details</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">First Name</label>
                      {renderField('First Name', user.firstName, 'firstName')}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Last Name</label>
                      {renderField('Last Name', user.lastName, 'lastName')}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email</label>
                      {renderField('Email', user.email, 'email')}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Mobile</label>
                      {renderField('Mobile', user.mobileNumber, 'mobileNumber')}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Info</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Role</label>
                      <p className="text-gray-900 mt-1">{user.role || 'User'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Joined Date</label>
                      <p className="text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900 mt-1">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio & Introduction</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Bio</label>
                      {renderField('Bio', user.bio, 'bio', 'textarea')}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Intro Line</label>
                      {renderField('Intro Line', user.introLine, 'introLine')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Information</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900 mt-1">{formatDate(user.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Gender</label>
                      {renderField('Gender', user.gender, 'gender')}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferences</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email Notifications</label>
                      <div className="mt-1">
                        {user.emailNotifications ? 
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Enabled</span> :
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Disabled</span>
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email Privacy</label>
                      <div className="mt-1">
                        {user.isEmailPrivate ? 
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Private</span> :
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Public</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Social Links</label>
                  <div className="space-y-3">
                    {user.socialLinks?.linkedin ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">LinkedIn</label>
                        <a 
                          href={user.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-1 block truncate"
                        >
                          {user.socialLinks.linkedin}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No social links provided</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                {user.education?.length > 0 ? user.education.map((edu, index) => (
                  <div key={edu._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Education #{index + 1}
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {edu.qualification} 
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Institute Information */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Institute</label>
                        {renderEducationField(edu, index, 'institute', 'Institute')}
                        {edu.university && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">University</label>
                            {renderEducationField(edu, index, 'university', 'University')}
                          </div>
                        )}
                      </div>
                      
                      {/* Program Information */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Program</label>
                        {renderEducationField(edu, index, 'program', 'Program')}
                        {edu.specialization && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
                            {renderEducationField(edu, index, 'specialization', 'Specialization')}
                          </div>
                        )}
                      </div>
                      
                      {/* Duration */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Start Year</label>
                        {renderEducationField(edu, index, 'startYear', 'Start Year', 'date')}
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Completion Year</label>
                          {renderEducationField(edu, index, 'completionYear', 'Completion Year', 'date')}
                        </div>
                      </div>
                      
                      {/* Performance */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Performance</label>
                        {renderEducationField(edu, index, 'percentageOrCGPA', 'Percentage/CGPA')}
                        {edu.medium && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Medium</label>
                            {renderEducationField(edu, index, 'medium', 'Medium')}
                          </div>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                        {renderEducationField(edu, index, 'city', 'City')}
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
                          {renderEducationField(edu, index, 'state', 'State')}
                        </div>
                      </div>
                      
                      {/* Additional Information */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Board/University</label>
                        {renderEducationField(edu, index, 'board', 'Board')}
                        {edu.programType && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Program Type</label>
                            {renderEducationField(edu, index, 'programType', 'Program Type')}
                          </div>
                        )}
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Pincode</label>
                        {renderEducationField(edu, index, 'pincode', 'Pincode')}
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Qualification</label>
                        {renderEducationField(edu, index, 'qualification', 'Qualification')}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No education information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-4">
                {user.professional?.length > 0 ? user.professional.map((prof, index) => (
                  <div key={prof._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{prof.designation}</h4>
                        <p className="text-gray-600">{prof.companyName}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prof.currentEmployment 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {prof.currentEmployment ? 'Current' : 'Previous'}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {prof.employmentType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                        <p className="text-gray-900 font-medium mt-1">{prof.location}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                        <p className="text-gray-900 font-medium mt-1">
                          {formatDate(prof.startYear)} - {prof.currentEmployment ? 'Present' : formatDate(prof.completionYear)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Employment Type</label>
                        <p className="text-gray-900 font-medium mt-1">{prof.employmentType}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Salary Band</label>
                        <p className="text-gray-900 font-medium mt-1">
                          {prof.salaryBand ? `₹${prof.salaryBand.toLocaleString()}` : 'Not disclosed'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No professional experience available</p>
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {user.address ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Street</label>
                        <p className="text-gray-900 font-medium mt-1">{user.address.street}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                        <p className="text-gray-900 font-medium mt-1">{user.address.city}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
                        <p className="text-gray-900 font-medium mt-1">{user.address.state}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Country</label>
                        <p className="text-gray-900 font-medium mt-1">{user.address.country}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Postal Code</label>
                        <p className="text-gray-900 font-medium mt-1">{user.address.postalCode}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No address information available</p>
                  </div>
                )}
                
                {/* Map placeholder */}
                <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-gray-500 text-sm">Map view would be displayed here</p>
                    <p className="text-gray-400 text-xs mt-1">Integration with maps service</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Email Verification</span>
                      {getStatusBadge(user.isEmailVerified)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Phone Verification</span>
                      {getStatusBadge(user.isPhoneVerified)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Google Account</span>
                      {getStatusBadge(user.isGoogleUser)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Email Privacy</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.isEmailPrivate 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isEmailPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mobile Privacy</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.isMobilePrivate 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isMobilePrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* OTP Information */}
                {(user.otp || user.otpVerificationId) && (
                  <div className="md:col-span-2 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-4">OTP Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {user.otp && (
                        <div>
                          <label className="block text-xs font-medium text-yellow-700">OTP Code</label>
                          <p className="text-yellow-900 font-mono mt-1">{user.otp}</p>
                        </div>
                      )}
                      {user.otpExpires && (
                        <div>
                          <label className="block text-xs font-medium text-yellow-700">OTP Expires</label>
                          <p className="text-yellow-900 mt-1">{formatDate(user.otpExpires)}</p>
                        </div>
                      )}
                      {user.otpVerificationId && (
                        <div>
                          <label className="block text-xs font-medium text-yellow-700">Verification ID</label>
                          <p className="text-yellow-900 font-mono mt-1">{user.otpVerificationId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this user?')) {
                  // You can add delete functionality here
                  console.log('Delete user:', user._id);
                }
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;