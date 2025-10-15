// components/ActivityLogDetailModal.js
import React, { useState, useEffect } from 'react';

const ActivityLogDetailModal = ({ log, onClose }) => {
  const [activeTab, setActiveTab] = useState('changes');

  // Auto-switch to overview if no changes
  useEffect(() => {
    const changes = getChangeDetails();
    if (activeTab === 'changes' && (!changes || changes.length === 0)) {
      setActiveTab('overview');
    }
  }, [activeTab, log]); // Add log to dependencies

  const formatJSON = (obj) => {
    if (!obj) return 'No data';
    return JSON.stringify(obj, null, 2);
  };

  const getChangeDetails = () => {
    if (!log.changes) return null;

    const { oldValues, newValues } = log.changes;
    const changes = [];

    if (oldValues && newValues) {
      Object.keys(newValues).forEach(key => {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes.push({
            field: key,
            oldValue: oldValues[key],
            newValue: newValues[key]
          });
        }
      });
    }

    return changes;
  };

  const changes = getChangeDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Activity Details
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>ID: {log._id}</span>
                <span>•</span>
                <span>Action: {log.action}</span>
                <span>•</span>
                <span>Status: {log.status}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['changes', 'overview'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
                        <p className="text-gray-900">
                          {log.adminId?.name} ({log.adminId?.email})
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900">{log.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Resource Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                        <p className="text-gray-900">{log.resourceType || 'System'}</p>
                      </div>
                      {log.resourceId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
                          <p className="text-gray-900 font-mono text-sm">{log.resourceId._id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">IP Address & Location</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">IP Address:</span>
                            <span className="text-sm font-mono text-gray-900">{log.ipAddress}</span>
                          </div>
                          {log.ipDetails && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Country:</span>
                                <span className="text-sm text-gray-900">{log.ipDetails.country}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">City:</span>
                                <span className="text-sm text-gray-900">{log.ipDetails.city}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">ISP:</span>
                                <span className="text-sm text-gray-900">{log.ipDetails.isp}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Device & Browser</h4>
                        <div className="space-y-2">
                          {log.userAgentDetails && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Browser:</span>
                                <span className="text-sm text-gray-900">{log.userAgentDetails.browser}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">OS:</span>
                                <span className="text-sm text-gray-900">{log.userAgentDetails.os}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Device:</span>
                                <span className="text-sm text-gray-900">{log.userAgentDetails.device}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">User Agent:</span>
                            <span className="text-sm text-gray-900 ml-2">{log.userAgent}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                        <p className="text-gray-900">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                        <p className="text-gray-900 font-mono">{log.ipAddress}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                        <p className="text-gray-900 text-sm">{log.userAgent}</p>
                      </div>
                      {log.metadata?.duration && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <p className="text-gray-900">{log.metadata.duration}ms</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endpoint Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                        <p className="text-gray-900 font-mono text-sm">{log.endpoint}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">
                          {log.method}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'changes' && (
              <div className="space-y-6">
                {changes && changes.length > 0 ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <span className="text-green-600 text-lg mr-2">📊</span>
                        <span className="text-green-800 font-medium">
                          {changes.length} field(s) were modified
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Field
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Old Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              New Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {changes.map((change, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900 bg-yellow-100 px-2 py-1 rounded">
                                  {change.field}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <pre className="text-sm text-gray-600 bg-red-50 p-2 rounded max-w-md overflow-x-auto">
                                  {formatJSON(change.oldValue)}
                                </pre>
                              </td>
                              <td className="px-6 py-4">
                                <pre className="text-sm text-gray-600 bg-green-50 p-2 rounded max-w-md overflow-x-auto">
                                  {formatJSON(change.newValue)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Detected</h3>
                    <p className="text-gray-500">
                      This action didn't involve any data modifications or change tracking is not available.
                    </p>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                      View Overview
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailModal;