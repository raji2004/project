# Restrictive Delete Feature

## Overview

The restrictive delete feature allows administrators to delete user accounts with an option to permanently ban the user's email address from re-registration. This provides a powerful tool for managing problematic users while maintaining an audit trail.

## Features

### 1. Two Types of Account Deletion

- **Normal Delete**: Removes the user account but allows the email to be used for future registration
- **Restrictive Delete**: Removes the user account AND permanently bans the email address from re-registration

### 2. Comprehensive Audit Trail

- All deleted users are stored in a `deleted_users` table with full details
- Banned emails are tracked in a `banned_emails` table
- Deletion reasons and admin actions are logged

### 3. Admin Interface

The admin panel now includes three tabs:

#### Active Users Tab
- View all active users
- Perform actions: make admin, restrict, warn, delete
- Delete options include radio buttons for normal vs restrictive delete
- Real-time user analytics

#### Deleted Users Tab
- View all deleted users with deletion details
- See deletion type (normal vs restrictive)
- Restore users (removes from deleted list and unbans email if restrictive)
- Search and filter deleted users

#### Banned Emails Tab
- View all banned email addresses
- See ban reasons and dates
- Unban emails (removes from banned list)
- Search and filter banned emails

## Database Schema

### New Tables

#### `banned_emails`
```sql
- id: uuid (primary key)
- email: text (unique, not null)
- banned_at: timestamptz (default: now())
- banned_by: uuid (references auth.users)
- reason: text
- is_permanent: boolean (default: true)
```

#### `deleted_users`
```sql
- id: uuid (primary key)
- user_id: uuid (not null)
- email: text (not null)
- full_name: text
- student_id: text
- department_id: uuid
- deleted_at: timestamptz (default: now())
- deleted_by: uuid (references auth.users)
- reason: text
- is_restrictive: boolean (default: false)
```

### Modified Tables

#### `profiles` (new columns)
```sql
- is_deleted: boolean (default: false)
- deleted_at: timestamptz
- deleted_by: uuid (references auth.users)
- delete_reason: text
```

## Security Features

### Row Level Security (RLS)
- All new tables have RLS enabled
- Only admins can access banned_emails and deleted_users tables
- Policies ensure proper access control

### Email Ban Prevention
- Database trigger prevents banned emails from registering
- Automatic check during profile creation
- Clear error message for banned email attempts

## Setup Instructions

### 1. Database Setup
Run the SQL script `RESTRICTIVE_DELETE_SETUP.sql` in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `RESTRICTIVE_DELETE_SETUP.sql`
4. Execute the script

### 2. Application Setup
The feature is already integrated into your application. No additional setup required.

## Usage Guide

### Deleting a User

1. Navigate to Admin Panel → Users
2. Find the user you want to delete
3. Click the trash icon (🗑️)
4. Choose delete type:
   - **Normal Delete**: User can re-register with same email
   - **Restrictive Delete**: Email is permanently banned
5. Enter a reason for deletion
6. Click "Delete"

### Restoring a User

1. Go to the "Deleted Users" tab
2. Find the user you want to restore
3. Click the restore icon (🔄)
4. The user will be restored and removed from deleted users list
5. If it was a restrictive delete, the email will also be unbanned

### Managing Banned Emails

1. Go to the "Banned Emails" tab
2. View all banned email addresses
3. To unban an email, click the X icon
4. The email will be removed from the banned list

## API Functions

### Store Functions (useUsersAdminStore)

```typescript
// Delete a user
deleteUser(userId: string, isRestrictive: boolean, reason: string)

// Restore a user
restoreUser(userId: string)

// Unban an email
unbanEmail(emailId: string)

// Fetch deleted users
fetchDeletedUsers()

// Fetch banned emails
fetchBannedEmails()
```

## Notifications

When a user is deleted:
- A notification is sent to the user explaining the deletion
- For restrictive deletes, the notification mentions email ban
- Notifications include the deletion reason

## Error Handling

- Comprehensive error handling for all operations
- User-friendly error messages
- Loading states for all actions
- Validation for required fields

## Best Practices

1. **Always provide a reason** for deletion to maintain audit trail
2. **Use restrictive delete sparingly** - only for serious violations
3. **Review deleted users regularly** to ensure proper management
4. **Document deletion reasons** clearly for future reference
5. **Consider temporary bans** for less serious violations

## Troubleshooting

### Common Issues

1. **"Email already banned" error during registration**
   - Check the banned emails tab
   - Unban the email if appropriate

2. **User not appearing in deleted users**
   - Ensure the database migration was applied
   - Check for any error messages in the console

3. **Cannot restore user**
   - Verify you have admin permissions
   - Check if the user still exists in the profiles table

### Database Verification

Run these queries to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('banned_emails', 'deleted_users');

-- Check if profiles columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_deleted', 'deleted_at', 'deleted_by', 'delete_reason');

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'check_email_banned_trigger';
```

## Future Enhancements

Potential improvements for the future:
- Temporary bans with expiration dates
- Bulk operations for multiple users
- Advanced filtering and search
- Email notification system
- Integration with external moderation tools 