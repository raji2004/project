/*
  # Storage Policies for Avatars

  1. Creates avatars bucket if it doesn't exist
  2. Adds policies to allow:
    - Authenticated users to upload avatar images
    - Users to view their own avatars
    - Users to update their own avatars
    - Users to delete their own avatars
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = SUBSTRING(name, 1, POSITION('-' IN name) - 1)
);

-- Allow users to view their own avatars
-- (Since bucket is public, this is redundant but good practice)
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = SUBSTRING(name, 1, POSITION('-' IN name) - 1)
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = SUBSTRING(name, 1, POSITION('-' IN name) - 1)
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = SUBSTRING(name, 1, POSITION('-' IN name) - 1)
); 