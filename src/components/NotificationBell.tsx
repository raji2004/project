import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Bell } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) fetchNotifications();
    // Optionally, poll for new notifications every 30s
    const interval = setInterval(() => {
      if (user?.id) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user?.id]);

  async function fetchNotifications() {
    if (!user?.id) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, message, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications(data || []);
  }

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    await fetchNotifications();
  }

  // Close dropdown on outside click or bell click only
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && bellRef.current.contains(e.target as Node)) {
        // Bell icon click toggles dropdown, handled by onClick
        return;
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        ref={bellRef}
        className="p-2 rounded-full text-gray-500 hover:text-gray-900 relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-200"
        >
          <div className="p-4 border-b font-semibold text-gray-700">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-2 ${
                    n.read ? "bg-gray-50" : "bg-yellow-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      className="ml-2 text-xs text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
