import React, { useState } from "react";
import { createNotification, createNotificationsForUsers, getAllUsers } from "../utils/notifications";
import { useAuthStore } from "../stores/authStore";

export default function NotificationTest() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Test notification message");
  const [notificationType, setNotificationType] = useState<'resource' | 'warning' | 'restriction' | 'event' | 'role_change'>('event');
  const [result, setResult] = useState<string>("");

  const sendTestNotification = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setResult("");
    
    try {
      const testResult = await createNotification({
        user_id: user.id,
        message: message,
        type: notificationType,
      });
      
      if (testResult.success) {
        setResult("✅ Test notification sent successfully!");
      } else {
        setResult(`❌ Failed to send notification: ${testResult.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendGlobalTestNotification = async () => {
    setLoading(true);
    setResult("");
    
    try {
      const { success, users } = await getAllUsers();
      if (!success || users.length === 0) {
        setResult("❌ Failed to get users");
        return;
      }
      
      const testResult = await createNotificationsForUsers(
        users.map(u => u.id),
        `[TEST] ${message}`
      );
      
      if (testResult.success) {
        setResult(`✅ Test notification sent to ${testResult.count} users successfully!`);
      } else {
        setResult(`❌ Failed to send notifications: ${testResult.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔔 Notification System Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <select
            value={notificationType}
            onChange={(e) => setNotificationType(e.target.value as 'resource' | 'warning' | 'restriction' | 'event' | 'role_change')}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="event">Event</option>
            <option value="warning">Warning</option>
            <option value="restriction">Restriction</option>
            <option value="role_change">Role Change</option>
            <option value="resource">Resource</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter test message..."
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={sendTestNotification}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send to Self"}
          </button>
          
          <button
            onClick={sendGlobalTestNotification}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send to All Users"}
          </button>
        </div>
        
        {result && (
          <div className={`p-3 rounded-md ${
            result.includes("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
} 