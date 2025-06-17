# Fix for Notification System Error

## The Problem
You encountered this error:
```
[Notification] Failed to create notifications for users: 
Object
code: "PGRST204"
message: "Could not find the 'type' column of 'notifications' in the schema cache"
```

This means the `type` column doesn't exist in your `notifications` table in the database.

## The Solution

### Step 1: Fix the Database (Choose one option)

#### Option A: Run SQL in Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix_notifications_table.sql`
4. Click "Run" to execute the SQL

#### Option B: Apply Migration via CLI
If you have Supabase CLI linked to your project:
```bash
npx supabase db push
```

### Step 2: Re-enable Type Field (After Database Fix)

Once you've fixed the database, you need to re-enable the `type` field in the code:

#### 1. Update `src/utils/notifications.ts`
Replace the commented lines with the actual code:

```typescript
// In createNotification function, replace:
user_id: notification.user_id,
message: notification.message,
read: notification.read ?? false,
// Temporarily remove type field until migration is applied
// type: notification.type ?? 'resource'

// With:
...notification,
read: notification.read ?? false,
type: notification.type ?? 'resource'
```

```typescript
// In createNotificationsForUsers function, replace:
const notifications = userIds.map(userId => ({
  user_id: userId,
  message,
  read: false,
  // Temporarily remove type field until migration is applied
  // type
}));

// With:
const notifications = userIds.map(userId => ({
  user_id: userId,
  message,
  read: false,
  type
}));
```

#### 2. Update function signature:
```typescript
export async function createNotificationsForUsers(
  userIds: string[],
  message: string,
  type: NotificationData['type'] = 'resource'
) {
```

#### 3. Update calls in `src/pages/admin/stores/eventsAdminStore.ts`:
```typescript
const result = await createNotificationsForUsers(
  users.map(u => u.id),
  message,
  'event'  // Add this back
);
```

#### 4. Update calls in `src/components/NotificationTest.tsx`:
```typescript
const testResult = await createNotificationsForUsers(
  users.map(u => u.id),
  `[TEST] ${message}`,
  notificationType  // Add this back
);
```

## Verification

After applying the fix:

1. **Test the notification system** using the admin test component
2. **Check the database** to ensure the `type` column exists:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'notifications';
   ```

## Why This Happened

The notification system was designed to use a `type` column that wasn't present in your database. This can happen when:
- Database migrations weren't applied
- The database schema is out of sync with the code
- The Supabase project isn't properly linked

## Current Status

✅ **Temporarily Fixed**: The notification system will work without the `type` field
🔄 **Next Step**: Apply the database fix to enable full functionality with notification types

The notification system is currently working with basic functionality. Once you apply the database fix, you'll get the full feature set with different notification types and icons. 