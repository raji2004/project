import { create } from "zustand";
import { supabase } from "../../../lib/supabase";
import { Resource } from "../types/resourceTypes";

interface ResourcesAdminStore {
  resources: Resource[];
  loading: boolean;
  error: string;
  fetchResources: (flowFilter: string, departmentId?: string) => Promise<void>;
  uploadResource: (
    resource: Omit<Resource, "id" | "created_at"> & { file: File }
  ) => Promise<void>;
  editResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
}

export const useResourcesAdminStore = create<ResourcesAdminStore>(
  (set, get) => ({
    resources: [],
    loading: false,
    error: "",

    fetchResources: async (flowFilter, departmentId) => {
      set({ loading: true, error: "" });
      try {
        let query = supabase
          .from("lecture_resources")
          .select("*")
          .order("created_at", { ascending: false });
        if (flowFilter !== "all") query = query.eq("flow", flowFilter);
        if (departmentId) query = query.eq("department_id", departmentId);
        const { data, error } = await query;
        if (error) throw error;
        set({ resources: data || [] });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch resources";
        set({ error: message });
      }
      set({ loading: false });
    },

    uploadResource: async (resource) => {
      set({ loading: true, error: "" });
      try {
        // Upload file to Supabase Storage
        let fileUrl = "";
        if (resource.file) {
          const fileExt = resource.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("resources")
            .upload(fileName, resource.file);
          if (uploadError) throw uploadError;
          fileUrl = supabase.storage.from("resources").getPublicUrl(fileName)
            .data.publicUrl;
        }
        const insertObj = {
          department_id: resource.department_id,
          title: resource.title,
          description: resource.description,
          url: fileUrl,
          type: resource.type,
          flow: resource.flow,
          resource_type: resource.resource_type,
        };
        const { error: insertError } = await supabase
          .from("lecture_resources")
          .insert([insertObj]);
        if (insertError) throw insertError;
        await get().fetchResources("all");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        set({ error: message });
      }
      set({ loading: false });
    },

    editResource: async (id, updates) => {
      set({ loading: true, error: "" });
      try {
        const { error } = await supabase
          .from("lecture_resources")
          .update(updates)
          .eq("id", id);
        if (error) throw error;
        await get().fetchResources("all");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update resource";
        set({ error: message });
      }
      set({ loading: false });
    },

    deleteResource: async (id) => {
      set({ loading: true, error: "" });
      try {
        const { error } = await supabase
          .from("lecture_resources")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await get().fetchResources("all");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to delete resource";
        set({ error: message });
      }
      set({ loading: false });
    },
  })
);
