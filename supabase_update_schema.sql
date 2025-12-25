-- Run this in your Supabase SQL Editor to fix the saving issue
-- This adds the missing columns that the app is trying to save to

ALTER TABLE leads ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS map text;

-- Create an index for faster filtering if you have many leads (Optional but recommended)
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
