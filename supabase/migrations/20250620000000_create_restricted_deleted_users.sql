-- Migration: Create restricted_deleted_users table for banned emails
CREATE TABLE IF NOT EXISTS restricted_deleted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  banned_at timestamptz DEFAULT now(),
  reason text
);

CREATE INDEX IF NOT EXISTS idx_restricted_deleted_users_email ON restricted_deleted_users(email); 