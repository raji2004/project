import { create } from "zustand";
import { supabase } from "../../../lib/supabase";
import { Event } from "../types/eventTypes";
import { createNotificationsForUsers, getAllUsers } from "../../../utils/notifications";

interface EventsAdminStore {
  events: Event[];
  loading: boolean;
  error: string;
  fetchEvents: () => Promise<void>;
  createEvent: (
    event: Omit<Event, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  editEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventsAdminStore = create<EventsAdminStore>((set, get) => ({
  events: [],
  loading: false,
  error: "",

  fetchEvents: async () => {
    set({ loading: true, error: "" });
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start", { ascending: true });
      if (error) throw error;
      set({ events: data || [] });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch events";
      set({ error: message });
    }
    set({ loading: false });
  },

  createEvent: async (event) => {
    set({ loading: true, error: "" });
    try {
      const { error } = await supabase
        .from("events")
        .insert([event]);
      if (error) throw error;

      // Get all users and create notifications
      const { success, users } = await getAllUsers();
      if (success && users.length > 0) {
        const message = `New event scheduled: ${event.title} on ${new Date(event.start).toLocaleDateString()}`;
        const result = await createNotificationsForUsers(
          users.map(u => u.id),
          message
        );
        
        if (result.success) {
          console.log("[Event Notification] Created", result.count, "notifications");
        } else {
          console.error("[Event Notification] Failed to create notifications:", result.error);
        }
      }

      await get().fetchEvents();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create event";
      set({ error: message });
    }
    set({ loading: false });
  },

  editEvent: async (id, updates) => {
    set({ loading: true, error: "" });
    try {
      // Get the event before updating to know what changed
      const { data: oldEvent, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);
      if (error) throw error;

      // Get all users and create notifications
      const { success, users } = await getAllUsers();
      if (success && users.length > 0) {
        const message = `Event updated: ${updates.title || oldEvent.title} - ${updates.start ? `new date: ${new Date(updates.start).toLocaleDateString()}` : 'details changed'}`;
        const result = await createNotificationsForUsers(
          users.map(u => u.id),
          message
        );
        
        if (result.success) {
          console.log("[Event Notification] Created", result.count, "update notifications");
        } else {
          console.error("[Event Notification] Failed to create update notifications:", result.error);
        }
      }

      await get().fetchEvents();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update event";
      set({ error: message });
    }
    set({ loading: false });
  },

  deleteEvent: async (id) => {
    set({ loading: true, error: "" });
    try {
      // Get the event before deleting to know what was deleted
      const { data: eventToDelete, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;

      // Get all users and create notifications
      const { success, users } = await getAllUsers();
      if (success && users.length > 0) {
        const message = `Event cancelled: ${eventToDelete.title} (was scheduled for ${new Date(eventToDelete.start).toLocaleDateString()})`;
        const result = await createNotificationsForUsers(
          users.map(u => u.id),
          message
        );
        
        if (result.success) {
          console.log("[Event Notification] Created", result.count, "deletion notifications");
        } else {
          console.error("[Event Notification] Failed to create deletion notifications:", result.error);
        }
      }

      await get().fetchEvents();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      set({ error: message });
    }
    set({ loading: false });
  },
}));
