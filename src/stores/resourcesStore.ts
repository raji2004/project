import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ResourcesState, Department, LectureResource } from '../types/resources';

export const useResourcesStore = create<ResourcesState>((set) => ({
  departments: [],
  resources: [],
  selectedDepartment: null,
  loading: false,
  error: null,

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ departments: data });
    } catch (error) {
      set({ error: 'Failed to fetch departments' });
    } finally {
      set({ loading: false });
    }
  },

  fetchResourcesByDepartment: async (departmentId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('lecture_resources')
        .select('*')
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ resources: data });
    } catch (error) {
      set({ error: 'Failed to fetch resources' });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedDepartment: (departmentId: string | null) => {
    set({ selectedDepartment: departmentId });
  },
}));