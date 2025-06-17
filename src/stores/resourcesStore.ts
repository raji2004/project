import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { ResourcesState } from "../types/resources";
import { createResourceNotificationsForDepartment } from "../utils/notifications";

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
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      set({ departments: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch departments";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  fetchResourcesByDepartment: async (departmentId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("lecture_resources")
        .select("*")
        .eq("department_id", departmentId)
        .order("created_at", { ascending: false }).limit(3);

      if (error) throw error;
      set({ resources: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch resources";
      set({ error: errorMessage });
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
    type: "pdf" | "video" | "link";
    resource_type?: "resource" | "past_question";
    year?: number;
    course?: string;
    semester?: string;
  }) => {
    set({ loading: true, error: null });
    try {
      // Upload file to storage
      const fileExt = resource.file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resources/${resource.department_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("lecture-resources")
        .upload(filePath, resource.file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("lecture-resources").getPublicUrl(filePath);

      // Create resource record
      const { data: insertedResource, error: insertError } = await supabase
        .from("lecture_resources")
        .insert([
          {
            department_id: resource.department_id,
            title: resource.title,
            description: resource.description,
            url: publicUrl,
            type: resource.type,
            resource_type: resource.resource_type || "resource",
            year: resource.year || null,
            course: resource.course || null,
            semester: resource.semester || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Create notifications for all users in the department
      if (insertedResource) {
        const message = `New ${resource.type} resource uploaded: ${resource.title}`;
        const result = await createResourceNotificationsForDepartment(
          resource.department_id,
          insertedResource.id,
          message
        );
        
        if (result.success) {
          console.log("[Resource Notification] Created", result.count, "notifications");
        } else {
          console.error("[Resource Notification] Failed to create notifications:", result.error);
        }
      }

      // Refresh resources list
      await useResourcesStore
        .getState()
        .fetchResourcesByDepartment(resource.department_id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload resource";
      set({ error: errorMessage });
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
        .from("lecture_resources")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePath = resource.url.split("/").pop();
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from("lecture-resources")
          .remove([`resources/${departmentId}/${filePath}`]);

        if (deleteError) throw deleteError;
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("lecture_resources")
        .delete()
        .eq("id", resourceId);

      if (deleteError) throw deleteError;

      // Refresh resources list
      await useResourcesStore
        .getState()
        .fetchResourcesByDepartment(departmentId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete resource";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
