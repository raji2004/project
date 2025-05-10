/*
  # Simplified Storage Policies for Avatars
  
  This migration creates a simpler policy that allows any authenticated user
  to upload to the avatars bucket.
*/

-- Ensure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Remove existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow viewing avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner to update and delete avatars" ON storage.objects;

-- Simple policy: Allow any authenticated user to upload to avatars bucket
CREATE POLICY "Allow uploads to avatars bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow everyone to view avatars (since bucket is public)
CREATE POLICY "Allow viewing avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Allow owners to update and delete
CREATE POLICY "Allow owner to update and delete avatars"
ON storage.objects
FOR ALL 
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner::uuid)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner::uuid); 