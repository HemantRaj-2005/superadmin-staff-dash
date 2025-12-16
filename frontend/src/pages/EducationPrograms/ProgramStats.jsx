import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import api from "@/services/api";

const ProgramStats = () => {
  const [stats, setStats] = useState({
    topDegrees: [],
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/educational-programs/stats/overview");
        setStats({
          topDegrees: response.data.topDegrees || [],
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching program degrees stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading && stats.topDegrees.length === 0) {
    return null; // Or skeleton if preferred, but null prevents layout shift if loaded quickly or fail
  }

  if (stats.topDegrees.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          Top 5 Degrees Pursued
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.topDegrees.map((degree, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 flex items-center justify-center p-0 rounded-full border-indigo-200 text-indigo-700 bg-indigo-50"
                  >
                    {index + 1}
                  </Badge>
                  <div className="flex flex-col">
                    <span
                      className="font-medium text-sm truncate max-w-[220px]"
                      title={`${degree.qualification} in ${degree.specialization}`}
                    >
                      {degree.qualification || "Unknown"}
                      {degree.specialization && (
                        <span className="text-muted-foreground ml-1">
                          in {degree.specialization}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                >
                  {degree.count} users
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramStats;
