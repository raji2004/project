export interface User {
  id: string;
  email: string;
  student_id?: string;
  full_name?: string;
  avatar_url?: string;
  department_id?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, studentId: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}