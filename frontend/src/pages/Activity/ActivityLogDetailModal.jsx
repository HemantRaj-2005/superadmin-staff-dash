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
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Calendar,
  MapPin,
  Monitor,
  Globe,
  Code,
  FileText,
  Shield,
  User,
  RefreshCw,
  Network,
} from "lucide-react";

const ActivityLogDetailModal = ({ log, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const formatJSON = (obj) => {
    if (!obj) return "No data";
    return JSON.stringify(obj, null, 2);
  };

  const getChangeDetails = () => {
    if (!log.changes) return null;

    const { oldValues, newValues } = log.changes;
    const changes = [];

    if (oldValues && newValues) {
      Object.keys(newValues).forEach((key) => {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes.push({
            field: key,
            oldValue: oldValues[key],
            newValue: newValues[key],
          });
        }
      });
    }

    return changes;
  };

  const getDeviceDisplay = (deviceInfo) => {
    if (!deviceInfo) return "Unknown Device";

    const { device, os, browser } = deviceInfo;
    const deviceType =
      device.type === "desktop"
        ? "Desktop"
        : device.type === "mobile"
        ? "Mobile"
        : device.type === "tablet"
        ? "Tablet"
        : "Device";

    return `${device.vendor || ""} ${device.model || deviceType} • ${os.name} ${
      os.version
    } • ${browser.name} ${browser.version}`;
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Monitor className="h-5 w-5" />;

    const deviceType = deviceInfo.device?.type;
    if (deviceType === "mobile") return "📱";
    if (deviceType === "tablet") return "📟";
    return <Monitor className="h-5 w-5" />;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      success:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      error:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      warning:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
      pending:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    };

    return (
      <Badge
        variant="outline"
        className={statusColors[status] || statusColors.pending}
      >
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  const getActionBadge = (action) => {
    const actionColors = {
      create:
        "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
      update: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      delete: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      read: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
      login:
        "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      logout:
        "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    };

    return (
      <Badge
        className={actionColors[action?.toLowerCase()] || actionColors.read}
      >
        {action}
      </Badge>
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const changes = getChangeDetails();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Activity Log Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(log.status)}
            {getActionBadge(log.action)}
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger
                value="overview"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="device"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <Monitor className="h-4 w-4" />
                <span>Device & Location</span>
              </TabsTrigger>
              <TabsTrigger
                value="changes"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Changes</span>
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <Code className="h-4 w-4" />
                <span>Technical</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center text-gray-900 dark:text-white">
                      <User className="h-4 w-4 mr-2" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Admin
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.adminId?.name} ({log.adminId?.email})
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Action
                      </label>
                      <div className="mt-1">{getActionBadge(log.action)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <div className="mt-1">{getStatusBadge(log.status)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {log.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                      Resource Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Resource Type
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.resourceType || "System"}
                      </p>
                    </div>
                    {log.resourceId && (
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Resource ID
                        </label>
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {log.resourceId._id}
                        </code>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Endpoint
                      </label>
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                        {log.endpoint}
                      </code>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Method
                      </label>
                      <Badge
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        {log.method}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Details */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Timestamp
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        IP Address
                      </label>
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {log.ipAddress}
                      </code>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        User Agent
                      </label>
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded block break-all">
                        {log.userAgent}
                      </code>
                    </div>
                    {log.metadata?.duration && (
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Duration
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.metadata.duration}ms
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Device & Location Tab */}
            <TabsContent value="device" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Monitor className="h-5 w-5 mr-2" />
                      Device Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        {getDeviceIcon(log.deviceInfo)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {getDeviceDisplay(log.deviceInfo)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {log.deviceInfo?.device?.type || "Unknown"} Device
                        </p>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                          Operating System
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {log.deviceInfo?.os?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.deviceInfo?.os?.version || "Unknown version"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                          Browser
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {log.deviceInfo?.browser?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.deviceInfo?.browser?.version ||
                              "Unknown version"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                          Device Type
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="font-medium text-sm text-gray-900 dark:text-white capitalize">
                            {log.deviceInfo?.device?.type || "desktop"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.deviceInfo?.device?.vendor || "Unknown"}{" "}
                            {log.deviceInfo?.device?.model || ""}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                          Engine
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {log.deviceInfo?.engine?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.deviceInfo?.engine?.version ||
                              "Unknown version"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center justify-center h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {log.location?.city || "Unknown Location"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {log.location?.region && `${log.location.region}, `}
                          {log.location?.country || "Unknown Country"}
                        </p>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                            Country
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {log.location?.country || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                            Region
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {log.location?.region || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                            City
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {log.location?.city || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                            Timezone
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {log.location?.timezone || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                          IP Address
                        </label>
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Changes Tab */}
            <TabsContent value="changes" className="space-y-4">
              {changes && changes.length > 0 ? (
                <>
                  <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-green-800 dark:text-green-300 font-medium">
                          {changes.length} field(s) were modified
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">
                        Field Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <Table>
                          <TableHeader>
                            <TableRow className="dark:border-gray-700">
                              <TableHead className="dark:text-gray-300">
                                Field
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                Old Value
                              </TableHead>
                              <TableHead className="dark:text-gray-300">
                                New Value
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {changes.map((change, index) => (
                              <TableRow
                                key={index}
                                className="dark:border-gray-700"
                              >
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
                                  >
                                    {change.field}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <pre className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded max-w-md overflow-x-auto dark:text-red-300">
                                    {formatJSON(change.oldValue)}
                                  </pre>
                                </TableCell>
                                <TableCell>
                                  <pre className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded max-w-md overflow-x-auto dark:text-green-300">
                                    {formatJSON(change.newValue)}
                                  </pre>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No changes detected
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      This action didn't involve any data modifications or
                      change tracking is not available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Network className="h-5 w-5 mr-2" />
                      Request Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded overflow-x-auto dark:text-gray-300">
                        {formatJSON(log.metadata)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Code className="h-5 w-5 mr-2" />
                      Full Log Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded overflow-x-auto dark:text-gray-300">
                        {formatJSON(log)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailModal;
