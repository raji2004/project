/*
  # Secure Storage Policies for Avatars
  
  This migration replaces the temporary unrestricted policy with a secure one
  that allows users to manage only their own avatars.
*/

-- Remove any existing temporary policies
DROP POLICY IF EXISTS "Unrestricted access to avatars bucket" ON storage.objects;

-- Ensure avatars bucket exists and is public (for URL access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- SECURE POLICIES --

-- Allow users to upload their avatar (owner is auto-set to auth.uid())
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own avatar
CREATE POLICY "Users can view their own avatar"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Since the bucket is public, anyone can view public files
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'avatars'
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  owner = auth.uid()
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  owner = auth.uid()
); 