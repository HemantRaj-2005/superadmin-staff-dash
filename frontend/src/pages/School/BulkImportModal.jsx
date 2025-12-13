// components/BulkImportModal.js
import React, { useState } from "react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

const BulkImportModal = ({ onImport, onClose }) => {
  const [csvData, setCsvData] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csvData.trim()) {
      showAlert("Please paste CSV data", "error");
      return;
    }

    setLoading(true);

    try {
      const schools = parseCSV(csvData);

      if (schools.length === 0) {
        showAlert("No valid school data found in CSV", "error");
        return;
      }

      if (schools.length > 1000) {
        showAlert("Maximum 1000 schools allowed per import", "error");
        return;
      }

      await onImport(schools);
      showAlert(
        `Successfully processed ${schools.length} schools for import`,
        "success"
      );

      // Clear form on success
      setCsvData("");
    } catch (error) {
      showAlert("Error parsing CSV data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split("\n");

    if (lines.length < 2) {
      throw new Error("CSV must have at least one header row and one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const requiredHeaders = ["school_name", "district", "state", "udise_code"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const schools = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted fields with commas
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""));

      if (values.length >= 4) {
        const school = {
          school_name: values[0],
          district: values[1],
          state: values[2],
          udise_code: values[3],
        };

        // Validate UDISE code
        if (
          !school.udise_code ||
          isNaN(school.udise_code) ||
          school.udise_code.length !== 11
        ) {
          errors.push(`Row ${i + 1}: UDISE code must be 11 digits`);
          continue;
        }

        // Validate required fields
        if (!school.school_name || !school.district || !school.state) {
          errors.push(`Row ${i + 1}: All fields are required`);
          continue;
        }

        schools.push({
          ...school,
          udise_code: Number(school.udise_code),
        });
      } else {
        errors.push(`Row ${i + 1}: Invalid number of columns`);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `CSV validation errors:\n${errors.slice(0, 5).join("\n")}${
          errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ""
        }`
      );
    }

    return schools;
  };

  const downloadTemplate = () => {
    const template = `school_name,district,state,udise_code
"Delhi Public School","North West Delhi","Delhi",11000123456
"Kendriya Vidyalaya","South Delhi","Delhi",11000765432
"St. Mary's Convent","Mumbai City","Maharashtra",27000123456
"Government Higher Secondary School","Bangalore Urban","Karnataka",29000123456
"Jawahar Navodaya Vidyalaya","Pune","Maharashtra",27000765432`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "schools-import-template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl">
        <div className="bg-background rounded-xl shadow-lg border animate-in slide-in-from-bottom-0 duration-300 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Bulk Import Schools</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Alert Display */}
            {alert.show && (
              <Alert variant={alert.type === "error" ? "destructive" : "default"}>
                {alert.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            {/* Instructions Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Import Instructions
                </CardTitle>
                <CardDescription>
                  Follow these guidelines for successful bulk import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">
                        1
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">Required Columns</p>
                        <p className="text-sm text-muted-foreground">
                          school_name, district, state, udise_code
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">
                        2
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">UDISE Code</p>
                        <p className="text-sm text-muted-foreground">
                          Must be unique 11-digit number
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">
                        3
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">File Format</p>
                        <p className="text-sm text-muted-foreground">
                          CSV with header row, UTF-8 encoding
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-1">
                        4
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">Limits</p>
                        <p className="text-sm text-muted-foreground">
                          Max 1000 schools per import
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Download the template to get started
                  </div>
                  <Button
                    type="button"
                    onClick={downloadTemplate}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CSV Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV Data
                </CardTitle>
                <CardDescription>
                  Paste your CSV data below. First row should be headers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
//                       placeholder={`school_name,district,state,udise_code
// "Delhi Public School","North West Delhi","Delhi",11000123456
// "Kendriya Vidyalaya","South Delhi","Delhi",11000765432
// "St. Mary's Convent","Mumbai City","Maharashtra",27000123456`}
                      className="min-h-[300px] font-mono text-sm resize-none overflow-y-auto"
                      disabled={loading}
                      style={{ 
                        height: '300px',
                        overflowY: 'auto'
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      {csvData && (
                        <span>
                          {csvData.split("\n").length - 1} schools detected
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      Supports CSV format with quotes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !csvData.trim()}
                className="min-w-24"
              >
                {loading ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Schools
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;