// If you see a 'Cannot find module "recharts"' error, run: npm install recharts
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../lib/supabase";
import {
  Users,
  MessageSquare,
  FileText,
  // Download, // removed unused
  // TrendingUp, // removed unused
  // Calendar, // removed unused
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { AdminLoadingContext } from "./AdminLayout";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalResources: number;
  totalDownloads: number;
  dailyActivity: {
    date: string;
    posts: number;
    comments: number;
    downloads: number;
  }[];
  topResources: {
    id: string;
    title: string;
    downloads: number;
  }[];
  userActivity: {
    date: string;
    newUsers: number;
    activeUsers: number;
  }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setGlobalLoading } = useContext(AdminLoadingContext);

  useEffect(() => {
    setGlobalLoading(true);
    fetchAnalytics().finally(() => setGlobalLoading(false));
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    setError("");

    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch active users (users who have posted or commented in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .or(
          `created_at.gte.${thirtyDaysAgo.toISOString()},last_active.gte.${thirtyDaysAgo.toISOString()}`
        );

      // Fetch total posts and comments
      const { count: totalPosts } = await supabase
        .from("forum_posts")
        .select("*", { count: "exact", head: true });
      const { count: totalComments } = await supabase
        .from("forum_comments")
        .select("*", { count: "exact", head: true });

      // Fetch total resources and downloads
      const { count: totalResources } = await supabase
        .from("resources")
        .select("*", { count: "exact", head: true });
      const { count: totalDownloads } = await supabase
        .from("resource_downloads")
        .select("*", { count: "exact", head: true });

      // Fetch daily activity for the last 30 days
      const { data: dailyActivity } = await supabase
        .from("forum_posts")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch top resources by downloads
      const { data: topResources } = await supabase
        .from("resources")
        .select("id, title, downloads")
        .order("downloads", { ascending: false })
        .limit(5);

      // Fetch user activity
      const { data: userActivity } = await supabase
        .from("profiles")
        .select("created_at, last_active")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Process the data
      const processedData: AnalyticsData = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalResources: totalResources || 0,
        totalDownloads: totalDownloads || 0,
        dailyActivity: processDailyActivity(dailyActivity || []),
        topResources: topResources || [],
        userActivity: processUserActivity(userActivity || []),
      };

      setData(processedData);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error(err);
    }

    setLoading(false);
  }

  function processDailyActivity(
    activity: { created_at: string }[]
  ): { date: string; posts: number; comments: number; downloads: number }[] {
    // Group activity by date and count posts/comments/downloads
    const activityMap = new Map<
      string,
      { posts: number; comments: number; downloads: number }
    >();
    activity.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { posts: 0, comments: 0, downloads: 0 });
      }
      activityMap.get(date)!.posts++;
    });

    return Array.from(activityMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  function processUserActivity(
    activity: { created_at: string; last_active: string }[]
  ): { date: string; newUsers: number; activeUsers: number }[] {
    // Group user activity by date
    const activityMap = new Map<
      string,
      { newUsers: number; activeUsers: number }
    >();
    activity.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { newUsers: 0, activeUsers: 0 });
      }
      activityMap.get(date)!.newUsers++;
    });

    return Array.from(activityMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  if (loading) {
    return null;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-purple-700 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-purple-500" /> Analytics
        </h1>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.totalUsers}
                </p>
                <p className="text-sm text-purple-600">
                  {data.activeUsers} active users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Forum Activity</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.totalPosts + data.totalComments}
                </p>
                <p className="text-sm text-purple-600">
                  {data.totalPosts} posts, {data.totalComments} comments
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resources</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.totalResources}
                </p>
                <p className="text-sm text-purple-600">
                  {data.totalDownloads} total downloads
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">
              Daily Activity
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#9333ea"
                    name="Posts"
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#a855f7"
                    name="Comments"
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#c084fc"
                    name="Downloads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">
              User Growth
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#9333ea"
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#a855f7"
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Resources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">
            Top Resources
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topResources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {data.totalUsers}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-900">
                Restricted Users
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {/* Assuming you have a way to fetch restricted users */}0
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">
                Banned Users
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {/* Assuming you have a way to fetch banned users */}0
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">
                Total Restrictions
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {/* Assuming you have a way to fetch total restrictions */}0
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Total Bans</h3>
              <p className="text-3xl font-bold text-green-600">
                {/* Assuming you have a way to fetch total bans */}0
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-indigo-900">
                Total Warnings
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {/* Assuming you have a way to fetch total warnings */}0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
