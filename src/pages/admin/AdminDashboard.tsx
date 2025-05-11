import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { supabase } from "../../lib/supabase";

const navItems = [
  { name: "Dashboard", icon: <LayoutDashboard />, path: "/admin" },
  { name: "User Management", icon: <Users />, path: "/admin/users" },
  {
    name: "Resource Management",
    icon: <FileText />,
    path: "/admin/upload-resources",
  },
  { name: "Forum Moderation", icon: <MessageSquare />, path: "/admin/forum" },
];

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalResources: number;
  totalDownloads: number;
  recentActivity: Array<{
    type: "post" | "comment" | "resource";
    id: string;
    title: string;
    author: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_active", thirtyDaysAgo.toISOString());

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

      // Fetch recent activity
      const { data: recentPosts } = await supabase
        .from("forum_posts")
        .select("id, title, created_at, author:profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentComments } = await supabase
        .from("forum_comments")
        .select("id, content, created_at, author:profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentResources } = await supabase
        .from("resources")
        .select("id, title, created_at, author:profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Normalize author fields
      const normPosts = (recentPosts || []).map((post) => ({
        ...post,
        author: Array.isArray(post.author)
          ? post.author[0] || { full_name: "Unknown" }
          : post.author || { full_name: "Unknown" },
      }));
      const normComments = (recentComments || []).map((comment) => ({
        ...comment,
        author: Array.isArray(comment.author)
          ? comment.author[0] || { full_name: "Unknown" }
          : comment.author || { full_name: "Unknown" },
      }));
      const normResources = (recentResources || []).map((resource) => ({
        ...resource,
        author: Array.isArray(resource.author)
          ? resource.author[0] || { full_name: "Unknown" }
          : resource.author || { full_name: "Unknown" },
      }));

      // Process recent activity
      const recentActivity = [
        ...(normPosts.map((post) => ({
          type: "post" as const,
          id: post.id,
          title: post.title,
          author: post.author.full_name,
          created_at: post.created_at,
        })) || []),
        ...(normComments.map((comment) => ({
          type: "comment" as const,
          id: comment.id,
          title: comment.content,
          author: comment.author.full_name,
          created_at: comment.created_at,
        })) || []),
        ...(normResources.map((resource) => ({
          type: "resource" as const,
          id: resource.id,
          title: resource.title,
          author: resource.author.full_name,
          created_at: resource.created_at,
        })) || []),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalResources: totalResources || 0,
        totalDownloads: totalDownloads || 0,
        recentActivity,
      });
    } catch (err) {
      setError("Failed to fetch dashboard stats");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
          Admin
        </h2>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors text-purple-800 hover:bg-purple-100 hover:text-purple-900 ${
                location.pathname === item.path
                  ? "bg-purple-100 text-purple-900 font-bold"
                  : ""
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-purple-700">Dashboard</h1>

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
                    {stats.totalUsers}
                  </p>
                  <p className="text-sm text-purple-600">
                    {stats.activeUsers} active users
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
                    {stats.totalPosts + stats.totalComments}
                  </p>
                  <p className="text-sm text-purple-600">
                    {stats.totalPosts} posts, {stats.totalComments} comments
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
                    {stats.totalResources}
                  </p>
                  <p className="text-sm text-purple-600">
                    {stats.totalDownloads} total downloads
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg"
                >
                  <div className="p-2 bg-white rounded-full">
                    {activity.type === "post" ? (
                      <MessageSquare className="h-5 w-5 text-purple-700" />
                    ) : activity.type === "comment" ? (
                      <MessageSquare className="h-5 w-5 text-purple-700" />
                    ) : (
                      <FileText className="h-5 w-5 text-purple-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-purple-900">
                      {activity.type === "post"
                        ? "New Post"
                        : activity.type === "comment"
                        ? "New Comment"
                        : "New Resource"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By {activity.author}</span>
                      <span>•</span>
                      <span>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
