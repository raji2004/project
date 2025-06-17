# Notification System Documentation

## Overview

The notification system has been completely implemented and enhanced to provide real-time notifications for various admin actions. Students will now receive notifications when:

1. **Resources are uploaded** to their department
2. **Events are created, updated, or deleted**
3. **Admin actions** are taken on their account (warnings, restrictions, role changes)

## Features

### ✅ Real-time Updates
- Uses Supabase real-time subscriptions for instant notifications
- No more polling - notifications appear immediately
- Automatic cleanup of subscriptions when components unmount

### ✅ Multiple Notification Types
- **Resource notifications**: When new resources are uploaded to a department
- **Event notifications**: When events are created, updated, or cancelled
- **Warning notifications**: When admins give warnings to users
- **Restriction notifications**: When user accounts are restricted/unrestricted
- **Role change notifications**: When user roles are changed

### ✅ Enhanced UI
- Notification bell with unread count badge
- Different icons for different notification types
- "Mark as read" functionality for individual notifications
- "Mark all as read" functionality
- Loading states and error handling
- Responsive design for mobile and desktop

### ✅ Admin Testing Tools
- Built-in notification testing component for admins
- Can send test notifications to self or all users
- Supports all notification types for testing

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  type text DEFAULT 'resource' CHECK (type IN ('resource', 'warning', 'restriction', 'event', 'role_change'))
);
```

### Resource Notifications Table
```sql
CREATE TABLE resource_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES lecture_resources(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  type text DEFAULT 'resource' CHECK (type IN ('resource'))
);
```

## How It Works

### 1. Resource Uploads
When an admin uploads a resource:
- File is uploaded to Supabase storage
- Resource record is created in `lecture_resources` table
- All users in the department receive resource notifications
- Notifications are created in `resource_notifications` table

### 2. Event Management
When an admin creates, updates, or deletes an event:
- Event is saved to `events` table
- All users receive event notifications
- Notifications are created in `notifications` table with type 'event'

### 3. User Management
When an admin takes action on a user:
- **Warnings**: Creates notification with type 'warning'
- **Restrictions**: Creates notification with type 'restriction'
- **Role changes**: Creates notification with type 'role_change'
- Notifications are created in `notifications` table

### 4. Real-time Updates
- NotificationBell component subscribes to both notification tables
- Changes are received instantly via Supabase real-time
- UI updates automatically without page refresh

## Files Modified/Created

### New Files
- `src/utils/notifications.ts` - Centralized notification utilities
- `src/components/NotificationTest.tsx` - Admin testing component
- `supabase/migrations/20250215000000_update_notifications_types.sql` - Database migration

### Modified Files
- `src/components/NotificationBell.tsx` - Enhanced with real-time updates
- `src/stores/resourcesStore.ts` - Added notification creation
- `src/pages/admin/stores/eventsAdminStore.ts` - Added notification creation
- `src/pages/admin/stores/usersAdminStore.ts` - Added notification creation
- `src/pages/admin/AdminLayout.tsx` - Added testing component
- `supabase/migrations/20240321000000_add_notifications_table.sql` - Updated types

## Testing the System

### For Admins
1. Log in as an admin
2. Go to any admin page
3. You'll see a "Notification System Test" section at the top
4. Choose notification type and message
5. Click "Send to Self" or "Send to All Users"
6. Check the notification bell to see the notification

### For Students
1. Log in as a student
2. Look for the notification bell in the navbar
3. Click it to see notifications
4. Test by having an admin upload a resource to your department
5. Test by having an admin create an event
6. Test by having an admin give you a warning

## Troubleshooting

### Notifications not appearing?
1. Check browser console for errors
2. Verify Supabase real-time is enabled
3. Check database permissions
4. Ensure user has correct department_id

### Real-time not working?
1. Check Supabase project settings
2. Verify real-time is enabled for notification tables
3. Check network connectivity
4. Look for subscription errors in console

### Database errors?
1. Run the latest migrations
2. Check table permissions
3. Verify foreign key relationships
4. Check RLS policies

## Future Enhancements

- Email notifications
- Push notifications
- Notification preferences
- Notification categories
- Bulk notification actions
- Notification history
- Custom notification templates 