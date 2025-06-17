/*
  # Create resource_notifications table for resource upload notifications

  1. New Tables
    - `resource_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `department_id` (uuid, references departments)
      - `resource_id` (uuid, references lecture_resources)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)
      - `type` (text) - e.g., 'resource'

  2. Security
    - Enable RLS on resource_notifications table
    - Add policies for users to:
      - Read their own notifications
      - Update their own notifications (for marking as read)
      - Allow any authenticated user to insert
*/

-- Create resource_notifications table
CREATE TABLE IF NOT EXISTS resource_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES lecture_resources(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  type text DEFAULT 'resource' CHECK (type IN ('resource'))
);

-- Enable RLS
ALTER TABLE resource_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own resource notifications"
  ON resource_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resource notifications"
  ON resource_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow creating resource notifications"
  ON resource_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true); 