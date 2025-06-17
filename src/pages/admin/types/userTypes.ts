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
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_reason?: string | null;
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

export interface DeletedUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  student_id: string | null;
  department_id: string | null;
  deleted_at: string;
  deleted_by: string | null;
  reason: string | null;
  is_restrictive: boolean;
}

export interface BannedEmail {
  id: string;
  email: string;
  banned_at: string;
  banned_by: string | null;
  reason: string | null;
  is_permanent: boolean;
}
