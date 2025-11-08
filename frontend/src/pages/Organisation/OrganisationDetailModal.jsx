import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Edit,
  Save,
  Globe,
  Type,
  Clock,
  Trash2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";

const OrganisationDetailModal = ({
  organisation,
  onClose,
  onUpdate,
  onDelete,
  getCountryFlag,
  formatEstablishmentYear,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: organisation.name,
    industry: organisation.industry,
    type: organisation.type,
    establishmentYear: organisation.establishmentYear,
    location: {
      country: organisation.location.country,
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(organisation.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: organisation.name,
      industry: organisation.industry,
      type: organisation.type,
      establishmentYear: organisation.establishmentYear,
      location: {
        country: organisation.location.country,
      },
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-2xl font-bold border-2"
                  />
                ) : (
                  organisation.name
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {isEditing ? (
                    <Input
                      value={editData.location.country}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          location: { country: e.target.value },
                        }))
                      }
                      className="border-2"
                    />
                  ) : (
                    <>
                      {organisation.location.country}{" "}
                      {getCountryFlag(organisation.location.country)}
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 border-2"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 border-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Industry
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.industry}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              industry: e.target.value,
                            }))
                          }
                          className="mt-1 border-2"
                        />
                      ) : (
                        <Badge
                          variant="outline"
                          className="mt-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 text-base"
                        >
                          {organisation.industry}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.type}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="mt-1 border-2"
                        />
                      ) : (
                        <p className="text-lg font-medium dark:text-white mt-1">
                          {organisation.type}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Establishment Year
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.establishmentYear || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              establishmentYear: e.target.value,
                            }))
                          }
                          className="mt-1 border-2"
                          placeholder="Enter year"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-lg font-medium dark:text-white">
                            {formatEstablishmentYear(
                              organisation.establishmentYear
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Organisation ID
                      </label>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                        {organisation.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <span className="text-4xl">
                    {getCountryFlag(organisation.location.country)}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Country
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {organisation.location.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </label>
                    <p className="text-sm dark:text-white">
                      {formatDate(organisation.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </label>
                    <p className="text-sm dark:text-white">
                      {formatDate(organisation.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Separator />
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 border-2">
              <CardHeader>
                <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-400">
                  Once you delete this organisation, there is no going back.
                  Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="dark:bg-red-600 dark:hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Organisation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-400">
                        This action cannot be undone. This will permanently
                        delete the organisation "{organisation.name}" and remove
                        all associated data from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDelete(organisation.id);
                          onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Delete Organisation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDetailModal;
