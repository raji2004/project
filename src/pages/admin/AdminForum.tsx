import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../lib/supabase";
import {
  Trash2,
  MessageSquare,
  Loader2,
  Flag,
  CheckCircle,
  Search,
  User as UserIcon,
} from "lucide-react";
import { getAvatarUrl } from "../../utils/avatar";
import { AdminLoadingContext } from "./AdminLayout";

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  author: { full_name: string; avatar_url?: string } | null;
  flagged?: boolean;
  resources?: any;
}
interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  created_at: string;
  author: { full_name: string; avatar_url?: string } | null;
  flagged?: boolean;
  resources?: any;
}

export default function AdminForum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [showFlagged, setShowFlagged] = useState(false);
  const { setGlobalLoading } = useContext(AdminLoadingContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setGlobalLoading(true);
    setError("");
    console.log("[DEBUG] Fetching forum posts...");
    const { data, error } = await supabase
      .from("forum_posts")
      .select(
        "id, title, content, author_id, created_at, flagged, resources, author:profiles!forum_posts_author_id_fkey(full_name, avatar_url)"
      )
      .order("created_at", { ascending: false });
    console.log("[DEBUG] Supabase forum_posts data:", data);
    console.log("[DEBUG] Supabase forum_posts error:", error);
    if (error) setError("Failed to fetch posts");
    else {
      // Normalize author field
      const normalized = (data || []).map((post) => ({
        ...post,
        author: Array.isArray(post.author)
          ? post.author[0] || null
          : post.author || null,
      }));
      setPosts(normalized);
    }
    setLoading(false);
    setGlobalLoading(false);
  }

  async function fetchComments(postId: string) {
    setGlobalLoading(true);
    setComments([]);
    console.log(`[DEBUG] Fetching comments for postId: ${postId}`);
    const { data, error } = await supabase
      .from("forum_comments")
      .select(
        "id, post_id, content, author_id, created_at, flagged, resources, author:profiles!inner(full_name, avatar_url)"
      )
      .eq("post_id", postId)
      .order("created_at");
    console.log("[DEBUG] Supabase forum_comments data:", data);
    console.log("[DEBUG] Supabase forum_comments error:", error);
    // Normalize author field
    const normalized = (data || []).map((comment) => ({
      ...comment,
      author: Array.isArray(comment.author)
        ? comment.author[0] || null
        : comment.author || null,
    }));
    setComments(normalized);
    setGlobalLoading(false);
  }

  async function deletePost(postId: string) {
    setActionLoading(postId + "-post");
    await supabase.from("forum_posts").delete().eq("id", postId);
    await fetchPosts();
    setSelectedPost(null);
    setActionLoading(null);
  }

  async function deleteComment(commentId: string, postId: string) {
    setActionLoading(commentId + "-comment");
    await supabase.from("forum_comments").delete().eq("id", commentId);
    await fetchComments(postId);
    setActionLoading(null);
  }

  async function flagPost(postId: string, flagged: boolean) {
    setActionLoading(postId + "-flag");
    await supabase
      .from("forum_posts")
      .update({ flagged: !flagged })
      .eq("id", postId);
    await fetchPosts();
    setActionLoading(null);
  }

  async function flagComment(
    commentId: string,
    flagged: boolean,
    postId: string
  ) {
    setActionLoading(commentId + "-flag");
    await supabase
      .from("forum_comments")
      .update({ flagged: !flagged })
      .eq("id", commentId);
    await fetchComments(postId);
    setActionLoading(null);
  }

  // Bulk actions
  async function bulkDeletePosts() {
    setActionLoading("bulk-delete-posts");
    await supabase.from("forum_posts").delete().in("id", selectedPosts);
    setSelectedPosts([]);
    await fetchPosts();
    setActionLoading(null);
  }
  async function bulkFlagPosts(flag: boolean) {
    setActionLoading("bulk-flag-posts");
    await supabase
      .from("forum_posts")
      .update({ flagged: flag })
      .in("id", selectedPosts);
    setSelectedPosts([]);
    await fetchPosts();
    setActionLoading(null);
  }
  async function bulkDeleteComments() {
    setActionLoading("bulk-delete-comments");
    await supabase.from("forum_comments").delete().in("id", selectedComments);
    setSelectedComments([]);
    if (selectedPost) await fetchComments(selectedPost.id);
    setActionLoading(null);
  }
  async function bulkFlagComments(flag: boolean) {
    setActionLoading("bulk-flag-comments");
    await supabase
      .from("forum_comments")
      .update({ flagged: flag })
      .in("id", selectedComments);
    setSelectedComments([]);
    if (selectedPost) await fetchComments(selectedPost.id);
    setActionLoading(null);
  }

  // Filtered posts
  const filteredPosts = posts.filter(
    (p) =>
      (!showFlagged || p.flagged) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        (p.author?.full_name || "")
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  // Resource card rendering utility
  function renderResourceCard(res: any, idx: number) {
    if (!res) return null;
    let icon = "📄";
    let label = res.name || res.url || "Resource";
    if (res.type === "image") icon = "🖼️";
    else if (res.type === "video") icon = "🎬";
    else if (res.type === "link") icon = "🔗";
    return (
      <div
        key={idx}
        className="flex flex-col items-center text-xs bg-purple-50 rounded-lg p-2 border-2 border-purple-100 shadow-sm min-w-[90px] max-w-[120px]"
      >
        <span className="text-2xl text-purple-400">{icon}</span>
        <span className="truncate w-20 text-purple-800" title={label}>
          {label}
        </span>
        <div className="flex gap-2 mt-1 opacity-80 group-hover:opacity-100">
          {res.type === "link" ? (
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-purple-100 text-blue-600 underline"
            >
              Open
            </a>
          ) : (
            <>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                title="View"
                className="p-1 rounded hover:bg-purple-100"
              >
                👁️
              </a>
              <a
                href={res.url}
                download
                title="Download"
                className="p-1 rounded hover:bg-purple-100"
              >
                ⬇️
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return null; // spinner is now global
  }

  return (
    <div className="max-w-5xl w-full">
      <h1 className="text-lg font-bold text-purple-700 mb-6">
        Forum Moderation
      </h1>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-md border border-purple-200 px-4 py-2 pl-10 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
          <Search className="absolute left-2 top-2.5 text-purple-400 h-5 w-5" />
        </div>
        <button
          className={`px-3 py-1 rounded text-xs font-medium ${
            showFlagged
              ? "bg-purple-600 text-white"
              : "bg-purple-100 text-purple-700"
          } hover:bg-purple-200 transition-colors`}
          onClick={() => setShowFlagged((v) => !v)}
        >
          {showFlagged ? "Show All" : "Show Flagged Only"}
        </button>
        {selectedPosts.length > 0 && (
          <>
            <button
              onClick={bulkDeletePosts}
              disabled={actionLoading === "bulk-delete-posts"}
              className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => bulkFlagPosts(true)}
              disabled={actionLoading === "bulk-flag-posts"}
              className="px-3 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs font-medium transition-colors"
            >
              Flag Selected
            </button>
            <button
              onClick={() => bulkFlagPosts(false)}
              disabled={actionLoading === "bulk-flag-posts"}
              className="px-3 py-1 rounded bg-purple-50 text-purple-500 hover:bg-purple-100 text-xs font-medium transition-colors"
            >
              Unflag Selected
            </button>
          </>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
              <MessageSquare /> Posts
            </h2>
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-lg shadow p-4 border border-purple-100 cursor-pointer transition-colors ${
                    selectedPost?.id === post.id
                      ? "ring-2 ring-purple-400"
                      : "hover:bg-purple-50"
                  }`}
                  onClick={() => {
                    setSelectedPost(post);
                    fetchComments(post.id);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const event = new CustomEvent("openUserAnalytics", {
                            detail: { userId: post.author_id },
                          });
                          window.dispatchEvent(event);
                        }}
                        title="View user analytics"
                      >
                        {post.author?.avatar_url ? (
                          <img
                            src={getAvatarUrl(post.author.avatar_url)}
                            alt="avatar"
                            className="h-8 w-8 rounded-full object-cover border-2 border-purple-200"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "";
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                        <span className="font-semibold text-purple-900">
                          {post.author?.full_name || "Unknown"}
                        </span>
                      </div>
                      <h3 className="font-bold text-purple-900">
                        {post.title}
                      </h3>
                      {post.flagged ? (
                        <Flag className="h-4 w-4 text-red-500 ml-1" />
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flagPost(post.id, !!post.flagged);
                        }}
                        disabled={actionLoading === post.id + "-flag"}
                        className={`p-1 rounded ${
                          post.flagged
                            ? "bg-purple-100 text-purple-700"
                            : "bg-purple-50 text-purple-500"
                        } hover:bg-purple-200 transition-colors`}
                        title={post.flagged ? "Unflag" : "Flag"}
                      >
                        {post.flagged ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Flag className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                        disabled={actionLoading === post.id + "-post"}
                        className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 text-sm line-clamp-2">
                    {post.content}
                  </p>
                  {(() => {
                    let resources = post.resources;
                    if (typeof resources === "string") {
                      try {
                        resources = JSON.parse(resources);
                      } catch {
                        resources = [];
                      }
                    }
                    if (Array.isArray(resources) && resources.length > 0) {
                      return (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {resources.map(renderResourceCard)}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>
          </div>
          <div>
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow p-4 border border-purple-100">
                <h3 className="font-bold text-purple-700 mb-2">
                  Comments for: {selectedPost.title}
                </h3>
                <div className="flex gap-2 mb-2">
                  {selectedComments.length > 0 && (
                    <>
                      <button
                        onClick={bulkDeleteComments}
                        disabled={actionLoading === "bulk-delete-comments"}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={() => bulkFlagComments(true)}
                        disabled={actionLoading === "bulk-flag-comments"}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-medium transition-colors"
                      >
                        Flag Selected
                      </button>
                      <button
                        onClick={() => bulkFlagComments(false)}
                        disabled={actionLoading === "bulk-flag-comments"}
                        className="px-2 py-1 bg-purple-50 text-purple-500 rounded hover:bg-purple-100 text-xs font-medium transition-colors"
                      >
                        Unflag Selected
                      </button>
                    </>
                  )}
                </div>
                {comments.length === 0 ? (
                  <div className="text-gray-400">No comments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex justify-between items-start bg-purple-50 rounded p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() => {
                              const event = new CustomEvent(
                                "openUserAnalytics",
                                { detail: { userId: comment.author_id } }
                              );
                              window.dispatchEvent(event);
                            }}
                            title="View user analytics"
                          >
                            {comment.author?.avatar_url ? (
                              <img
                                src={getAvatarUrl(comment.author.avatar_url)}
                                alt="avatar"
                                className="h-7 w-7 rounded-full object-cover border-2 border-purple-200"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "";
                                }}
                              />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                                <UserIcon className="h-4 w-4 text-purple-600" />
                              </div>
                            )}
                            <span className="font-medium text-purple-800">
                              {comment.author?.full_name || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          <p className="mt-1 text-gray-700 text-sm">
                            {comment.content}
                          </p>
                          {(() => {
                            let resources = comment.resources;
                            if (typeof resources === "string") {
                              try {
                                resources = JSON.parse(resources);
                              } catch {
                                resources = [];
                              }
                            }
                            if (
                              Array.isArray(resources) &&
                              resources.length > 0
                            ) {
                              return (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {resources.map(renderResourceCard)}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">
                Select a post to view comments.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
