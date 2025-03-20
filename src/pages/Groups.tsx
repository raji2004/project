import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Send } from 'lucide-react';
import { useForumStore } from '../stores/forumStore';
import { useAuthStore } from '../stores/authStore';

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
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSelectPost = async (postId: string) => {
    await fetchPost(postId);
    await fetchComments(postId);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost(newPost.title, newPost.content);
    setNewPost({ title: '', content: '' });
    setShowNewPost(false);
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost && newComment.trim()) {
      await createComment(selectedPost.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Discussion Forum</h1>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {loading && !posts.length ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-center text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post.id)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-colors ${
                  selectedPost?.id === post.id ? 'ring-2 ring-indigo-500' : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {post.comments_count?.[0]?.count || 0}
                  </div>
                  <span>
                    by {post.author?.full_name || 'Unknown'} •{' '}
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-center text-gray-500">No posts yet. Be the first to create one!</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPost ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Posted by {selectedPost.author?.full_name || 'Unknown'} •{' '}
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </p>
                </div>
                {user?.id === selectedPost.author_id && (
                  <button
                    onClick={() => deletePost(selectedPost.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-500">
                            {comment.author?.full_name || 'Unknown'} •{' '}
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                          {user?.id === comment.author_id && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateComment} className="mt-6">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-center text-gray-500">Select a post to view its details and comments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}