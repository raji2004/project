-- Migration: Add logging to handle_user_registration trigger for debugging

DROP FUNCTION IF EXISTS handle_user_registration();

CREATE OR REPLACE FUNCTION handle_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  existing_profile_id uuid;
BEGIN
  RAISE NOTICE 'Trigger start: NEW.id=%, NEW.email=%', NEW.id, NEW.email;

  -- Get the email from auth.users table
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = NEW.id;
  RAISE NOTICE 'Fetched user_email from auth.users: %', user_email;
  
  -- Check if the email is in the restricted_deleted_users table (banned emails only)
  IF EXISTS (
    SELECT 1 FROM restricted_deleted_users 
    WHERE email = user_email
  ) THEN
    RAISE NOTICE 'Email % is banned from registration', user_email;
    RAISE EXCEPTION 'This email address is banned from registration';
  END IF;
  
  -- Check if there's an existing profile for this user (deleted or not)
  SELECT id INTO existing_profile_id
  FROM profiles 
  WHERE email = user_email;
  RAISE NOTICE 'Existing profile id for email %: %', user_email, existing_profile_id;
  
  -- If there's an existing profile, update it instead of creating a new one
  IF existing_profile_id IS NOT NULL THEN
    RAISE NOTICE 'Updating existing profile % to reactivate', existing_profile_id;
    UPDATE profiles 
    SET 
      is_deleted = false,
      deleted_at = NULL,
      deleted_by = NULL,
      delete_reason = NULL,
      updated_at = now()
    WHERE id = existing_profile_id;
    RAISE NOTICE 'Profile % reactivated, skipping insert', existing_profile_id;
    -- Return NULL to prevent the INSERT
    RETURN NULL;
  END IF;
  
  -- Set the email field in the new profile
  NEW.email = user_email;
  RAISE NOTICE 'Setting NEW.email to % and proceeding with insert', user_email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (if needed)
DROP TRIGGER IF EXISTS handle_user_registration_trigger ON profiles;
CREATE TRIGGER handle_user_registration_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_registration(); 