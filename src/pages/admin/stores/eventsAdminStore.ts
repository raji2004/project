import { create } from "zustand";
import { supabase } from "../../../lib/supabase";
import { Event } from "../types/eventTypes";

interface EventsAdminStore {
  events: Event[];
  loading: boolean;
  error: string;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, "id" | "created_at">) => Promise<void>;
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
        .order("created_at", { ascending: false });
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
      const { error } = await supabase.from("events").insert([event]);
      if (error) throw error;
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
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
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
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      await get().fetchEvents();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      set({ error: message });
    }
    set({ loading: false });
  },
}));
