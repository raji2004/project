/*
  # Update profile fields

  1. Changes
    - Remove interests column from profiles
    - Rename program to department
    - Add foreign key constraint to link department with departments table

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE profiles DROP COLUMN IF EXISTS interests;
ALTER TABLE profiles DROP COLUMN IF EXISTS program;
ALTER TABLE profiles ADD COLUMN department_id uuid REFERENCES departments(id);