// // components/UserTable.js (Updated)
// import React from 'react';
// import Avatar from '../Profile/Avatar';

// const UserTable = ({ users, loading, onUserClick, onDeleteUser }) => {
//   if (loading) {
//     return (
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow-md rounded-lg overflow-hidden">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               User
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Contact
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Status
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Joined
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {users.map((user) => (
//             <tr 
//               key={user._id} 
//               className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
//               onClick={() => onUserClick(user)}
//             >
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <Avatar
//                     src={user.profileImage}
//                     alt={`${user.firstName} ${user.lastName}`}
//                     size="md"
//                   />
//                   <div className="ml-4">
//                     <div className="text-sm font-semibold text-gray-900">
//                       {user.firstName} {user.lastName}
//                     </div>
//                     <div className="flex items-center mt-1 space-x-1">
//                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
//                         user.role === 'admin' 
//                           ? 'bg-purple-100 text-purple-800'
//                           : 'bg-blue-100 text-blue-800'
//                       }`}>
//                         {user.role}
//                       </span>
//                       {user.isGoogleUser && (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
//                           Google
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="text-sm text-gray-900">{user.email}</div>
//                 {user.mobileNumber && (
//                   <div className="text-sm text-gray-500">+{user.mobileNumber}</div>
//                 )}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex flex-col space-y-1">
//                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                     user.isEmailVerified 
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
//                   </span>
//                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                     user.isPhoneVerified 
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {user.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
//                   </span>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="text-sm text-gray-900">
//                   {new Date(user.createdAt).toLocaleDateString()}
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   {new Date(user.createdAt).toLocaleTimeString()}
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
//                       onDeleteUser(user._id);
//                     }
//                   }}
//                   className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UserTable;



// components/UserTable.js - Updated with permission checks
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

const UserTable = ({ users, loading, onUserClick, onDeleteUser, canEdit }) => {
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
            No users found
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (user) => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {(canEdit || onDeleteUser) && (
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
                {(canEdit || onDeleteUser) && (
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
                      {onDeleteUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.firstName} {user.lastName}? 
                                This action cannot be undone and all user data will be permanently removed.
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