-- Add departments field to events table for department-based targeting
ALTER TABLE events ADD COLUMN IF NOT EXISTS departments text[] DEFAULT ARRAY[]::text[]; 