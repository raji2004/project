-- Migration: Fix user registration issues
-- This allows deleted users to re-register while preventing banned users

-- First, let's create a function to handle user registration properly
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

-- Drop the old trigger
DROP TRIGGER IF EXISTS check_email_banned_trigger ON profiles;

-- Create the new trigger
CREATE TRIGGER handle_user_registration_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_registration(); 