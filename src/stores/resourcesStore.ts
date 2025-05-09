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

  uploadResource: async (resource: {
    department_id: string;
    title: string;
    description: string | null;
    file: File;
    type: 'pdf' | 'video' | 'link';
  }) => {
    set({ loading: true, error: null });
    try {
      // Upload file to storage
      const fileExt = resource.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resources/${resource.department_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lecture-resources')
        .upload(filePath, resource.file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lecture-resources')
        .getPublicUrl(filePath);

      // Create resource record
      const { error: insertError } = await supabase
        .from('lecture_resources')
        .insert([{
          department_id: resource.department_id,
          title: resource.title,
          description: resource.description,
          url: publicUrl,
          type: resource.type
        }]);

      if (insertError) throw insertError;

      // Refresh resources list
      await useResourcesStore.getState().fetchResourcesByDepartment(resource.department_id);
    } catch (error) {
      set({ error: 'Failed to upload resource' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteResource: async (resourceId: string, departmentId: string) => {
    set({ loading: true, error: null });
    try {
      // Get resource to delete
      const { data: resource, error: fetchError } = await supabase
        .from('lecture_resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePath = resource.url.split('/').pop();
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from('lecture-resources')
          .remove([`resources/${departmentId}/${filePath}`]);

        if (deleteError) throw deleteError;
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('lecture_resources')
        .delete()
        .eq('id', resourceId);

      if (deleteError) throw deleteError;

      // Refresh resources list
      await useResourcesStore.getState().fetchResourcesByDepartment(departmentId);
    } catch (error) {
      set({ error: 'Failed to delete resource' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));