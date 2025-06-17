/*
  # Add role column to profiles table

  1. Changes
    - Add role column to profiles table
    - Set default role as 'user'
    - Add check constraint for valid roles

  2. Security
    - No changes to RLS policies needed
*/

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing admin users to have admin role
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM admin_users
); 