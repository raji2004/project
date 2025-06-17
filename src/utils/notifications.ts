import { supabase } from "../lib/supabase";

export interface NotificationData {
  user_id: string;
  message: string;
  read?: boolean;
  type?: 'resource' | 'warning' | 'restriction' | 'event' | 'role_change';
}

export interface ResourceNotificationData {
  user_id: string;
  department_id: string;
  resource_id: string;
  message: string;
  read?: boolean;
  type?: 'resource';
}

/**
 * Create a notification for a single user
 */
export async function createNotification(notification: NotificationData) {
  try {
    const { error, data } = await supabase
      .from("notifications")
      .insert([{
        user_id: notification.user_id,
        message: notification.message,
        read: notification.read ?? false,
        // Temporarily remove type field until migration is applied
        // type: notification.type ?? 'resource'
      }]);
    
    if (error) {
      console.error("[Notification] Failed to create notification:", error, notification);
      return { success: false, error };
    }
    
    console.log("[Notification] Created notification:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Notification] Error creating notification:", error);
    return { success: false, error };
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  message: string
  // type parameter temporarily removed until migration is applied
) {
  if (userIds.length === 0) return { success: true, count: 0 };

  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      message,
      read: false,
      // Temporarily remove type field until migration is applied
      // type
    }));

    const { error, data } = await supabase
      .from("notifications")
      .insert(notifications);
    
    if (error) {
      console.error("[Notification] Failed to create notifications for users:", error);
      return { success: false, error, count: 0 };
    }
    
    console.log("[Notification] Created notifications for", userIds.length, "users");
    return { success: true, data, count: userIds.length };
  } catch (error) {
    console.error("[Notification] Error creating notifications for users:", error);
    return { success: false, error, count: 0 };
  }
}

/**
 * Create a resource notification for a single user
 */
export async function createResourceNotification(notification: ResourceNotificationData) {
  try {
    const { error, data } = await supabase
      .from("resource_notifications")
      .insert([{
        ...notification,
        read: notification.read ?? false,
        type: notification.type ?? 'resource'
      }]);
    
    if (error) {
      console.error("[Resource Notification] Failed to create notification:", error, notification);
      return { success: false, error };
    }
    
    console.log("[Resource Notification] Created notification:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Resource Notification] Error creating notification:", error);
    return { success: false, error };
  }
}

/**
 * Create resource notifications for multiple users in a department
 */
export async function createResourceNotificationsForDepartment(
  departmentId: string,
  resourceId: string,
  message: string
) {
  try {
    // Get all users in the department
    const { data: departmentUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .eq("department_id", departmentId);
    
    if (usersError) {
      console.error("[Resource Notification] Failed to fetch department users:", usersError);
      return { success: false, error: usersError, count: 0 };
    }

    if (!departmentUsers || departmentUsers.length === 0) {
      console.log("[Resource Notification] No users found in department:", departmentId);
      return { success: true, count: 0 };
    }

    const notifications = departmentUsers.map(user => ({
      user_id: user.id,
      department_id: departmentId,
      resource_id: resourceId,
      message,
      read: false,
      type: 'resource' as const
    }));

    const { error, data } = await supabase
      .from("resource_notifications")
      .insert(notifications);
    
    if (error) {
      console.error("[Resource Notification] Failed to create notifications:", error);
      return { success: false, error, count: 0 };
    }
    
    console.log("[Resource Notification] Created notifications for", departmentUsers.length, "users");
    return { success: true, data, count: departmentUsers.length };
  } catch (error) {
    console.error("[Resource Notification] Error creating notifications:", error);
    return { success: false, error, count: 0 };
  }
}

/**
 * Get all users for notifications (used for global notifications like events)
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id");
    
    if (error) {
      console.error("[Notification] Failed to fetch all users:", error);
      return { success: false, error, users: [] };
    }
    
    return { success: true, users: data || [] };
  } catch (error) {
    console.error("[Notification] Error fetching all users:", error);
    return { success: false, error, users: [] };
  }
} 