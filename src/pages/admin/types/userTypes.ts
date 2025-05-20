export interface User {
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

export interface UserAnalytics {
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
