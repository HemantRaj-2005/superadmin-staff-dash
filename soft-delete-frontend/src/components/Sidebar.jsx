// components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { admin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'User Management', href: '/users', icon: '👥' },
     { name: 'Event Management', href: '/events', icon: '📅' }, 
    { name: 'Post Management', href: '/posts', icon: '📝' },
    ...(admin?.role === 'super_admin' 
      ? [{ name: 'Activity Logs', href: '/activity-logs', icon: '📊' }]
      : []
    ),
  ];

  return (
    <div className="bg-gray-800 w-64 flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white text-xl font-bold">Alumns</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 bg-gray-800">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          
        </nav>

        
      </div>
    </div>
  );
};

export default Sidebar;