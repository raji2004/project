import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { AuthState, User } from '../types/auth';

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
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (profile) {
        set({ user: profile });
      } else {
        // Handle case where profile doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authUser.id,
            student_id: authUser.user_metadata.student_id,
            email: authUser.email
          }])
          .select()
          .single();
        
        if (profileError) throw profileError;
        
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        set({ user: newProfile });
      }
    }
  },
  signUp: async (email: string, password: string, studentId: string) => {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('student_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existingUser) {
      throw new Error('A user with this student ID already exists');
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          student_id: studentId,
        },
      },
    });

    if (error) {
      if (error.message === 'User already registered') {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw error;
    }

    // Create profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          student_id: studentId,
          email: data.user.email
        }])
        .select()
        .single();

      if (profileError) throw profileError;
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  updateProfile: async (data: Partial<User>) => {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', data.id);
    if (error) throw error;
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
  initializeAuth: async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profile) {
          set({ user: profile, loading: false });
        } else {
          // Handle case where profile doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authUser.id,
              student_id: authUser.user_metadata.student_id,
              email: authUser.email
            }])
            .select()
            .single();
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            set({ user: null, loading: false });
            return;
          }
          
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          set({ user: newProfile, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false });
    }
  }
}));