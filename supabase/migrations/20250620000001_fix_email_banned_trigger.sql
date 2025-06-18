-- Migration: Fix email banned trigger function
-- This fixes the trigger that was causing database errors during signup

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS check_email_banned_trigger ON profiles;

-- Create the corrected function to check if email is banned during registration
CREATE OR REPLACE FUNCTION check_email_banned()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the corrected function
CREATE TRIGGER check_email_banned_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_email_banned(); 