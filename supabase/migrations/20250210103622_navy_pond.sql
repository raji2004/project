/*
  # Add insert policy for profiles table

  1. Changes
    - Add RLS policy to allow inserting new profiles during registration
    - Policy ensures users can only insert their own profile

  2. Security
    - New policy allows authenticated users to insert their own profile
    - Checks that the inserted ID matches the authenticated user's ID
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);