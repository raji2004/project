/*
  # Fix forum RLS policies

  1. Changes
    - Drop existing RLS policies for forum_posts
    - Create new, more permissive policies for authenticated users
    - Ensure proper access control for CRUD operations
  
  2. Security
    - Enable RLS on forum_posts table
    - Add policies for authenticated users to:
      - Read all posts
      - Create posts with their user ID
      - Update their own posts
      - Delete their own posts
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own forum posts" ON forum_posts;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Enable update for users based on author_id"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Enable delete for users based on author_id"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);