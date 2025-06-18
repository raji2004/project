# Fix Registration Errors

## Problem
You're experiencing two issues:
1. **Database error during signup**: `500 (Internal Server Error)` with "Database error saving new user"
2. **Deleted users can't re-register**: Users who were normally deleted can't create new accounts

## Root Cause
The issue is caused by a problematic database trigger that:
- Tries to access a non-existent email field in the profiles table
- Prevents all users (including normally deleted ones) from re-registering
- Conflicts with the unique email constraint

## Solution

### Step 1: Apply the Database Fix
Run this SQL script in your Supabase SQL Editor:

```sql
-- Fix registration issues immediately
-- Run this script in your Supabase SQL editor

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS check_email_banned_trigger ON profiles;

-- Create the corrected function to handle user registration properly
CREATE OR REPLACE FUNCTION handle_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  existing_profile_id uuid;
BEGIN
  -- Get the email from auth.users table
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Check if the email is in the restricted_deleted_users table (banned emails only)
  IF EXISTS (
    SELECT 1 FROM restricted_deleted_users 
    WHERE email = user_email
  ) THEN
    RAISE EXCEPTION 'This email address is banned from registration';
  END IF;
  
  -- Check if there's an existing profile for this user (deleted or not)
  SELECT id INTO existing_profile_id
  FROM profiles 
  WHERE email = user_email;
  
  -- If there's an existing profile, update it instead of creating a new one
  IF existing_profile_id IS NOT NULL THEN
    -- Update the existing profile to reactivate it
    UPDATE profiles 
    SET 
      is_deleted = false,
      deleted_at = NULL,
      deleted_by = NULL,
      delete_reason = NULL,
      updated_at = now()
    WHERE id = existing_profile_id;
    
    -- Return NULL to prevent the INSERT
    RETURN NULL;
  END IF;
  
  -- Set the email field in the new profile
  NEW.email = user_email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER handle_user_registration_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_registration();
```

### Step 2: Verify the Fix
After running the SQL script, you should see:
- No more database errors during signup
- Deleted users can re-register successfully
- Banned users (in restricted_deleted_users table) still cannot register

### Step 3: Test the Fix
1. Try registering a new user - should work
2. Try registering a deleted user - should work (reactivates their account)
3. Try registering a banned user - should show "banned from registration" error

## What the Fix Does

### For New Users:
- Creates a new profile normally
- Sets the email field correctly

### For Deleted Users:
- Detects existing profile with same email
- Reactivates the profile by setting `is_deleted = false`
- Clears deletion metadata
- Prevents duplicate profile creation

### For Banned Users:
- Checks `restricted_deleted_users` table
- Throws exception to prevent registration
- Shows clear error message

## Files Modified
- `src/stores/authStore.ts` - Enhanced error handling
- `src/pages/auth/Login.tsx` - Better error display
- `src/pages/auth/Register.tsx` - Better error display
- Database trigger function - Fixed to work correctly

## Migration Files Created
- `supabase/migrations/20250620000001_fix_email_banned_trigger.sql`
- `supabase/migrations/20250620000002_fix_user_registration.sql`

## Notes
- The fix allows normally deleted users to re-register
- Only users in the `restricted_deleted_users` table are permanently banned
- The system now properly distinguishes between deleted and banned users 