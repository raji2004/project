import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Bell } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: string;
}

interface ResourceNotification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  type: string;
}

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resourceNotifications, setResourceNotifications] = useState<ResourceNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchResourceNotifications();
      // Temporarily disable real-time subscriptions until database is fixed
      // const cleanup = setupRealtimeSubscriptions();
      
      // return () => {
      //   // Cleanup subscriptions
      //   if (cleanup) cleanup();
      // };
    }
  }, [user?.id]);

  // const setupRealtimeSubscriptions = () => {
  //   if (!user?.id) return () => {};

  //   // Subscribe to regular notifications
  //   const notificationsSubscription = supabase
  //     .channel('notifications')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'notifications',
  //         filter: `user_id=eq.${user.id}`
  //       },
  //       (payload) => {
  //         console.log('Notification change:', payload);
  //         fetchNotifications();
  //       }
  //     )
  //     .subscribe();

  //   // Subscribe to resource notifications
  //   const resourceNotificationsSubscription = supabase
  //     .channel('resource_notifications')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'resource_notifications',
  //         filter: `user_id=eq.${user.id}`
  //       },
  //       (payload) => {
  //         console.log('Resource notification change:', payload);
  //         fetchResourceNotifications();
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     notificationsSubscription.unsubscribe();
  //     resourceNotificationsSubscription.unsubscribe();
  //   };
  // };

  async function fetchNotifications() {
    if (!user?.id) return;
    setLoading(true);
    try {
      console.log("Fetching notifications for user:", user.id);
      const { data, error } = await supabase
        .from("notifications")
        .select("id, message, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        console.log("Fetched notifications:", data);
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchResourceNotifications() {
    if (!user?.id) return;
    try {
      console.log("Fetching resource notifications for user:", user.id);
      const { data, error } = await supabase
        .from("resource_notifications")
        .select("id, message, read, created_at, type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching resource notifications:", error);
      } else {
        console.log("Fetched resource notifications:", data);
        setResourceNotifications(data || []);
      }
    } catch (error) {
      console.error("Error in fetchResourceNotifications:", error);
    }
  }

  async function markAsRead(id: string, isResource: boolean) {
    try {
      if (isResource) {
        const { error } = await supabase
          .from("resource_notifications")
          .update({ read: true })
          .eq("id", id);
        if (error) throw error;
        await fetchResourceNotifications();
      } else {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id);
        if (error) throw error;
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      // Mark all regular notifications as read
      if (notifications.some(n => !n.read)) {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user?.id)
          .eq("read", false);
        if (error) throw error;
      }

      // Mark all resource notifications as read
      if (resourceNotifications.some(n => !n.read)) {
        const { error } = await supabase
          .from("resource_notifications")
          .update({ read: true })
          .eq("user_id", user?.id)
          .eq("read", false);
        if (error) throw error;
      }

      await fetchNotifications();
      await fetchResourceNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
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

  const unreadCount = notifications.filter((n) => !n.read).length + resourceNotifications.filter((n) => !n.read).length;
  const allNotifications = [
    ...notifications.map((n) => ({ ...n, isResource: false })),
    ...resourceNotifications.map((n) => ({ ...n, isResource: true })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'event':
        return '📅';
      case 'warning':
        return '⚠️';
      case 'restriction':
        return '🚫';
      case 'role_change':
        return '👤';
      case 'resource':
        return '📚';
      default:
        return '🔔'; // Default icon for notifications without type
    }
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        className="p-2 rounded-full text-gray-500 hover:text-gray-900 relative transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-200"
        >
          <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
            <span>Notifications</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchNotifications();
                  fetchResourceNotifications();
                }}
                className="text-xs text-gray-600 hover:underline"
                title="Refresh notifications"
              >
                🔄
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-gray-500 text-center">Loading...</div>
          ) : allNotifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No notifications</div>
          ) : (
            <ul>
              {allNotifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-2 hover:bg-gray-50 transition-colors ${
                    n.read ? "bg-gray-50" : "bg-yellow-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-lg">{getNotificationIcon(n.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 break-words">
                      {n.message}
                      {n.isResource && (
                        <span className="ml-2 text-xs text-purple-600">[Resource]</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      className="ml-2 text-xs text-blue-600 hover:underline flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id, n.isResource);
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
