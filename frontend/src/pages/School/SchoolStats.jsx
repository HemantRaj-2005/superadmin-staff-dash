// src/pages/School/SchoolStats.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MapPin, Users, Calendar } from "lucide-react";
import api from "@/services/api";

const SchoolStats = () => {
  const [stats, setStats] = useState({
    totalSchools: 0,
    schoolsByState: [],
    schoolsByDistrict: [],
    recentSchools: [],
    usersByState: [],
    usersByDistrict: [],
    usersBySchool: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/schools/stats/overview");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching school stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const StatCard = ({ title, value, subtitle, icon, gradient, trend }) => (
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
            {trend && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0"
              >
                {trend}
              </Badge>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Schools"
          value={stats.totalSchools.toLocaleString()}
          subtitle="All registered institutions"
          icon={<Building className="h-6 w-6 text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />

        <StatCard
          title="Top State"
          value={toTitleCase(stats.schoolsByState[0]?._id) || "N/A"}
          subtitle={`${stats.schoolsByState[0]?.count || 0} schools`}
          icon={<MapPin className="h-6 w-6 text-white" />}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />

        <StatCard
          title="Top District"
          value={stats.schoolsByDistrict[0]?._id || "N/A"}
          subtitle={`${stats.schoolsByDistrict[0]?.count || 0} schools`}
          icon={<Users className="h-6 w-6 text-white" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />

        {/* <StatCard
          title="Recent Additions"
          value={stats.recentSchools.length}
          subtitle="Last 5 schools"
          icon={<Calendar className="h-6 w-6 text-white" />}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        /> */}
      </div>

      {/* Additional Stats in Tabs */}
      <Tabs defaultValue="states" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="states">Top States</TabsTrigger>
          <TabsTrigger value="districts">Top Districts</TabsTrigger>
        </TabsList>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Schools by State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.schoolsByState.slice(0, 5).map((state, index) => (
                  <div
                    key={state._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <span className="font-medium">
                        {toTitleCase(state._id)}
                      </span>
                    </div>
                    <Badge variant="secondary">{state.count} schools</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Schools by District
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.schoolsByDistrict.slice(0, 5).map((district, index) => (
                  <div
                    key={district._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <span className="font-medium truncate">
                        {district._id}
                      </span>
                    </div>
                    <Badge variant="secondary">{district.count} schools</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Stats Section */}
      <div className="space-y-4 pt-6 text-left">
        <h2 className="text-2xl font-bold tracking-tight">User Statistics</h2>
        <Tabs defaultValue="user-states" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="user-states">Top States (Users)</TabsTrigger>
            <TabsTrigger value="user-districts">
              Top Districts (Users)
            </TabsTrigger>
            <TabsTrigger value="user-schools">Top Schools (Users)</TabsTrigger>
          </TabsList>

          <TabsContent value="user-states" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Users by State (based on Address)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.usersByState?.slice(0, 5).map((state, index) => (
                    <div
                      key={state._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">
                          {toTitleCase(state._id) || "Unknown"}
                        </span>
                      </div>
                      <Badge variant="secondary">{state.count} users</Badge>
                    </div>
                  ))}
                  {(!stats.usersByState || stats.usersByState.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-districts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users by District (based on School Location)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.usersByDistrict?.slice(0, 5).map((district, index) => (
                    <div
                      key={district._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium truncate">
                          {district._id || "Unknown"}
                        </span>
                      </div>
                      <Badge variant="secondary">{district.count} users</Badge>
                    </div>
                  ))}
                  {(!stats.usersByDistrict ||
                    stats.usersByDistrict.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-schools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top Schools by User Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.usersBySchool?.slice(0, 5).map((school, index) => (
                    <div
                      key={school._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <span
                          className="font-medium truncate max-w-[200px] sm:max-w-md"
                          title={school._id}
                        >
                          {school._id || "Unknown"}
                        </span>
                      </div>
                      <Badge variant="secondary">{school.count} users</Badge>
                    </div>
                  ))}
                  {(!stats.usersBySchool ||
                    stats.usersBySchool.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolStats;
