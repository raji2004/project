/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)
      - `type` (text) - e.g., 'resource', 'warning', 'restriction', 'event', 'role_change'

  2. Security
    - Enable RLS on notifications table
    - Add policies for users to:
      - Read their own notifications
      - Update their own notifications (for marking as read)
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  type text DEFAULT 'resource' CHECK (type IN ('resource', 'warning', 'restriction', 'event', 'role_change'))
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow any authenticated user to create notifications (for now)
CREATE POLICY "Allow creating notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true); 