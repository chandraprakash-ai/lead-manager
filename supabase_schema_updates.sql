-- 1. Add 'email' column to 'leads' table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Add 'custom_data' column to 'leads' table for storing dynamic field values
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS custom_data jsonb DEFAULT '{}'::jsonb;

-- 3. Create 'custom_fields' table to store definitions
CREATE TABLE IF NOT EXISTS custom_fields (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    key text NOT NULL UNIQUE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'url'))
);

-- 4. Enable RLS on custom_fields (optional, good practice)
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for custom_fields (allowing public access for this app context)
-- Allow read for everyone
CREATE POLICY "Allow public read custom_fields" ON custom_fields
    FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated or anon (depending on app security model)
-- Assuming this is an internal tool usage where anon/service_role might be used or public modification allowed for now.
CREATE POLICY "Allow public insert custom_fields" ON custom_fields
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update custom_fields" ON custom_fields
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete custom_fields" ON custom_fields
    FOR DELETE USING (true);
