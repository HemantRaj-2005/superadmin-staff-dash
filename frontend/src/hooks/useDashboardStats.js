import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [usersRes, postsRes, eventsRes] = await Promise.allSettled([
        api.get("/users?limit=1000&page=1"),
        api.get("/posts?limit=1000"),
        api.get("/events?limit=1000"),
      ]);

      const users = usersRes.status === "fulfilled" ? usersRes.value.data : { users: [], total: 0 };
      const posts = postsRes.status === "fulfilled" ? postsRes.value.data : { posts: [], total: 0 };
      const events = eventsRes.status === "fulfilled" ? eventsRes.value.data : { events: [], total: 0 };

      const allUsers = users.users || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = allUsers.filter(
        (user) => new Date(user.createdAt) >= today
      ).length;

      const verifiedUsers = allUsers.filter(
        (user) => user.isEmailVerified || user.isPhoneVerified
      ).length;

      const googleUsers = allUsers.filter((user) => user.isGoogleUser).length;

      return {
        totalUsers: users.total || 0,
        totalPosts: posts.total || 0,
        totalEvents: events.total || 0,
        newUsersToday,
        verifiedUsers,
        googleUsers,
        recentUsers: allUsers.slice(0, 5),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

