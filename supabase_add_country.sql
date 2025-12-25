-- Run this in your Supabase SQL Editor to add the missing 'country' column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS country text;
