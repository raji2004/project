import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Calendar, List, X, ArrowRight } from "lucide-react";
import Planner from "./Planner";

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  type: string;
  location: string;
}

export default function Schedule() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "planner">(
    "schedule"
  );
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    fetchEvents();
    // Real-time sync for events
    const eventsChannel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      // Find the next upcoming event
      const now = new Date();
      const upcomingEvents = (data || [])
        .filter((event) => new Date(event.start) > now)
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );
      setNextEvent(upcomingEvents[0] || null);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToEvent = () => {
    if (calendarRef.current && nextEvent) {
      const api = calendarRef.current.getApi?.();
      if (api) {
        api.gotoDate(nextEvent.start);
      }
    }
  };

  // Countdown effect
  useEffect(() => {
    if (!nextEvent) {
      setCountdown("");
      return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const eventTime = new Date(nextEvent.start);
      const diff = eventTime.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Starting now!");
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === "schedule"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === "planner"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <List className="h-5 w-5 mr-2" />
            My Planner
          </button>
        </div>
      </div>

      {/* Upcoming Event Alert (only in Schedule tab) */}
      {activeTab === "schedule" &&
        (nextEvent ? (
          <div
            className="bg-red-600 text-white px-4 py-3 flex items-center justify-between z-20 relative"
            style={{ marginTop: 0 }}
          >
            <div>
              <span className="font-semibold">Upcoming Event:</span>{" "}
              {nextEvent.title} — {new Date(nextEvent.start).toLocaleString()}
              <span className="ml-4 font-mono bg-white text-red-600 px-2 py-1 rounded text-xs">
                {countdown}
              </span>
            </div>
            <button
              onClick={handleGoToEvent}
              className="ml-4 flex items-center bg-white text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium"
            >
              Go to Event <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 text-gray-500 px-4 py-3 text-center z-20 relative">
            No upcoming events.
          </div>
        ))}

      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === "schedule" ? (
          <div className="bg-white rounded-lg shadow h-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events.map((event) => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                backgroundColor:
                  event.type === "lecture"
                    ? "#3B82F6"
                    : event.type === "workshop"
                    ? "#10B981"
                    : "#F59E0B",
                extendedProps: {
                  description: event.description,
                  location: event.location,
                  type: event.type,
                },
              }))}
              eventContent={(eventInfo) => (
                <div className="p-1">
                  <div className="font-medium">{eventInfo.event.title}</div>
                  <div className="text-sm">
                    {eventInfo.event.extendedProps.location}
                  </div>
                </div>
              )}
              eventClick={(info) => {
                const event = events.find((e) => e.id === info.event.id);
                if (event) {
                  setSelectedEvent(event);
                }
              }}
              height="100%"
              stickyHeaderDates={true}
              dayMaxEvents={true}
              nowIndicator={true}
              expandRows={true}
            />
          </div>
        ) : (
          <Planner />
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <p className="mt-1">
                    {new Date(selectedEvent.start).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <p className="mt-1">
                    {new Date(selectedEvent.end).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="mt-1">{selectedEvent.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <p className="mt-1 capitalize">{selectedEvent.type}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
