// components/RoleManagement/PermissionRoutes.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shield, ShieldAlert, LogIn } from 'lucide-react';

const PermissionRoute = ({ children, resource, action }) => {
  const { isAuthenticated, checkPermission, admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <CardDescription className="text-lg">
              Loading permissions...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <LogIn className="h-12 w-12 text-muted-foreground" />
                <Loader2 className="h-6 w-6 animate-spin text-primary absolute -top-1 -right-1" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Redirecting to Login</CardTitle>
            <CardDescription className="text-base">
              Please wait while we redirect you to the login page.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Super Admin has all permissions
  if (admin?.role?.name === 'Super Admin') {
    return children;
  }

  // Check specific permission for non-super admins
  if (resource && action && !checkPermission(resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full">
                <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Access Denied
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <Shield className="h-4 w-4" />
              <AlertTitle className="text-red-800 dark:text-red-300">
                Insufficient Permissions
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                Your current role does not grant you access to this resource.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Required Permission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Resource:</span>
                      <Badge variant="outline" className="font-mono">
                        {resource}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Action:</span>
                      <Badge variant="outline" className="font-mono">
                        {action}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Your Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant="secondary">
                        {admin?.role?.name || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Restricted
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1 sm:flex-none"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 sm:flex-none"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default PermissionRoute;