// pages/Users/UserTable.jsx - Updated with soft delete support
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Trash2, Undo, UserX } from 'lucide-react';

const UserTable = ({ 
  users, 
  loading, 
  onUserClick, 
  onDeleteUser, 
  onRestoreUser,
  canEdit,
  showDeleted = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-24" />
                {canEdit && <Skeleton className="h-8 w-16" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            {showDeleted ? 'No deleted users found' : 'No users found'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getStatusBadge = (user) => {
    if (user.isDeleted) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
          <UserX className="h-3 w-3 mr-1" />
          Deleted
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
        {user.role}
      </Badge>
    );
  };

  const getDeletedInfo = (user) => {
    if (!user.isDeleted) return null;
    
    return (
      <div className="text-xs text-red-600 mt-1">
        Deleted on {new Date(user.deletedAt).toLocaleDateString()}
      </div>
    );
  };

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{showDeleted ? 'Deleted' : 'Joined'}</TableHead>
              {(canEdit || onDeleteUser) && (
                <TableHead className="w-[180px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user._id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  user.isDeleted ? 'bg-red-50 opacity-75' : ''
                }`}
                onClick={() => onUserClick(user)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className={`h-10 w-10 ${user.isDeleted ? 'opacity-60' : ''}`}>
                      <AvatarImage 
                        src={user.profileImage} 
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                        {user.isDeleted && (
                          <span className="ml-2 text-xs text-red-600">(Deleted)</span>
                        )}
                      </div>
                      {getDeletedInfo(user)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {showDeleted 
                      ? (user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'N/A')
                      : new Date(user.createdAt).toLocaleDateString()
                    }
                  </div>
                </TableCell>
                {(canEdit || onDeleteUser) && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {canEdit && !user.isDeleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUserClick(user);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                      )}
                      
                      {onDeleteUser && !user.isDeleted && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.firstName} {user.lastName}? 
                                This will soft delete the user and hide their posts. The user can be restored later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteUser(user._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {onRestoreUser && user.isDeleted && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50"
                            >
                              <Undo className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Restore User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to restore {user.firstName} {user.lastName}? 
                                This will make the user active again and restore their posts.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onRestoreUser(user._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Restore
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UserTable;