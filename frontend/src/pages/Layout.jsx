// components/Layout.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar'; // Already imported

// We can remove Dropdown, Button, Avatar, Separator, and lucide-react icons
// as they are no longer used in this file.

const Layout = ({ children }) => {
  const { admin, logout } = useAuth(); // We still need these to pass as props

  // getInitials is no longer needed here
  // const getInitials = (name) => { ... };

  return (
    <div className="min-h-screen bg-background">
      {/* Pass the admin and logout props to the Navbar */}
      <Navbar admin={admin} logout={logout} />

      <div className="flex pt-16 h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* The header is now much cleaner, as the user profile
            is handled by the main Navbar.
          */}
         

          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;