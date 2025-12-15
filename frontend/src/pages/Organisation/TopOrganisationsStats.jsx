import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "../../services/api";
import { Skeleton } from "@/components/ui/skeleton";

const TopOrganisationsStats = () => {
  const [topOrgs, setTopOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopOrgs = async () => {
      try {
        const response = await api.get("/organisations/stats/user-counts");
        setTopOrgs(response.data);
      } catch (error) {
        console.error("Error fetching top organisations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopOrgs();
  }, []);

  if (loading) {
    return (
      <Card className="h-full shadow-lg border-0 bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-indigo-900 dark:text-indigo-100">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Top Organisations
        </CardTitle>
        <CardDescription className="text-indigo-600/80 dark:text-indigo-300/80">
          By student & alumni count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topOrgs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          ) : (
            topOrgs.map((org, index) => (
              <div
                key={org._id}
                className="group flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md border border-indigo-100 dark:border-indigo-900"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                    ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400"
                        : index === 1
                        ? "bg-gray-100 text-gray-700 ring-2 ring-gray-400"
                        : index === 2
                        ? "bg-orange-100 text-orange-700 ring-2 ring-orange-400"
                        : "bg-indigo-100 text-indigo-700"
                    }
                  `}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {org.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="truncate max-w-[150px]">
                        {org.industry}
                      </span>
                      {org.country && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{org.country}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {org.userCount}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopOrganisationsStats;
