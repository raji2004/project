export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    student_id: string;
    avatar_url?: string;
  };
  comments_count?: number;
}

export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    student_id: string;
    avatar_url?: string;
  };
  resources?: ForumResource[] | string;
}

export interface ForumResource {
  type: "image" | "video" | "file" | "link";
  url: string;
  name?: string;
}

export interface ForumState {
  posts: ForumPost[];
  selectedPost: ForumPost | null;
  comments: ForumComment[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  fetchPost: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createPost: (title: string, content: string) => Promise<void>;
  createComment: (
    postId: string,
    content: string,
    resources?: ForumResource[]
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}
