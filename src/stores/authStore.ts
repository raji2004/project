import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { AuthState, User } from "../types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Fetch user data after successful sign in
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) throw profileError;
      set({ user: profile });
    }
  },
  signUp: async (
    email: string,
    password: string,
    studentId: string,
    fullName?: string,
    departmentId?: string
  ) => {
    console.log("Starting signup process...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          student_id: studentId,
          full_name: fullName || null,
          department_id: departmentId || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log("Signup response:", { data, error });

    if (error) {
      console.error("Signup error:", error);
      if (error.message === "User already registered") {
        throw new Error(
          "This email is already registered. Please try logging in instead."
        );
      }
      throw error;
    }

    if (!data?.user) {
      console.error("No user data returned from signup");
      throw new Error("Registration failed. Please try again.");
    }

    // Check if email confirmation is required
    if (data.user.identities?.length === 0) {
      console.log("Email confirmation required");
      return;
    }

    console.log("Signup successful, user:", data.user);
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  updateProfile: async (data: Partial<User>) => {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", data.id);
    if (error) throw error;
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
  initializeAuth: async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          set({ user: null, loading: false });
          return;
        }
        set({ user: profile, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ user: null, loading: false });
    }
  },
}));
