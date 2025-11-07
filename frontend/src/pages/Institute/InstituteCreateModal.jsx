import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Building2, Save } from "lucide-react";

const InstituteCreateModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    Hospitals: "",
    city: "",
    City: "",
    state: "",
    State: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Institute name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare data - trim all string values
      const submitData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value?.trim() || "",
        ])
      );

      await onCreate(submitData);
    } catch (error) {
      console.error("Error creating institute:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to create institute",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const inputFields = [
    {
      id: "name",
      label: "Institute Name",
      required: true,
      placeholder: "Enter institute name",
    },
    {
      id: "city",
      label: "City (Lowercase)",
      required: false,
      placeholder: "Enter city name",
    },
    {
      id: "City",
      label: "City (Capitalized)",
      required: false,
      placeholder: "Enter city name",
    },
    {
      id: "state",
      label: "State (Lowercase)",
      required: false,
      placeholder: "Enter state name",
    },
    {
      id: "State",
      label: "State (Capitalized)",
      required: false,
      placeholder: "Enter state name",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Institute
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the institute details to add it to the database
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 border-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {errors.submit && (
              <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.id}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`border-2 focus:border-blue-500 transition-colors ${
                      errors[field.id] ? "border-red-500" : ""
                    }`}
                    placeholder={field.placeholder}
                    disabled={loading}
                  />
                  {errors[field.id] && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Field Information */}
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  Field Information
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  The database supports both lowercase and capitalized field
                  names for compatibility. Fill in the fields that are relevant
                  to your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>
                    <strong>Note:</strong> Only "Institute Name" is required.
                    Other fields are optional.
                  </p>
                  <p>
                    The system will automatically use capitalized fields if
                    available, falling back to lowercase fields.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Institute"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteCreateModal;
