import React, { useEffect, useState } from "react";
import { MessageSquare, Loader2, Flag, Search } from "lucide-react";
import { getAvatarUrl } from "../../utils/avatar";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface ForumResource {
  name?: string;
  url?: string;
  type?: "file" | "image" | "video" | "link";
}

interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  author?: { full_name: string; avatar_url?: string } | null;
  flagged?: boolean;
  resources?: ForumResource[];
}

interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  author?: { full_name: string; avatar_url?: string } | null;
  resources?: ForumResource[];
}

export default function AdminForum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*, author:profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch posts";
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  };

  const fetchComments = async (postId: string) => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*, author:profiles(full_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch comments";
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  };

  const moderatePost = async (
    postId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    setLoading(true);
    setError("");
    try {
      if (action === "delete") {
        await supabase.from("forum_posts").delete().eq("id", postId);
      } else {
        await supabase
          .from("forum_posts")
          .update({ status: action })
          .eq("id", postId);
      }
      await fetchPosts();
      toast.success(`Post ${action}ed successfully`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to moderate post";
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  };

  const moderateComment = async (
    commentId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    setLoading(true);
    setError("");
    try {
      if (action === "delete") {
        await supabase.from("forum_comments").delete().eq("id", commentId);
      } else {
        await supabase
          .from("forum_comments")
          .update({ status: action })
          .eq("id", commentId);
      }
      if (selectedPost) {
        await fetchComments(selectedPost.id);
      }
      toast.success(`Comment ${action}ed successfully`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to moderate comment";
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  };

  // Resource card rendering utility
  function renderResourceCard(
    res: { name?: string; url?: string; type?: string },
    idx: number
  ) {
    if (!res) return null;
    let icon = "📄";
    const label = res.name || res.url || "Resource";
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
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-purple-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-purple-700 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-purple-500" /> Forum Moderation
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
        </div>

        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                <MessageSquare /> Posts
              </h2>
              <div className="space-y-3">
                {posts.map((post) => (
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
                    <div className="flex items-center gap-3">
                      <div
                        className="cursor-pointer flex items-center gap-2"
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
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moderatePost(post.id, "approve");
                          }}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moderatePost(post.id, "reject");
                          }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moderatePost(post.id, "delete");
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
                            {comment.author?.avatar_url ? (
                              <img
                                src={getAvatarUrl(comment.author.avatar_url)}
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
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="ml-2 text-xs text-gray-500">
                                  {new Date(
                                    comment.created_at
                                  ).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      moderateComment(comment.id, "approve")
                                    }
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      moderateComment(comment.id, "reject")
                                    }
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() =>
                                      moderateComment(comment.id, "delete")
                                    }
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
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
    </div>
  );
}
