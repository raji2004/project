/*
  # Add lecture resources tables

  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `code` (text, unique) - e.g., "CS", "MATH"
      - `name` (text) - e.g., "Computer Science", "Mathematics"
    
    - `lecture_resources`
      - `id` (uuid, primary key)
      - `department_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `url` (text)
      - `type` (text) - e.g., "pdf", "video", "link"
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lecture_resources table
CREATE TABLE IF NOT EXISTS lecture_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  resource_type text DEFAULT 'resource',
  year int,
  course text,
  semester text
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_resources ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can read departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read lecture resources"
  ON lecture_resources
  FOR SELECT
  TO authenticated
  USING (true);