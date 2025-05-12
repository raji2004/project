import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Users,
  MessageSquare,
  FileText,
  Download,
  TrendingUp,
  Calendar,
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

  useEffect(() => {
    fetchAnalytics();
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

  function processDailyActivity(activity: any[]) {
    // Group activity by date and count posts/comments/downloads
    const activityMap = new Map();
    activity.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { posts: 0, comments: 0, downloads: 0 });
      }
      activityMap.get(date).posts++;
    });

    return Array.from(activityMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  function processUserActivity(activity: any[]) {
    // Group user activity by date
    const activityMap = new Map();
    activity.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { newUsers: 0, activeUsers: 0 });
      }
      activityMap.get(date).newUsers++;
    });

    return Array.from(activityMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-purple-700">
        Analytics Dashboard
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
    </div>
  );
}
