import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";
import { Plus, Check, Trash2, Edit } from "lucide-react";
import { X } from "lucide-react";

interface Plan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  reminder_time: string | null;
  color: string;
  is_completed: boolean;
}

export default function Planner() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    reminder_time: "",
    color: "#3B82F6",
  });
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPlans();
    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user?.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    plans.forEach((plan) => {
      if (plan.reminder_time && !plan.is_completed) {
        const reminderTime = new Date(plan.reminder_time);
        if (
          reminderTime.getTime() <= now.getTime() &&
          reminderTime.getTime() > now.getTime() - 60000
        ) {
          toast(
            <div>
              <h3 className="font-bold">{plan.title}</h3>
              <p className="mt-1">{plan.description}</p>
              <p className="mt-1">
                Starts at: {new Date(plan.start_time).toLocaleString()}
              </p>
            </div>,
            {
              duration: 10000,
              icon: "🔔",
            }
          );
        }
      }
    });
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from("user_plans").insert({
        user_id: user?.id,
        ...newPlan,
      });

      if (error) throw error;
      await fetchPlans();
      setShowAddModal(false);
      setNewPlan({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        reminder_time: "",
        color: "#3B82F6",
      });
      toast.success("Plan added successfully!");
    } catch (error) {
      console.error("Error adding plan:", error);
      toast.error("Failed to add plan");
    }
  };

  const handleUpdatePlan = async (planId: string, updates: Partial<Plan>) => {
    try {
      const { error } = await supabase
        .from("user_plans")
        .update(updates)
        .eq("id", planId);

      if (error) throw error;
      await fetchPlans();
      toast.success("Plan updated successfully!");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from("user_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      await fetchPlans();
      toast.success("Plan deleted successfully!");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditPlan(plan);
    setShowEditModal(true);
  };

  const handleEditPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan) return;
    try {
      const { error } = await supabase
        .from("user_plans")
        .update({
          title: editPlan.title,
          description: editPlan.description,
          start_time: editPlan.start_time,
          end_time: editPlan.end_time,
          reminder_time: editPlan.reminder_time,
          color: editPlan.color,
        })
        .eq("id", editPlan.id);
      if (error) throw error;
      toast.success("Plan updated successfully!");
      setShowEditModal(false);
      setEditPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-2xl font-bold text-gray-900">My Planner</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Plan
          </button>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <div className="bg-white rounded-lg shadow h-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={plans.map((plan) => ({
                id: plan.id,
                title: plan.title,
                start: plan.start_time,
                end: plan.end_time,
                backgroundColor: plan.color,
                extendedProps: {
                  description: plan.description,
                  reminder_time: plan.reminder_time,
                  is_completed: plan.is_completed,
                },
              }))}
              eventContent={(eventInfo) => {
                const plan = plans.find((p) => p.id === eventInfo.event.id);
                return (
                  <div className="p-1">
                    <div className="font-medium flex items-center justify-between">
                      <span>{eventInfo.event.title}</span>
                      <div className="flex items-center gap-1">
                        {plan && plan.is_completed && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {plan && plan.user_id === user?.id && (
                          <button
                            className="ml-1 p-1 rounded hover:bg-gray-200"
                            title="Edit Plan"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPlan(plan);
                            }}
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      {eventInfo.event.extendedProps.description}
                    </div>
                  </div>
                );
              }}
              eventClick={(info) => {
                const plan = plans.find((p) => p.id === info.event.id);
                if (plan) {
                  setSelectedPlan(plan);
                }
              }}
              height="100%"
              stickyHeaderDates={true}
              dayMaxEvents={true}
              nowIndicator={true}
              expandRows={true}
            />
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Plan</h2>
            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newPlan.start_time}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, start_time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newPlan.end_time}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, end_time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Time
                </label>
                <input
                  type="datetime-local"
                  value={newPlan.reminder_time}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, reminder_time: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="color"
                  value={newPlan.color}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, color: e.target.value })
                  }
                  className="mt-1 block w-full h-10 rounded-md border border-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedPlan.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <p className="mt-1">
                    {new Date(selectedPlan.start_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <p className="mt-1">
                    {new Date(selectedPlan.end_time).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedPlan.reminder_time && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reminder Time
                  </label>
                  <p className="mt-1">
                    {new Date(selectedPlan.reminder_time).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    handleUpdatePlan(selectedPlan.id, {
                      is_completed: !selectedPlan.is_completed,
                    })
                  }
                  className={`flex items-center px-4 py-2 rounded-md ${
                    selectedPlan.is_completed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Check className="h-5 w-5 mr-2" />
                  {selectedPlan.is_completed ? "Completed" : "Mark Complete"}
                </button>
                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="flex items-center px-4 py-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editPlan && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Edit Plan</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditPlanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={editPlan.title}
                  onChange={(e) =>
                    setEditPlan({ ...editPlan, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editPlan.description}
                  onChange={(e) =>
                    setEditPlan({ ...editPlan, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editPlan.start_time}
                    onChange={(e) =>
                      setEditPlan({ ...editPlan, start_time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editPlan.end_time}
                    onChange={(e) =>
                      setEditPlan({ ...editPlan, end_time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Time
                </label>
                <input
                  type="datetime-local"
                  value={editPlan.reminder_time || ""}
                  onChange={(e) =>
                    setEditPlan({ ...editPlan, reminder_time: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="color"
                  value={editPlan.color}
                  onChange={(e) =>
                    setEditPlan({ ...editPlan, color: e.target.value })
                  }
                  className="mt-1 block w-full h-10 rounded-md border border-gray-300"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
