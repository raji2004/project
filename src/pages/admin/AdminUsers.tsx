import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Shield,
  ShieldOff,
  UserX,
  Search,
  Activity,
  Mail,
  Trash2,
} from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_active: string;
  post_count: number;
  comment_count: number;
  resource_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      // Fetch users with their activity counts
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) throw usersError;

      // Fetch activity counts
      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("author_id");
      const { data: commentsData } = await supabase
        .from("forum_comments")
        .select("author_id");
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("author_id");

      // Process activity counts
      const postCounts = new Map<string, number>();
      const commentCounts = new Map<string, number>();
      const resourceCounts = new Map<string, number>();

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
      resourcesData?.forEach((resource) => {
        resourceCounts.set(
          resource.author_id,
          (resourceCounts.get(resource.author_id) || 0) + 1
        );
      });

      // Combine user data with activity counts
      const processedUsers = usersData?.map((user) => ({
        ...user,
        post_count: postCounts.get(user.id) || 0,
        comment_count: commentCounts.get(user.id) || 0,
        resource_count: resourceCounts.get(user.id) || 0,
      }));

      setUsers(processedUsers || []);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    }
    setLoading(false);
  }

  async function updateUserRole(userId: string, role: "admin" | "user") {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user role");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function toggleUserStatus(userId: string, isActive: boolean) {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user status");
      console.error(err);
    }
    setActionLoading(null);
  }

  async function deleteUser(userId: string) {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
    setActionLoading(null);
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">User Management</h1>

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
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user.id)
                      );
                    }
                  }}
                  className="mt-1 accent-purple-500"
                />
                <div>
                  <h3 className="font-semibold text-purple-900">
                    {user.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {user.post_count} posts, {user.comment_count} comments,{" "}
                      {user.resource_count} resources
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
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  title={user.role === "admin" ? "Remove Admin" : "Make Admin"}
                >
                  {user.role === "admin" ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <ShieldOff className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                  disabled={actionLoading === user.id}
                  className={`p-2 rounded-full transition-colors ${
                    user.is_active
                      ? "text-red-600 hover:bg-red-50"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                  title={user.is_active ? "Deactivate" : "Activate"}
                >
                  <UserX className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  disabled={actionLoading === user.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete User"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
