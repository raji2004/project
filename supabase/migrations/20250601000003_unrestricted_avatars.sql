/*
  # TEMPORARY TEST POLICY - UNRESTRICTED ACCESS
  
  This migration creates a completely open policy for testing purposes.
  
  WARNING: This offers no security and should be replaced with proper
  policies after testing is complete.
*/

-- Ensure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow viewing avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner to update and delete avatars" ON storage.objects;

-- Totally unrestricted policy for testing
CREATE POLICY "Unrestricted access to avatars bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars'); 