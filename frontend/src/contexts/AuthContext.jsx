// // contexts/AuthContext.js
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [admin, setAdmin] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const token = localStorage.getItem('adminToken');
//       const savedAdmin = localStorage.getItem('adminData');

//       if (token) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//         // verify token and get fresh admin from backend if possible
//         const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);

//         // prefer server-provided admin (may include populated role & permissions)
//         if (response?.data?.admin) {
//           setAdmin(response.data.admin);
//           localStorage.setItem('adminData', JSON.stringify(response.data.admin));
//           setIsAuthenticated(true);
//         } else if (savedAdmin) {
//           // fallback to saved admin from localStorage
//           try {
//             setAdmin(JSON.parse(savedAdmin));
//             setIsAuthenticated(true);
//           } catch (e) {
//             // invalid saved admin -> clear it
//             localStorage.removeItem('adminData');
//             setAdmin(null);
//             setIsAuthenticated(false);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       // Token invalid or network error -> clear auth
//       localStorage.removeItem('adminToken');
//       localStorage.removeItem('adminData');
//       delete axios.defaults.headers.common['Authorization'];
//       setAdmin(null);
//       setIsAuthenticated(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
//         email,
//         password
//       });


//       console.log(response.data);

//       const { token, admin: adminFromServer } = response.data;

//       // save token and admin
//       localStorage.setItem('adminToken', token);
//       localStorage.setItem('adminData', JSON.stringify(adminFromServer));

//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//       setAdmin(adminFromServer);
//       setIsAuthenticated(true);

//       return { success: true };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Login failed'
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`);
//     } catch (err) {
//       // ignore logout errors — still clear local state
//       console.warn('Logout request failed (ignored):', err);
//     } finally {
//       localStorage.removeItem('adminToken');
//       localStorage.removeItem('adminData');
//       delete axios.defaults.headers.common['Authorization'];
//       setAdmin(null);
//       setIsAuthenticated(false);
//     }
//   };

//   /**
//    * Robust permission checker
//    * - If admin.role is Super Admin (different casings), allow
//    * - If admin.can function exists, use it
//    * - If role object contains permissions array, check it
//    * - Otherwise deny (false)
//    */
//   const checkPermission = (resource, action) => {
//     if (!admin) return false;

//     const role = admin.role;

//     // If role is a populated object with a name property
//     const roleName = role?.name || role; // if role is string like 'super_admin' it'll be used

//     // treat common super-admin values as full access
//     if (typeof roleName === 'string') {
//       const normalized = roleName.toLowerCase();
//       if (normalized === 'super admin' || normalized === 'super_admin' || normalized === 'superadmin') {
//         return true;
//       }
//     }

//     // If admin has a helper can() function (some implementations attach this on client)
//     if (typeof admin?.can === 'function') {
//       try {
//         return Boolean(admin.can(resource, action));
//       } catch (e) {
//         console.warn('admin.can threw an error, falling back to role.permissions', e);
//       }
//     }

//     // If role is an object that contains a permissions array, use it
//     if (role && typeof role === 'object' && Array.isArray(role.permissions)) {
//       const perm = role.permissions.find((p) => String(p.resource).toLowerCase() === String(resource).toLowerCase());
//       if (!perm) return false;
//       // actions might be stored in many formats; normalize to strings and lower-case
//       const actions = (perm.actions || []).map((a) => String(a).toLowerCase());
//       return actions.includes(String(action).toLowerCase());
//     }

//     // No way to determine permissions (role may be just an ObjectId string). Deny by default.
//     return false;
//   };

//   const value = {
//     admin,
//     isAuthenticated,
//     loading,
//     login,
//     logout,
//     checkPermission
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };



// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`);
        if (response.data) {
          setAdmin(response.data);
          setIsAuthenticated(true);
          buildPermissionsMap(response.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const buildPermissionsMap = (adminData) => {
    const permMap = {};
    
    // Super Admin has all permissions
    if (adminData.role?.name === 'Super Admin') {
      // Define all possible resources and actions for super admin
      const allResources = ['users', 'posts', 'events', 'activity_logs', 'settings', 'roles'];
      const allActions = ['view', 'create', 'edit', 'delete', 'export', 'manage'];
      
      allResources.forEach(resource => {
        permMap[resource] = allActions;
      });
    } else if (adminData.role?.permissions) {
      // Regular admin with specific permissions
      adminData.role.permissions.forEach(permission => {
        permMap[permission.resource] = permission.actions;
      });
    }
    
    setPermissions(permMap);
  };

  const checkPermission = (resource, action) => {
    // Super admin has all permissions
    if (admin?.role?.name === 'Super Admin') {
      return true;
    }

    // Check if resource exists in permissions
    if (!permissions[resource]) {
      return false;
    }
    
    // Check if action is allowed for the resource
    return permissions[resource].includes(action);
  };





  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
      
      const { token, admin } = response.data;



     
      
      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin(admin);
      setIsAuthenticated(true);
      buildPermissionsMap(admin);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };




  

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
    setIsAuthenticated(false);
    setPermissions({});
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    checkPermission,
    permissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};