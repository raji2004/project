import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../lib/supabase";
import {
  Shield,
  ShieldOff,
  Search,
  Activity,
  Mail,
  BarChart2,
  AlertTriangle,
  Lock,
  Unlock,
  User as UserIcon,
} from "lucide-react";
import { getAvatarUrl } from "../../utils/avatar";
import { AdminLoadingContext } from "./AdminLayout";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_active: string | null;
  post_count: number;
  comment_count: number;
  is_restricted: boolean;
  is_visible: boolean;
  warning_count: number;
  avatar_url?: string;
}

interface UserAnalytics {
  totalPosts: number;
  totalComments: number;
  lastActivity: string | null;
  averagePostsPerDay: number;
  averageCommentsPerDay: number;
  warningHistory: Array<{
    reason: string;
    date: string;
  }>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUserAnalytics, setSelectedUserAnalytics] =
    useState<UserAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeAction, setActiveAction] = useState<{
    userId: string;
    type: "restrict" | "hide" | "warning" | null;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const { setGlobalLoading } = useContext(AdminLoadingContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    function handleOpenUserAnalytics(e: Event) {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.userId) {
        showUserAnalytics(customEvent.detail.userId);
        setShowAnalytics(true);
      }
    }
    window.addEventListener("openUserAnalytics", handleOpenUserAnalytics);
    return () => {
      window.removeEventListener("openUserAnalytics", handleOpenUserAnalytics);
    };
  }, []);

  async function fetchUsers() {
    setGlobalLoading(true);
    setError("");
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*");
      console.log("[DEBUG] usersData", usersData, usersError);
      if (usersError) throw usersError;

      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("author_id, created_at");
      console.log("[DEBUG] postsData", postsData);
      const { data: commentsData } = await supabase
        .from("forum_comments")
        .select("author_id, created_at");
      console.log("[DEBUG] commentsData", commentsData);
      const { data: warningsData } = await supabase
        .from("user_warnings")
        .select("*");
      console.log("[DEBUG] warningsData", warningsData);

      const postCounts = new Map<string, number>();
      const commentCounts = new Map<string, number>();
      const warningCounts = new Map<string, number>();
      const warningHistory = new Map<
        string,
        Array<{ reason: string; date: string }>
      >();

      postsData?.forEach((post) => {
        postCounts.set(
          post.author_id,
          (postCounts.get(post.author_id) || 0) + 1
        );
      });

      commentsData?.forEach((comment) => {
        commentCounts.set(
          comment.author_id,
          (commentCounts.get(comment.author_id) || 0) + 1
        );
      });

      warningsData?.forEach((warning) => {
        warningCounts.set(
          warning.user_id,
          (warningCounts.get(warning.user_id) || 0) + 1
        );
        if (!warningHistory.has(warning.user_id)) {
          warningHistory.set(warning.user_id, []);
        }
        warningHistory.get(warning.user_id)?.push({
          reason: warning.reason,
          date: warning.created_at,
        });
      });

      const processedUsers = usersData?.map((user) => ({
        ...user,
        post_count: postCounts.get(user.id) || 0,
        comment_count: commentCounts.get(user.id) || 0,
        warning_count: warningCounts.get(user.id) || 0,
        is_restricted: user.is_restricted || false,
        is_visible: user.is_visible !== false,
        avatar_url: user.avatar_url || null,
      }));
      console.log("[DEBUG] processedUsers", processedUsers);
      setUsers(processedUsers || []);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    }
    setGlobalLoading(false);
    setLoading(false);
  }

  async function createNotification(userId: string, message: string) {
    console.log("[DEBUG] Creating notification for", userId, message);
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      message,
    });
    if (error) {
      console.error("[DEBUG] Notification error:", error);
    } else {
      console.log("[DEBUG] Notification created successfully");
    }
  }

  async function updateUserRole(userId: string, role: "admin" | "user") {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
      await createNotification(
        userId,
        `Your account role was changed to ${role}.`
      );
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user role");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function showUserAnalytics(userId: string) {
    setSelectedUserId(userId);
    try {
      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("created_at")
        .eq("author_id", userId);
      const { data: commentsData } = await supabase
        .from("forum_comments")
        .select("created_at")
        .eq("author_id", userId);
      const { data: warningsData } = await supabase
        .from("user_warnings")
        .select("reason, created_at")
        .eq("user_id", userId);

      const analytics: UserAnalytics = {
        totalPosts: postsData?.length || 0,
        totalComments: commentsData?.length || 0,
        lastActivity:
          postsData?.[0]?.created_at || commentsData?.[0]?.created_at || null,
        averagePostsPerDay: calculateAveragePerDay(postsData || []),
        averageCommentsPerDay: calculateAveragePerDay(commentsData || []),
        warningHistory:
          warningsData?.map((w) => ({
            reason: w.reason,
            date: w.created_at,
          })) || [],
      };

      setSelectedUserAnalytics(analytics);
      setShowAnalytics(true);
    } catch (err) {
      setError("Failed to fetch user analytics");
      console.error(err);
    }
  }

  function calculateAveragePerDay(activities: Array<{ created_at: string }>) {
    if (!activities.length) return 0;
    const dates = activities.map((a) => new Date(a.created_at));
    const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const newest = new Date(Math.max(...dates.map((d) => d.getTime())));
    const days = Math.max(
      1,
      Math.ceil((newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24))
    );
    return activities.length / days;
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    const fullName = user.full_name?.toLowerCase() || "";
    const email = user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  if (loading) {
    return <div className="text-center text-purple-600">Loading users...</div>;
  }

  return (
    <div className="max-w-5xl w-full space-y-6">
      <h1 className="text-lg font-bold text-purple-700">User Management</h1>

      {/* Search */}
      <div className="relative max-w-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-md border border-purple-200 px-4 py-2 pl-10 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        />
        <Search className="absolute left-2 top-2.5 text-purple-400 h-5 w-5" />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm border border-purple-100 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {user.avatar_url ? (
                  <img
                    src={getAvatarUrl(user.avatar_url)}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover border-2 border-purple-200"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "";
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                    <UserIcon className="h-6 w-6 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-purple-900">
                    {user.full_name || "Unnamed User"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {user.post_count} posts, {user.comment_count} comments
                    </span>
                    <span>•</span>
                    <span>
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    {user.last_active && (
                      <>
                        <span>•</span>
                        <span>
                          Last active{" "}
                          {new Date(user.last_active).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {user.warning_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">
                          {user.warning_count} warnings
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showUserAnalytics(user.id)}
                  className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                  title="View analytics"
                >
                  <BarChart2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    updateUserRole(
                      user.id,
                      user.role === "admin" ? "user" : "admin"
                    )
                  }
                  disabled={actionLoading === user.id}
                  className={`p-2 rounded-full transition-colors ${
                    user.role === "admin"
                      ? "text-purple-600 hover:bg-purple-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  title={user.role === "admin" ? "Remove admin" : "Make admin"}
                >
                  {user.role === "admin" ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <ShieldOff className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveAction({ userId: user.id, type: "restrict" })
                  }
                  className={`p-2 rounded-full transition-colors ${
                    user.is_restricted
                      ? "text-red-600 hover:bg-red-50"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                  title={
                    user.is_restricted ? "Remove restrictions" : "Restrict user"
                  }
                >
                  {user.is_restricted ? (
                    <Unlock className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveAction({ userId: user.id, type: "warning" })
                  }
                  className="p-2 rounded-full text-yellow-600 hover:bg-yellow-50 transition-colors"
                  title="Add warning"
                >
                  <AlertTriangle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Warning Input */}
            {activeAction && activeAction.userId === user.id && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    activeAction.type === "restrict"
                      ? "Reason for restriction..."
                      : "Enter warning reason..."
                  }
                  className="w-full rounded-md border border-yellow-200 px-4 py-2 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction(null);
                      setActionReason("");
                    }}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!actionReason.trim()) {
                        setError("Please provide a reason");
                        return;
                      }
                      setActionLoading(user.id);
                      if (activeAction.type === "restrict") {
                        console.log(
                          "[DEBUG] About to create notification for restrict",
                          user.id,
                          actionReason
                        );
                        await supabase
                          .from("profiles")
                          .update({ is_restricted: !user.is_restricted })
                          .eq("id", user.id);
                        await createNotification(
                          user.id,
                          `Your account has been ${
                            !user.is_restricted
                              ? "restricted"
                              : "restriction removed"
                          }: ${actionReason}`
                        );
                        console.log(
                          "[DEBUG] Finished createNotification for restrict"
                        );
                      } else if (activeAction.type === "warning") {
                        console.log(
                          "[DEBUG] About to create notification for warning",
                          user.id,
                          actionReason
                        );
                        await supabase.from("user_warnings").insert({
                          user_id: user.id,
                          reason: actionReason,
                          created_at: new Date().toISOString(),
                        });
                        await createNotification(
                          user.id,
                          `You have received a warning: ${actionReason}`
                        );
                        console.log(
                          "[DEBUG] Finished createNotification for warning"
                        );
                      }
                      setActionReason("");
                      setActiveAction(null);
                      setActionLoading(null);
                      await fetchUsers();
                    }}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && selectedUserAnalytics && selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-purple-700">
                User Analytics
              </h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-700 mb-2">
                  Activity Overview
                </h3>
                <div className="space-y-2">
                  <p>Total Posts: {selectedUserAnalytics.totalPosts}</p>
                  <p>Total Comments: {selectedUserAnalytics.totalComments}</p>
                  <p>
                    Average Posts/Day:{" "}
                    {selectedUserAnalytics.averagePostsPerDay.toFixed(1)}
                  </p>
                  <p>
                    Average Comments/Day:{" "}
                    {selectedUserAnalytics.averageCommentsPerDay.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-700 mb-2">
                  Last Activity
                </h3>
                <p>
                  {selectedUserAnalytics.lastActivity
                    ? new Date(
                        selectedUserAnalytics.lastActivity
                      ).toLocaleString()
                    : "No recent activity"}
                </p>
              </div>
            </div>
            {selectedUserAnalytics.warningHistory.length > 0 && (
              <div className="mt-4 bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-700 mb-2">
                  Warning History
                </h3>
                <div className="space-y-2">
                  {selectedUserAnalytics.warningHistory.map(
                    (warning, index) => (
                      <div key={index} className="border-b border-red-200 pb-2">
                        <p className="text-red-800">{warning.reason}</p>
                        <p className="text-sm text-red-600">
                          {new Date(warning.date).toLocaleString()}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
