-- Fix notifications table by adding the missing type column
-- Run this SQL in your Supabase SQL editor

-- Add the type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN type text DEFAULT 'resource';
        
        -- Add the check constraint
        ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('resource', 'warning', 'restriction', 'event', 'role_change'));
        
        RAISE NOTICE 'Added type column to notifications table';
    ELSE
        RAISE NOTICE 'Type column already exists in notifications table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'type'; 