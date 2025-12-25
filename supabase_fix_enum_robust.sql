-- Create a function to safely add enum value
-- This is often more reliable in Supabase SQL Editor than direct ALTER TYPE in some contexts
DO $$
BEGIN
    ALTER TYPE deal_status ADD VALUE IF NOT EXISTS 'Contacting';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
