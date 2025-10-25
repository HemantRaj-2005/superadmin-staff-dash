// // components/ActivityLogsTable.js
// import React from 'react';

// const ActivityLogsTable = ({ logs, loading, onLogClick }) => {
//   const getActionIcon = (action) => {
//     const icons = {
//       LOGIN: '🔐',
//       LOGOUT: '🚪',
//       NAVIGATE: '🧭',
//       VIEW_USER: '👁️',
//       UPDATE_USER: '✏️',
//       DELETE_USER: '🗑️',
//       VIEW_POST: '📄',
//       UPDATE_POST: '📝',
//       DELETE_POST: '🗑️',
//       REMOVE_REACTION: '❤️',
//       VIEW_EVENT: '📅',
//       UPDATE_EVENT: '✏️',
//       DELETE_EVENT: '🗑️',
//       VIEW_ACTIVITY_LOGS: '📊',
//       EXPORT_DATA: '📤'
//     };
//     return icons[action] || '⚡';
//   };

  

//   const getActionColor = (action) => {
//     if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
//     if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800';
//     if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
//     if (action.includes('VIEW')) return 'bg-blue-100 text-blue-800';
//     return 'bg-gray-100 text-gray-800';
//   };

//   const formatTimestamp = (timestamp) => {
//     return new Date(timestamp).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };
// //ip track
//    const formatIpAddress = (log) => {
//     if (log.ipAddress === '::1' || log.ipAddress === '127.0.0.1') {
//       return (
//         <div>
//           <div className="text-sm text-gray-900 font-mono">{log.ipAddress}</div>
//           <div className="text-xs text-yellow-600">Localhost</div>
//         </div>
//       );
//     }

//     return (
//       <div>
//         <div className="text-sm text-gray-900 font-mono">{log.ipAddress}</div>
//         {log.ipDetails && log.ipDetails.country !== 'Unknown' && (
//           <div className="text-xs text-gray-500">
//             {log.ipDetails.city}, {log.ipDetails.country}
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         {[1, 2, 3, 4, 5].map(i => (
//           <div key={i} className="p-6 border-b border-gray-200 animate-pulse">
//             <div className="flex justify-between items-center">
//               <div className="space-y-2 flex-1">
//                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//               </div>
//               <div className="flex space-x-4">
//                 <div className="h-8 bg-gray-200 rounded w-20"></div>
//                 <div className="h-8 bg-gray-200 rounded w-24"></div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (logs.length === 0) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//         <div className="text-6xl mb-4">📊</div>
//         <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
//         <p className="text-gray-500">Try adjusting your search filters or wait for new activities.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Action
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Admin
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Description
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Resource
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Timestamp
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 IP Address
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {logs.map((log) => (
//               <tr 
//                 key={log._id} 
//                 className="hover:bg-gray-50 cursor-pointer transition duration-150 group"
//                 onClick={() => onLogClick(log)}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <span className="text-lg mr-3">{getActionIcon(log.action)}</span>
//                     <div>
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
//                         {log.action}
//                       </span>
//                       {log.changes && (
//                         <div className="text-xs text-gray-500 mt-1">Has Changes</div>
//                       )}
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm font-medium text-gray-900">
//                     {log.adminId?.name || 'Unknown'}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {log.adminId?.email}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="text-sm text-gray-900 group-hover:text-blue-600 transition duration-150">
//                     {log.description}
//                   </div>
//                   {log.metadata?.duration && (
//                     <div className="text-xs text-gray-500 mt-1">
//                       Duration: {log.metadata.duration}ms
//                     </div>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {log.resourceType || 'System'}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {log.resourceId ? log.resourceId._id : 'N/A'}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm text-gray-900">
//                     {formatTimestamp(log.createdAt)}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <td className="px-6 py-4 whitespace-nowrap">
//     {formatIpAddress(log)}  <div className="text-xs text-gray-500">
//                     {log.status}
//                   </div>
//   </td>
                 
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ActivityLogsTable;



// components/ActivityLogsTable.js - Updated with device info
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  LogOut, 
  Navigation, 
  Eye, 
  Edit, 
  Trash2, 
  Heart,
  FileText,
  Calendar,
  BarChart3,
  Download,
  UserPlus,
  Key,
  Laptop,
  Smartphone,
  Tablet
} from 'lucide-react';

const ActivityLogsTable = ({ logs, loading, onLogClick }) => {
  const getActionIcon = (action) => {
    const icons = {
      LOGIN: Shield,
      LOGOUT: LogOut,
      NAVIGATE: Navigation,
      VIEW_USER: Eye,
      UPDATE_USER: Edit,
      DELETE_USER: Trash2,
      VIEW_POST: FileText,
      UPDATE_POST: Edit,
      DELETE_POST: Trash2,
      REMOVE_REACTION: Heart,
      VIEW_EVENT: Calendar,
      UPDATE_EVENT: Edit,
      DELETE_EVENT: Trash2,
      VIEW_ACTIVITY_LOGS: BarChart3,
      EXPORT_DATA: Download,
      CREATE_ROLE: UserPlus,
      UPDATE_ROLE: Edit,
      DELETE_ROLE: Trash2,
      CREATE_ADMIN: UserPlus,
      UPDATE_ADMIN: Edit,
      DELETE_ADMIN: Trash2,
      RESET_ADMIN_PASSWORD: Key
    };
    const IconComponent = icons[action] || BarChart3;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActionVariant = (action) => {
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('CREATE')) return 'default';
    if (action.includes('VIEW')) return 'outline';
    return 'secondary';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return Laptop;
    
    const deviceType = deviceInfo.device?.type;
    if (deviceType === 'mobile') return Smartphone;
    if (deviceType === 'tablet') return Tablet;
    return Laptop;
  };

  const getDeviceDisplay = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown Device';
    
    const { device, os, browser } = deviceInfo;
    const deviceName = device.type === 'desktop' ? 'Desktop' : 
                      device.type === 'mobile' ? 'Mobile' : 
                      device.type === 'tablet' ? 'Tablet' : 'Device';
    
    return `${deviceName} • ${os.name} • ${browser.name}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground space-y-4">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search filters or wait for new activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Action</TableHead>
              <TableHead className="w-[180px]">Admin</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[250px]">Device & Location</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const DeviceIcon = getDeviceIcon(log.deviceInfo);
              
              return (
                <TableRow 
                  key={log._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => onLogClick(log)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="space-y-1">
                        <Badge variant={getActionVariant(log.action)} className="text-xs">
                          {log.action}
                        </Badge>
                        {log.changes && (
                          <div className="text-xs text-muted-foreground">Has Changes</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {log.adminId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.adminId?.email}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm group-hover:text-primary transition-colors">
                        {log.description}
                      </div>
                      {log.metadata?.duration && (
                        <div className="text-xs text-muted-foreground">
                          Duration: {log.metadata.duration}ms
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <DeviceIcon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {getDeviceDisplay(log.deviceInfo)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.location?.city && `${log.location.city}, `}
                          {log.location?.country || 'Unknown Location'}
                          {log.ipAddress && (
                            <span className="font-mono ml-2">({log.ipAddress})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {formatTimestamp(log.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ActivityLogsTable;