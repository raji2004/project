import { create } from "zustand";
import { supabase } from "../../../lib/supabase";
import { User, UserAnalytics } from "../types/userTypes";

interface UsersAdminStore {
  users: User[];
  loading: boolean;
  error: string;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: "admin" | "user") => Promise<void>;
  addWarning: (userId: string, reason: string) => Promise<void>;
  restrictUser: (
    userId: string,
    restrict: boolean,
    reason: string
  ) => Promise<void>;
  fetchUserAnalytics: (userId: string) => Promise<UserAnalytics | null>;
}

export const useUsersAdminStore = create<UsersAdminStore>((set, get) => ({
  users: [],
  loading: false,
  error: "",

  fetchUsers: async () => {
    set({ loading: true, error: "" });
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*");
      if (usersError) throw usersError;
      set({ users: usersData || [] });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      set({ error: message });
    }
    set({ loading: false });
  },

  updateUserRole: async (userId, role) => {
    set({ loading: true, error: "" });
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
      await get().fetchUsers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update user role";
      set({ error: message });
    }
    set({ loading: false });
  },

  addWarning: async (userId, reason) => {
    set({ loading: true, error: "" });
    try {
      await supabase.from("user_warnings").insert({
        user_id: userId,
        reason,
        created_at: new Date().toISOString(),
      });
      await get().fetchUsers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add warning";
      set({ error: message });
    }
    set({ loading: false });
  },

  restrictUser: async (userId, restrict, reason) => {
    set({ loading: true, error: "" });
    try {
      await supabase
        .from("profiles")
        .update({ is_restricted: restrict })
        .eq("id", userId);
      await supabase.from("notifications").insert({
        user_id: userId,
        message: restrict
          ? `Your account has been restricted: ${reason}`
          : `Restriction removed: ${reason}`,
      });
      await get().fetchUsers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to restrict user";
      set({ error: message });
    }
    set({ loading: false });
  },

  fetchUserAnalytics: async (userId) => {
    set({ loading: true, error: "" });
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
        averagePostsPerDay:
          postsData && postsData.length
            ? postsData.length /
              Math.max(
                1,
                (new Date(postsData[0].created_at).getTime() -
                  new Date(
                    postsData[postsData.length - 1].created_at
                  ).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        averageCommentsPerDay:
          commentsData && commentsData.length
            ? commentsData.length /
              Math.max(
                1,
                (new Date(commentsData[0].created_at).getTime() -
                  new Date(
                    commentsData[commentsData.length - 1].created_at
                  ).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        warningHistory:
          warningsData?.map((w) => ({
            reason: w.reason,
            date: w.created_at,
          })) || [],
      };
      set({ loading: false });
      return analytics;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      set({ error: message, loading: false });
      return null;
    }
  },
}));
