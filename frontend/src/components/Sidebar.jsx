// // components/Sidebar.js
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const Sidebar = () => {
//   const location = useLocation();
//   const { admin } = useAuth();

//   const navigation = [
//     { name: 'Dashboard', href: '/', icon: '🏠' },
//     { name: 'User Management', href: '/users', icon: '👥' },
//      { name: 'Event Management', href: '/events', icon: '📅' }, 
//     { name: 'Post Management', href: '/posts', icon: '📝' },
//     ...(admin?.role === 'super_admin' 
//       ? [{ name: 'Activity Logs', href: '/activity-logs', icon: '📊' }]
//       : []
//     ),
//   ];

//   return (
//     <div className="bg-gray-800 w-64 flex-shrink-0">
//       <div className="flex flex-col h-full">
//         <div className="flex items-center justify-center h-16 bg-gray-900">
//           <span className="text-white text-xl font-bold">Alumns</span>
//         </div>
        
//         <nav className="flex-1 px-4 py-4 bg-gray-800">
//           <ul className="space-y-2">
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <li key={item.name}>
//                   <Link
//                     to={item.href}
//                     className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
//                       isActive
//                         ? 'bg-gray-900 text-white'
//                         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//                     }`}
//                   >
//                     <span className="mr-3 text-lg">{item.icon}</span>
//                     {item.name}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>

          
//         </nav>

        
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { admin, checkPermission } = useAuth();

  // Support both role formats
  const isSuperAdmin = Boolean(admin) && 
    (admin?.role?.name === 'Super Admin' || admin?.role === 'super_admin');

  // Safe permission check using the checkPermission function from AuthContext
  const can = (resource, action) => {
    if (isSuperAdmin) return true;
    return checkPermission ? checkPermission(resource, action) : false;
  };

  // Base navigation with permission metadata
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: '🏠', 
      permission: null 
    },
    { 
      name: 'User Management', 
      href: '/users', 
      icon: '👥', 
      permission: { resource: 'users', action: 'view' } 
    },
    { 
      name: 'Post Management', 
      href: '/posts', 
      icon: '📝', 
      permission: { resource: 'posts', action: 'view' } 
    },
    { 
      name: 'Event Management', 
      href: '/events', 
      icon: '📅', 
      permission: { resource: 'events', action: 'view' } 
    },
  ];

  // Admin-only sections for super admin
  if (isSuperAdmin) {
    navigation.push(
      { 
        name: 'Admin Management', 
        href: '/admins', 
        icon: '👨‍💼', 
        permission: null,
        superAdminOnly: true 
      },
      { 
        name: 'Role Management', 
        href: '/roles', 
        icon: '🔐', 
        permission: null,
        superAdminOnly: true 
      }
    );
  }

  // Activity Logs - available to super admins and anyone with view permission
  if (isSuperAdmin || can('activity_logs', 'view')) {
    navigation.push({ 
      name: 'Activity Logs', 
      href: '/activity-logs', 
      icon: '📊', 
      permission: null 
    });
  }

  // Filter out items the current admin doesn't have permission to view
  const visibleNavigation = navigation.filter((item) => {
    if (!item.permission) return true; // No permission required
    
    const { resource, action } = item.permission;
    return can(resource, action);
  });

  // Debug info for development
  const getRoleName = () => {
    if (admin?.role?.name) return admin.role.name;
    if (admin?.role === 'super_admin') return 'Super Admin';
    if (admin?.role === 'admin') return 'Admin';
    return admin?.role || 'Unknown';
  };

  return (
    <div className="bg-gray-800 w-64 flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white text-xl font-bold">Alumns</span>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-3 py-1 bg-yellow-900 text-yellow-100 text-xs text-center">
            Role: {getRoleName()}
          </div>
        )}

        <nav className="flex-1 px-4 py-4 bg-gray-800">
          <ul className="space-y-2">
            {visibleNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition duration-150 ${
                      isActive 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                    {item.superAdminOnly && (
                      <span className="ml-2 text-xs bg-purple-500 text-white px-1 rounded">
                        SA
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin Info Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-sm text-white">
            <div className="font-medium truncate">{admin?.name}</div>
            <div className="text-gray-400 text-xs mt-1 truncate">
              {getRoleName()}
            </div>
            <div className="text-gray-500 text-xs mt-1 truncate">
              {admin?.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;