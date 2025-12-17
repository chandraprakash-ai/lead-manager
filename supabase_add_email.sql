-- Run this in your Supabase SQL Editor to add the missing 'email' column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email text;

-- Optional: Add contact_name if desired
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_name text;
