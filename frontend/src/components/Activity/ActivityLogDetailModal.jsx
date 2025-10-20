// import React, { useState, useEffect } from 'react';

// const ActivityLogDetailModal = ({ log = {}, onClose }) => {
//   const [activeTab, setActiveTab] = useState('overview');

//   // Auto-switch to overview if no changes
//   useEffect(() => {
//     const changes = getChangeDetails();
//     if (activeTab === 'changes' && (!changes || changes.length === 0)) {
//       setActiveTab('overview');
//     }
//     // Only re-run when the actual log object changes
//   }, [log]);

//   const formatJSON = (obj) => {
//     if (obj === undefined || obj === null) return '-';
//     if (typeof obj === 'object') return JSON.stringify(obj, null, 2);
//     return String(obj);
//   };

//   const getChangeDetails = () => {
//     if (!log.changes) return null;

//     const { oldValues, newValues } = log.changes;
//     const changes = [];

//     if (oldValues && newValues) {
//       Object.keys(newValues).forEach((key) => {
//         const oldVal = oldValues[key];
//         const newVal = newValues[key];
//         if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
//           changes.push({ field: key, oldValue: oldVal, newValue: newVal });
//         }
//       });
//     }

//     return changes;
//   };

//   const changes = getChangeDetails();

//   // Helper to safely extract resource id (string or object)
//   const resourceIdValue = () => {
//     if (!log.resourceId) return '-';
//     if (typeof log.resourceId === 'string') return log.resourceId;
//     if (log.resourceId._id) return log.resourceId._id;
//     return JSON.stringify(log.resourceId);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-8">
//           {/* Header */}
//           <div className="flex justify-between items-start mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">Activity Details</h2>
//               <div className="flex items-center space-x-4 text-sm text-gray-500">
//                 <span>ID: {log._id ?? '-'}</span>
//                 <span>•</span>
//                 <span>Action: {log.action ?? '-'}</span>
//                 <span>•</span>
//                 <span>Status: {log.status ?? '-'}</span>
//               </div>
//             </div>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150">
//               ✕
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 mb-6">
//             <nav className="-mb-px flex space-x-8">
//               {[,'overview','changes'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
//                     activeTab === tab
//                       ? 'border-blue-500 text-blue-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Tab Content */}
//           <div className="space-y-6">
//             {activeTab === 'overview' && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left column: Basic & Resource */}
//                 <div className="space-y-6">
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
//                         <p className="text-gray-900">{log.adminId?.name ?? '-'} {log.adminId?.email ? `(${log.adminId.email})` : ''}</p>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                           {log.action ?? '-'}
//                         </span>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                         <p className="text-gray-900">{log.description ?? '-'}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
//                         <p className="text-gray-900">{log.resourceType ?? 'System'}</p>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
//                         <p className="text-gray-900 font-mono text-sm">{resourceIdValue()}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right column: Network/Device & Technical */}
//                 <div className="space-y-6">
//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Network & Device</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">IP & Location</h4>
//                         <div className="space-y-2">
//                           <div className="flex justify-between">
//                             <span className="text-sm text-gray-600">IP Address:</span>
//                             <span className="text-sm font-mono text-gray-900">{log.ipAddress ?? '-'}</span>
//                           </div>
//                           {log.ipDetails?.country && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Country:</span>
//                               <span className="text-sm text-gray-900">{log.ipDetails.country}</span>
//                             </div>
//                           )}
//                           {log.ipDetails?.city && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">City:</span>
//                               <span className="text-sm text-gray-900">{log.ipDetails.city}</span>
//                             </div>
//                           )}
//                           {log.ipDetails?.isp && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">ISP:</span>
//                               <span className="text-sm text-gray-900">{log.ipDetails.isp}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">Browser & Device</h4>
//                         <div className="space-y-2">
//                           {log.userAgentDetails?.browser && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Browser:</span>
//                               <span className="text-sm text-gray-900 ">{log.userAgentDetails.browser}</span>
//                             </div>
//                           )}
//                           {log.userAgentDetails?.os && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">OS:</span>
//                               <span className="text-sm text-gray-900">{log.userAgentDetails.os}</span>
//                             </div>
//                           )}
//                           {log.userAgentDetails?.device && (
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Device:</span>
//                               <span className="text-sm text-gray-900">{log.userAgentDetails.device}</span>
//                             </div>
//                           )}
//                           <div className="flex justify-between">
//                             <span className="text-sm text-gray-600">User Agent:</span>
//                             <span className="text-sm text-gray-900 ml-2 ">{log.userAgent ?? '-'}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-xl p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
//                         <p className="text-gray-900">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</p>
//                       </div>

//                       {log.metadata?.duration && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
//                           <p className="text-gray-900">{log.metadata.duration}ms</p>
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint & Method</label>
//                         <p className="text-gray-900 font-mono text-sm">{log.endpoint ?? '-'} <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800">{log.method ?? '-'}</span></p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'changes' && (
//               <div className="space-y-6">
//                 {changes && changes.length > 0 ? (
//                   <>
//                     <div className="bg-green-50 border border-green-200 rounded-xl p-4">
//                       <div className="flex items-center">
//                         <span className="text-green-600 text-lg mr-2">📊</span>
//                         <span className="text-green-800 font-medium">{changes.length} field(s) were modified</span>
//                       </div>
//                     </div>

//                     <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Value</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Value</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {changes.map((change, index) => (
//                             <tr key={index} className="hover:bg-gray-50">
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <span className="text-sm font-medium text-gray-900 bg-yellow-100 px-2 py-1 rounded">{change.field}</span>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <pre className="text-sm text-gray-600 bg-red-50 p-2 rounded max-w-md overflow-x-auto">{formatJSON(change.oldValue)}</pre>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <pre className="text-sm text-gray-600 bg-green-50 p-2 rounded max-w-md overflow-x-auto">{formatJSON(change.newValue)}</pre>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="bg-gray-50 rounded-xl p-8 text-center">
//                     <div className="text-4xl mb-4">📝</div>
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Detected</h3>
//                     <p className="text-gray-500">This action didn't involve any data modifications or change tracking is not available.</p>
//                     <button onClick={() => setActiveTab('overview')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">View Overview</button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActivityLogDetailModal;




// components/ActivityLogDetailModal.js - Updated with device info
import React, { useState } from 'react';

const ActivityLogDetailModal = ({ log, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

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

  const getDeviceDisplay = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown Device';
    
    const { device, os, browser } = deviceInfo;
    const deviceType = device.type === 'desktop' ? 'Desktop' : 
                      device.type === 'mobile' ? 'Mobile' : 
                      device.type === 'tablet' ? 'Tablet' : 'Device';
    
    return `${device.vendor || ''} ${device.model || deviceType} • ${os.name} ${os.version} • ${browser.name} ${browser.version}`;
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return '💻';
    
    const deviceType = deviceInfo.device?.type;
    if (deviceType === 'mobile') return '📱';
    if (deviceType === 'tablet') return '📟';
    return '💻';
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
              {['overview', 'changes'].map((tab) => (
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

                {/* Technical Details */}
                <div className="space-y-6">
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
                        <p className="text-gray-900 text-sm font-mono bg-gray-100 p-2 rounded">
                          {log.userAgent}
                        </p>
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

            {activeTab === 'device' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Device Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{getDeviceIcon(log.deviceInfo)}</span>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {getDeviceDisplay(log.deviceInfo)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {log.deviceInfo?.device?.type || 'Unknown'} Device
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Operating System</label>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium">{log.deviceInfo?.os?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{log.deviceInfo?.os?.version || 'Unknown version'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Browser</label>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium">{log.deviceInfo?.browser?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{log.deviceInfo?.browser?.version || 'Unknown version'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium capitalize">{log.deviceInfo?.device?.type || 'desktop'}</p>
                          <p className="text-sm text-gray-500">
                            {log.deviceInfo?.device?.vendor || 'Unknown'} {log.deviceInfo?.device?.model || ''}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium">{log.deviceInfo?.engine?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{log.deviceInfo?.engine?.version || 'Unknown version'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-4xl">🌍</span>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {log.location?.city || 'Unknown Location'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {log.location?.region && `${log.location.region}, `}{log.location?.country || 'Unknown Country'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <p className="text-gray-900">{log.location?.country || 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <p className="text-gray-900">{log.location?.region || 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <p className="text-gray-900">{log.location?.city || 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <p className="text-gray-900">{log.location?.timezone || 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                        <p className="text-gray-900 font-mono">{log.ipAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ... rest of the tabs (changes, technical) remain the same ... */}
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
                  </div>
                )}

                {/* Raw Changes Data */}
           
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Metadata</h3>
                  <pre className="text-sm bg-white p-4 rounded border border-gray-200 overflow-x-auto max-h-96">
                    {formatJSON(log.metadata)}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Activity Log Data</h3>
                  <pre className="text-sm bg-white p-4 rounded border border-gray-200 overflow-x-auto max-h-96">
                    {formatJSON(log)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailModal;