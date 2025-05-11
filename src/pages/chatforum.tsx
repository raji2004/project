import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, Send, Download, Eye } from "lucide-react";
import { useForumStore } from "../stores/forumStore";
import { useAuthStore } from "../stores/authStore";
import { getAvatarUrl } from "../utils/avatar";
import { supabase } from "../lib/supabase";

export default function Groups() {
  const { user } = useAuthStore();
  const {
    posts,
    selectedPost,
    comments,
    loading,
    error,
    fetchPosts,
    fetchPost,
    fetchComments,
    createPost,
    createComment,
    deletePost,
    deleteComment,
  } = useForumStore();

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState("");
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [resourceLinks, setResourceLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");

  // Utility for alternating backgrounds
  const commentBg = (idx: number) =>
    idx % 2 === 0 ? "bg-white" : "bg-purple-50";

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSelectPost = async (postId: string) => {
    await fetchPost(postId);
    await fetchComments(postId);
    setResourceFiles([]);
    setResourceLinks([]);
    setLinkInput("");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost(newPost.title, newPost.content);
    setNewPost({ title: "", content: "" });
    setShowNewPost(false);
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    // Upload files to Supabase Storage
    const uploadedResources: import("../types/forum").ForumResource[] = [];
    if (resourceFiles.length > 0) {
      for (const file of resourceFiles.slice(0, 3)) {
        const filePath = `comments/${selectedPost.id}/${Date.now()}_${
          file.name
        }`;
        const { data, error } = await supabase.storage
          .from("resources")
          .upload(filePath, file, { upsert: true });
        if (!error && data) {
          const publicUrl = `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/public/resources/${filePath}`;
          let type: "file" | "image" | "video" = "file";
          if (file.type.startsWith("image")) type = "image";
          else if (file.type.startsWith("video")) type = "video";
          uploadedResources.push({ type, url: publicUrl, name: file.name });
        }
      }
    }
    // Add links as resources
    const linkResources: import("../types/forum").ForumResource[] =
      resourceLinks.map((link) => ({ type: "link", url: link }));
    const allResources: import("../types/forum").ForumResource[] = [
      ...uploadedResources,
      ...linkResources,
    ];
    await createComment(selectedPost.id, newComment, allResources);
    setNewComment("");
    setResourceFiles([]);
    setResourceLinks([]);
    setLinkInput("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Chat Forum</h1>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2 animate-pulse" />
            New Post
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showNewPost && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Post
          </h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {loading && !posts.length ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-center text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <React.Fragment key={post.id}>
              <div
                onClick={() => handleSelectPost(post.id)}
                className={`flex items-start bg-white rounded-xl shadow p-4 cursor-pointer transition-all border-2 ${
                  selectedPost?.id === post.id
                    ? "border-purple-600 ring-2 ring-purple-300 scale-[1.01] shadow-lg"
                    : "border-gray-200 hover:bg-purple-50 hover:shadow-md"
                } group relative overflow-hidden`}
              >
                {/* Accent bar for selected */}
                {selectedPost?.id === post.id && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 rounded-l-xl animate-fade-in" />
                )}
                {/* Avatar */}
                <img
                  src={
                    post.author?.avatar_url
                      ? getAvatarUrl(post.author.avatar_url)
                      : "/default-avatar.png"
                  }
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover border-2 border-purple-200 mr-4 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-purple-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-purple-400" />
                      {Array.isArray(post.comments_count)
                        ? post.comments_count[0]?.count || 0
                        : post.comments_count || 0}{" "}
                      replies
                    </div>
                    <span>
                      by{" "}
                      <span className="font-semibold text-purple-700">
                        {post.author?.full_name || "Unknown"}
                      </span>{" "}
                      • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {/* Chevron for expand */}
                <span
                  className={`ml-2 transition-transform ${
                    selectedPost?.id === post.id
                      ? "rotate-90 text-purple-600"
                      : "text-gray-400 group-hover:text-purple-400"
                  }`}
                >
                  ▶
                </span>
              </div>
              {/* Expanded thread details/comments below the selected thread */}
              {selectedPost?.id === post.id && (
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-purple-400 p-6 mt-2 animate-fade-in flex flex-col gap-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Post Author Avatar */}
                      <img
                        src={
                          selectedPost.author?.avatar_url
                            ? getAvatarUrl(selectedPost.author.avatar_url)
                            : "/default-avatar.png"
                        }
                        alt="avatar"
                        className="h-10 w-10 rounded-full object-cover border-2 border-purple-200"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-purple-900">
                          {selectedPost.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Posted by{" "}
                          <span className="font-semibold text-purple-700">
                            {selectedPost.author?.full_name || "Unknown"}
                          </span>{" "}
                          •{" "}
                          {new Date(
                            selectedPost.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {user?.id === selectedPost.author_id && (
                      <button
                        onClick={() => deletePost(selectedPost.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4 pl-14">
                    {selectedPost.content}
                  </p>
                  <div className="mt-2">
                    <span className="uppercase text-xs font-bold text-purple-400 tracking-wider mb-2 block">
                      Comments
                    </span>
                    <div className="space-y-4">
                      {comments.map((comment, idx) => (
                        <React.Fragment key={comment.id}>
                          <div
                            className={`flex space-x-4 items-start rounded-lg shadow-sm border border-purple-100 ${commentBg(
                              idx
                            )} p-4 transition-all duration-300 animate-slide-up`}
                            style={{ animationDelay: `${idx * 60}ms` }}
                          >
                            {/* Commenter Avatar */}
                            <img
                              src={
                                comment.author?.avatar_url
                                  ? getAvatarUrl(comment.author.avatar_url)
                                  : "/default-avatar.png"
                              }
                              alt="avatar"
                              className="h-8 w-8 rounded-full object-cover border-2 border-purple-200 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-purple-800 text-sm">
                                    {comment.author?.full_name || "Unknown"}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {user?.id === comment.author_id && (
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <p className="mt-1 text-gray-700 text-sm">
                                {comment.content}
                              </p>
                              {/* Resource preview */}
                              {comment.resources &&
                                (() => {
                                  let resources: import("../types/forum").ForumResource[] =
                                    [];
                                  try {
                                    resources =
                                      typeof comment.resources === "string"
                                        ? JSON.parse(comment.resources)
                                        : comment.resources;
                                  } catch {
                                    resources = [];
                                  }
                                  if (
                                    !Array.isArray(resources) ||
                                    resources.length === 0
                                  )
                                    return null;
                                  return (
                                    <div className="flex flex-wrap gap-4 mt-2 animate-fade-in">
                                      {resources.map((res, rIdx) => {
                                        if (res.type === "image") {
                                          return (
                                            <div
                                              key={rIdx}
                                              className="flex flex-col items-center group transition-transform duration-200 hover:scale-105 bg-purple-50 rounded-lg p-2 shadow-sm"
                                            >
                                              <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <img
                                                  src={res.url}
                                                  alt={res.name || "image"}
                                                  className="h-20 w-20 object-cover rounded border-2 border-purple-200 shadow group-hover:ring-2 group-hover:ring-purple-400 transition-all"
                                                />
                                              </a>
                                              <div className="flex gap-2 mt-1 opacity-80 group-hover:opacity-100">
                                                <a
                                                  href={res.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  title="View"
                                                  className="p-1 rounded hover:bg-purple-100"
                                                >
                                                  <Eye className="h-4 w-4 text-purple-500" />
                                                </a>
                                                <a
                                                  href={res.url}
                                                  download
                                                  title="Download"
                                                  className="p-1 rounded hover:bg-purple-100"
                                                >
                                                  <Download className="h-4 w-4 text-purple-500" />
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        } else if (res.type === "video") {
                                          return (
                                            <div
                                              key={rIdx}
                                              className="flex flex-col items-center group transition-transform duration-200 hover:scale-105 bg-purple-50 rounded-lg p-2 shadow-sm"
                                            >
                                              <video
                                                src={res.url}
                                                controls
                                                className="h-20 w-32 rounded border-2 border-purple-200 shadow bg-black group-hover:ring-2 group-hover:ring-purple-400 transition-all"
                                              />
                                              <div className="flex gap-2 mt-1 opacity-80 group-hover:opacity-100">
                                                <a
                                                  href={res.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  title="View"
                                                  className="p-1 rounded hover:bg-purple-100"
                                                >
                                                  <Eye className="h-4 w-4 text-purple-500" />
                                                </a>
                                                <a
                                                  href={res.url}
                                                  download
                                                  title="Download"
                                                  className="p-1 rounded hover:bg-purple-100"
                                                >
                                                  <Download className="h-4 w-4 text-purple-500" />
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        } else if (res.type === "file") {
                                          return (
                                            <div
                                              key={rIdx}
                                              className="flex flex-col items-center text-xs p-2 border-2 border-purple-100 rounded bg-purple-50 hover:bg-purple-100 group transition-transform duration-200 hover:scale-105 shadow-sm"
                                            >
                                              <span className="text-2xl text-purple-400">
                                                📄
                                              </span>
                                              <span className="truncate w-20 text-purple-800">
                                                {res.name || "File"}
                                              </span>
                                              <div className="flex gap-2 mt-1 opacity-80 group-hover:opacity-100">
                                                <a
                                                  href={res.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  title="View"
                                                  className="p-1 rounded hover:bg-purple-200"
                                                >
                                                  <Eye className="h-4 w-4 text-purple-500" />
                                                </a>
                                                <a
                                                  href={res.url}
                                                  download
                                                  title="Download"
                                                  className="p-1 rounded hover:bg-purple-200"
                                                >
                                                  <Download className="h-4 w-4 text-purple-500" />
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        } else if (res.type === "link") {
                                          return (
                                            <a
                                              key={rIdx}
                                              href={res.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex flex-col items-center text-xs p-2 border-2 border-purple-100 rounded bg-purple-50 hover:bg-purple-100 group transition-transform duration-200 hover:scale-105 shadow-sm"
                                            >
                                              <span className="text-2xl text-purple-400">
                                                🔗
                                              </span>
                                              <span className="truncate w-20 text-purple-800">
                                                {res.url}
                                              </span>
                                            </a>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  );
                                })()}
                            </div>
                          </div>
                          {/* Divider between comments */}
                          {idx < comments.length - 1 && (
                            <div className="border-t border-purple-100 my-2 ml-12" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <form onSubmit={handleCreateComment} className="mt-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex space-x-4 items-center">
                          <img
                            src={
                              user?.avatar_url
                                ? getAvatarUrl(user.avatar_url)
                                : "/default-avatar.png"
                            }
                            alt="avatar"
                            className="h-8 w-8 rounded-full object-cover border-2 border-purple-200"
                          />
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-md border border-purple-200 px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm bg-purple-50"
                          />
                          <button
                            type="submit"
                            disabled={
                              !newComment.trim() &&
                              resourceFiles.length === 0 &&
                              resourceLinks.length === 0
                            }
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow transition-transform active:scale-95"
                          >
                            <Send className="h-4 w-4 mr-2 animate-pulse" />
                            Send
                          </button>
                        </div>
                        {/* File input for resources */}
                        <div className="flex items-center gap-2 mt-2">
                          <label className="cursor-pointer text-purple-600 hover:underline text-sm">
                            Attach files
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  const files = Array.from(e.target.files);
                                  setResourceFiles((prev) => {
                                    const combined = [...prev, ...files];
                                    return combined.slice(0, 3);
                                  });
                                }
                              }}
                            />
                          </label>
                          {/* Link input */}
                          <input
                            type="text"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="Paste a link and press Add"
                            className="rounded-md border border-purple-200 px-2 py-1 text-sm w-64 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                          />
                          <button
                            type="button"
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                            onClick={() => {
                              if (linkInput.trim()) {
                                setResourceLinks([
                                  ...resourceLinks,
                                  linkInput.trim(),
                                ]);
                                setLinkInput("");
                              }
                            }}
                          >
                            Add Link
                          </button>
                        </div>
                        {/* Preview of selected files and links */}
                        {(resourceFiles.length > 0 ||
                          resourceLinks.length > 0) && (
                          <div className="flex flex-wrap gap-4 mt-2">
                            {resourceFiles.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center text-xs bg-purple-50 rounded-lg p-2 border-2 border-purple-100 shadow-sm"
                              >
                                {file.type.startsWith("image") ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-12 w-12 object-cover rounded border-2 border-purple-200"
                                  />
                                ) : file.type.startsWith("video") ? (
                                  <span className="h-12 w-12 flex items-center justify-center bg-purple-100 rounded border-2 border-purple-200">
                                    🎬
                                  </span>
                                ) : (
                                  <span className="h-12 w-12 flex items-center justify-center bg-purple-100 rounded border-2 border-purple-200">
                                    📄
                                  </span>
                                )}
                                <span className="truncate w-16 text-purple-800">
                                  {file.name}
                                </span>
                              </div>
                            ))}
                            {resourceLinks.map((link, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center text-xs bg-purple-50 rounded-lg p-2 border-2 border-purple-100 shadow-sm"
                              >
                                <span className="h-12 w-12 flex items-center justify-center bg-purple-100 rounded border-2 border-purple-200">
                                  🔗
                                </span>
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate w-16 text-purple-600 underline"
                                >
                                  Link {idx + 1}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-center text-gray-500">
              No posts yet. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
