/*
  # Simplified Secure Storage Policies for Avatars
  
  This policy allows users to manage avatars with simpler path format.
*/

-- Remove any existing policies
DROP POLICY IF EXISTS "Unrestricted access to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Ensure avatars bucket exists and is public (for URL access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- SIMPLER SECURE POLICIES --

-- Policy for uploads - filename starts with user ID
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  STARTS_WITH(name, auth.uid()::text)
);

-- Policy for viewing - all authenticated users can view avatars
CREATE POLICY "Users can view all avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Policy for public viewing - everyone can view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'avatars');

-- Policy for updates - only user can update own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  owner = auth.uid()
);

-- Policy for deletes - only user can delete own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  owner = auth.uid()
); 