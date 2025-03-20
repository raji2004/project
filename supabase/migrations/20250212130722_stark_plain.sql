/*
  # Update lecture resources RLS policy

  1. Changes
    - Drop existing RLS policy for lecture resources
    - Add new policy to only allow users to view resources from their department
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can read lecture resources" ON lecture_resources;

-- Create new policy that only allows users to view resources from their department
CREATE POLICY "Users can only view their department resources"
  ON lecture_resources
  FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT department_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );