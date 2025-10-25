// components/PermissionMatrix.js
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, X, Info, Maximize2, Minimize2 } from "lucide-react";

const PermissionMatrix = ({ role, permissionStructure, onClose }) => {
  if (!permissionStructure || !role) {
    return null;
  }

  const [search, setSearch] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const actions = permissionStructure.resources[0]?.actions || [];

  const filteredResources = permissionStructure.resources.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const getActionStatus = (resourceId, actionId) => {
    const resourcePermission = role.permissions.find(
      (p) => p.resource === resourceId
    );
    return resourcePermission && resourcePermission.actions.includes(actionId);
  };

  const getResourcePermissionSummary = (resourceId) => {
    const resourcePermission = role.permissions.find(
      (p) => p.resource === resourceId
    );
    if (!resourcePermission) return "No access";

    const actionCount = resourcePermission.actions.length;
    const totalActions =
      permissionStructure.resources.find((r) => r.id === resourceId)?.actions
        .length || 0;

    if (actionCount === totalActions) return "Full access";
    if (actionCount === 1 && resourcePermission.actions[0] === "view")
      return "View only";

    return `${actionCount} of ${totalActions} actions`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Full access":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "View only":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "No access":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  // Enhanced overall statistics
  const totalResources = permissionStructure.resources.length;
  const accessedResources = role.permissions.length;
  const totalPossibleActions = permissionStructure.resources.reduce(
    (sum, r) => sum + (r.actions?.length || 0),
    0
  );
  const totalAssignedActions = role.permissions.reduce(
    (sum, p) => sum + p.actions.length,
    0
  );
  const overallPercentage =
    totalPossibleActions > 0
      ? Math.round((totalAssignedActions / totalPossibleActions) * 100)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col transition-all duration-300 ${
          isFullScreen
            ? "w-[95vw] h-[95vh] sm:w-[98vw] sm:h-[98vh]" // Near full-screen
            : "w-[90vw] h-[90vh] sm:w-[85vw] sm:h-[85vh]" // Default size
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Permission Matrix - {role.name}
            </h2>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Detailed view of all permissions assigned to this role. Use the
              search to filter resources.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(!isFullScreen)}
              aria-label={
                isFullScreen ? "Minimize overlay" : "Maximize overlay"
              }
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {isFullScreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close overlay"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-800/50">
          <Input
            placeholder="Search resources by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100/50 hover:bg-gray-100/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/50">
                  <TableHead className="w-1/4 text-gray-900 dark:text-white font-semibold">
                    Resource
                  </TableHead>
                  {actions.map((action) => (
                    <TooltipProvider key={action.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableHead className="text-center text-xs text-gray-900 dark:text-white font-semibold">
                            {action.name}
                          </TableHead>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
                          <p>
                            Allows users to {action.name.toLowerCase()} the
                            resource.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow
                    key={resource.id}
                    className="hover:bg-muted/50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
                  >
                    <TableCell className="text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">
                            {resource.name}
                          </h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
                                <p>{resource.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            getResourcePermissionSummary(resource.id)
                          )} text-xs font-medium`}
                        >
                          {getResourcePermissionSummary(resource.id)}
                        </Badge>
                      </div>
                    </TableCell>
                    {resource.actions.map((action) => (
                      <TooltipProvider key={action.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-2">
                                {getActionStatus(resource.id, action.id) ? (
                                  <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                                )}
                                <Badge
                                  variant="outline"
                                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                  {action.id}
                                </Badge>
                              </div>
                            </TableCell>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
                            <p>
                              {getActionStatus(resource.id, action.id)
                                ? "Granted"
                                : "Denied"}{" "}
                              permission to {action.name.toLowerCase()}.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <Card className="mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">
                Permission Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    Allowed Action
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    Not Allowed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-100 dark:bg-green-900/30" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    Full Access (All Actions)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-100 dark:bg-blue-900/30" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    View Only (Read Access)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    Partial Access (Some Actions)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-100 dark:bg-gray-800" />
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    No Access (Denied)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accessedResources}
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Accessed Resources
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalAssignedActions}
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Assigned Actions
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalResources}
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Total Resources
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallPercentage}%
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Overall Access Level
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <Badge
                  variant={role.isActive ? "default" : "secondary"}
                  className="text-base px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  {role.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                  Role Status
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <Button
            onClick={onClose}
            className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;
