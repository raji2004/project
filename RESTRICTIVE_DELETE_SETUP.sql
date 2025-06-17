-- Restrictive Delete Setup Script
-- Run this in your Supabase SQL Editor to enable restrictive delete functionality

-- Create banned_emails table
CREATE TABLE IF NOT EXISTS banned_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  banned_at timestamptz DEFAULT now(),
  banned_by uuid REFERENCES auth.users(id),
  reason text,
  is_permanent boolean DEFAULT true
);

-- Create deleted_users table for audit trail
CREATE TABLE IF NOT EXISTS deleted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  student_id text,
  department_id uuid,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid REFERENCES auth.users(id),
  reason text,
  is_restrictive boolean DEFAULT false
);

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delete_reason text;

-- Enable RLS on new tables
ALTER TABLE banned_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- Create policies for banned_emails
CREATE POLICY "Admins can manage banned emails"
  ON banned_emails
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for deleted_users
CREATE POLICY "Admins can view deleted users"
  ON deleted_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert deleted users"
  ON deleted_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to check if email is banned during registration
CREATE OR REPLACE FUNCTION check_email_banned()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is in the banned_emails table
  IF EXISTS (
    SELECT 1 FROM banned_emails 
    WHERE email = NEW.email 
    AND is_permanent = true
  ) THEN
    RAISE EXCEPTION 'This email address is banned from registration';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check banned emails on profile creation
DROP TRIGGER IF EXISTS check_email_banned_trigger ON profiles;
CREATE TRIGGER check_email_banned_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_email_banned();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banned_emails_email ON banned_emails(email);
CREATE INDEX IF NOT EXISTS idx_deleted_users_email ON deleted_users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON profiles(is_deleted);

-- Verify setup
SELECT 'Setup completed successfully!' as status; 