import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Calendar, Edit2, MapPin, BookOpen, X } from "lucide-react";
import { useEventsAdminStore } from "./stores/eventsAdminStore";
import { Event } from "./types/eventTypes";
import { supabase } from "../../lib/supabase";

interface Department {
  name: string;
  id: string;
}

export default function AdminEvents() {
  const { events, loading, fetchEvents, createEvent, editEvent, deleteEvent } =
    useEventsAdminStore();
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    time: "",
    description: "",
    location: "",
    departments: [],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchDepartments();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(e.target as Node)
      ) {
        setDeptDropdownOpen(false);
      }
    }
    if (deptDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [deptDropdownOpen]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventToInsert: Omit<Event, "id" | "created_at"> = {
        title: newEvent.title || "",
        description: newEvent.description || "",
        date: newEvent.date || "",
        time: newEvent.time || "",
        location: newEvent.location || "",
        departments:
          newEvent.departments && newEvent.departments.length > 0
            ? newEvent.departments
            : departments.map((d: Department) => d.name),
      };
      await createEvent(eventToInsert);
      toast.success("Event created successfully");
      setNewEvent({
        title: "",
        date: "",
        time: "",
        description: "",
        location: "",
        departments: [],
      });
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      toast.error("Failed to create event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      toast.error("Failed to delete event");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const updates: Partial<Event> = {
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
        departments:
          editingEvent.departments && editingEvent.departments.length > 0
            ? editingEvent.departments
            : departments.map((d: Department) => d.name),
      };
      await editEvent(editingEvent.id, updates);
      toast.success("Event updated successfully");
      setShowEditModal(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to update event:", err);
      toast.error("Failed to update event");
    }
  };

  // Helper for department checkbox toggle
  const toggleDepartment = (deptName: string, isEdit = false) => {
    if (isEdit) {
      if (!editingEvent) return;
      let updated = editingEvent.departments || [];
      if (updated.includes(deptName)) {
        updated = updated.filter((d: string) => d !== deptName);
      } else {
        updated = [...updated, deptName];
      }
      setEditingEvent({ ...editingEvent, departments: updated });
    } else {
      let updated = newEvent.departments || [];
      if (updated.includes(deptName)) {
        updated = updated.filter((d: string) => d !== deptName);
      } else {
        updated = [...updated, deptName];
      }
      setNewEvent({ ...newEvent, departments: updated });
    }
  };

  // Helper for All Departments toggle
  const toggleAllDepartments = (isEdit = false) => {
    if (isEdit) {
      if (!editingEvent) return;
      if ((editingEvent.departments || []).length === departments.length) {
        setEditingEvent({ ...editingEvent, departments: [] });
      } else {
        setEditingEvent({
          ...editingEvent,
          departments: departments.map((d) => d.name),
        });
      }
    } else {
      if ((newEvent.departments || []).length === departments.length) {
        setNewEvent({ ...newEvent, departments: [] });
      } else {
        setNewEvent({
          ...newEvent,
          departments: departments.map((d) => d.name),
        });
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-0 bg-gradient-to-br from-purple-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-purple-700 flex items-center gap-2">
          <Calendar className="h-7 w-7 text-purple-500" /> Event Management
        </h1>

        {/* Add Event Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-white p-8 rounded-2xl shadow-lg border border-purple-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-purple-700">
            Add New Event
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Time</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Location
              </label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Departments
              </label>
              <div className="relative" ref={deptDropdownRef}>
                <button
                  type="button"
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none flex justify-between items-center"
                  onClick={() => setDeptDropdownOpen((v) => !v)}
                >
                  {newEvent.departments &&
                  newEvent.departments.length === departments.length
                    ? "All Departments"
                    : newEvent.departments && newEvent.departments.length > 0
                    ? newEvent.departments.join(", ")
                    : "Select departments..."}
                  <span className="ml-2">▼</span>
                </button>
                {deptDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-purple-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-2"
                      onClick={() => toggleAllDepartments(false)}
                    >
                      <input
                        type="checkbox"
                        checked={
                          newEvent.departments &&
                          newEvent.departments.length === departments.length
                        }
                        readOnly
                      />
                      <span>All Departments</span>
                    </div>
                    {departments.map((dept) => (
                      <div
                        key={dept.name}
                        className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-2"
                        onClick={() => toggleDepartment(dept.name, false)}
                      >
                        <input
                          type="checkbox"
                          checked={newEvent.departments?.includes(dept.name)}
                          readOnly
                        />
                        <span>{dept.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Click to select multiple departments.
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                rows={3}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 shadow"
          >
            Add Event
          </button>
        </form>

        {/* Edit Event Modal */}
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg border border-purple-200 relative">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
                <h2 className="text-2xl font-bold text-purple-700">
                  Edit Event
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, time: e.target.value })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Departments
                  </label>
                  <div className="relative" ref={deptDropdownRef}>
                    <button
                      type="button"
                      className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none flex justify-between items-center"
                      onClick={() => setDeptDropdownOpen((v) => !v)}
                    >
                      {editingEvent.departments &&
                      editingEvent.departments.length === departments.length
                        ? "All Departments"
                        : editingEvent.departments &&
                          editingEvent.departments.length > 0
                        ? editingEvent.departments.join(", ")
                        : "Select departments..."}
                      <span className="ml-2">▼</span>
                    </button>
                    {deptDropdownOpen && (
                      <div className="absolute z-30 mt-2 w-full bg-white border border-purple-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div
                          className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-2"
                          onClick={() => toggleAllDepartments(true)}
                        >
                          <input
                            type="checkbox"
                            checked={
                              editingEvent.departments &&
                              editingEvent.departments.length ===
                                departments.length
                            }
                            readOnly
                          />
                          <span>All Departments</span>
                        </div>
                        {departments.map((dept) => (
                          <div
                            key={dept.name}
                            className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-2"
                            onClick={() => toggleDepartment(dept.name, true)}
                          >
                            <input
                              type="checkbox"
                              checked={editingEvent.departments?.includes(
                                dept.name
                              )}
                              readOnly
                            />
                            <span>{dept.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click to select multiple departments.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6 sticky bottom-0 bg-white pt-4 z-10">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 w-full">
          <h2 className="text-xl font-bold p-6 border-b text-purple-700 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" /> Current Events
          </h2>
          <div className="divide-y">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-purple-50 transition w-full"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </span>
                  </div>
                  <div className="text-gray-600 mb-1 truncate">
                    {event.description}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {event.departments &&
                      event.departments.length > 0 &&
                      event.departments.map((dept) => (
                        <span
                          key={dept}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold"
                        >
                          {dept}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {event.location}
                    </span>
                    <span>
                      Date: {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span>Time: {event.time}</span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:items-end">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
