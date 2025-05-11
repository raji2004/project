import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { ForumState, ForumPost, ForumComment } from "../types/forum";

export const useForumStore = create<ForumState>((set, get) => ({
  posts: [],
  selectedPost: null,
  comments: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select(
          `
          *,
          author:profiles(full_name, student_id, avatar_url),
          comments_count:forum_comments(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      set({ error: "Failed to fetch posts" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPost: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select(
          `
          *,
          author:profiles(full_name, student_id, avatar_url)
        `
        )
        .eq("id", postId)
        .single();

      if (error) throw error;
      set({ selectedPost: data });
    } catch (error) {
      set({ error: "Failed to fetch post" });
    } finally {
      set({ loading: false });
    }
  },

  fetchComments: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select(
          `
          *,
          author:profiles(full_name, student_id, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      set({ comments: data || [] });
    } catch (error) {
      set({ error: "Failed to fetch comments" });
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (title: string, content: string) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("forum_posts").insert([
        {
          title,
          content,
          author_id: user.id,
        },
      ]);

      if (error) throw error;
      await get().fetchPosts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create post",
      });
    } finally {
      set({ loading: false });
    }
  },

  createComment: async (postId: string, content: string, resources?: any[]) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("forum_comments").insert([
        {
          post_id: postId,
          content,
          author_id: user.id,
          resources: resources ? JSON.stringify(resources) : null,
        },
      ]);

      if (error) throw error;
      await get().fetchComments(postId);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create comment",
      });
    } finally {
      set({ loading: false });
    }
  },

  deletePost: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      await get().fetchPosts();
      set({ selectedPost: null });
    } catch (error) {
      set({ error: "Failed to delete post" });
    } finally {
      set({ loading: false });
    }
  },

  deleteComment: async (commentId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      const selectedPost = get().selectedPost;
      if (selectedPost) {
        await get().fetchComments(selectedPost.id);
      }
    } catch (error) {
      set({ error: "Failed to delete comment" });
    } finally {
      set({ loading: false });
    }
  },
}));
