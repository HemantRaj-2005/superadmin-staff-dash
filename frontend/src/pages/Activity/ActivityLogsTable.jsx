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