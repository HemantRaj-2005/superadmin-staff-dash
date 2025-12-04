// src/pages/Users/UserTable.jsx - Updated with permission checks
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
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
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

const UserTable = ({ 
  users, 
  loading, 
  onUserClick, 
  onDeleteUser, 
  onRestoreUser, 
  canEdit, 
  showDeletedActions 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" variant="shimmer" />
                  <Skeleton className="h-3 w-1/3" variant="shimmer" />
                </div>
                <Skeleton className="h-6 w-20" variant="shimmer" />
                <Skeleton className="h-4 w-24" variant="shimmer" />
                {(canEdit || showDeletedActions) && <Skeleton className="h-8 w-16" variant="shimmer" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12">
          <EmptyState
            icon={Users}
            title="No users found"
            description="There are no users to display at the moment."
            variant="minimal"
          />
        </CardContent>
      </Card>
    );
  }

  const getInitials = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Alumn</TableHead>
              <TableHead>Database ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {(canEdit || showDeletedActions) && (
                <TableHead className="w-[150px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onUserClick(user)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
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
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user._id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 hover:bg-green-100"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                {(canEdit || showDeletedActions) && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {canEdit && (
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
                      {showDeletedActions && onRestoreUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreUser(user._id);
                          }}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50"
                        >
                          Restore
                        </Button>
                      )}
                      {onDeleteUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              {showDeletedActions ? 'Permanently Delete' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {showDeletedActions ? 'Permanently Delete User' : 'Delete User'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {showDeletedActions 
                                  ? `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone and all user data will be permanently removed from the database.`
                                  : `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone and all user data will be permanently removed.`
                                }
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteUser(user._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {showDeletedActions ? 'Permanently Delete' : 'Delete'}
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