-- SECURITY BEST PRACTICES
-- CAUTION: The 'open' policies below are for development or internal apps without a login system.
-- If you deploy this app publicly, you MUST implement Supabase Auth and switch to the 'SECURE' policies below.

-- ==========================================
-- OPTION 1: OPEN POLICIES (Development / No Login)
-- ==========================================
-- Use these if you haven't implemented a login screen yet.

-- Create table
CREATE TABLE IF NOT EXISTS custom_fields (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    key text NOT NULL UNIQUE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'url'))
);

-- Enable RLS
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Allow public access (INSECURE for production!)
DROP POLICY IF EXISTS "Allow public read custom_fields" ON custom_fields;
CREATE POLICY "Allow public read custom_fields" ON custom_fields FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert custom_fields" ON custom_fields;
CREATE POLICY "Allow public insert custom_fields" ON custom_fields FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update custom_fields" ON custom_fields;
CREATE POLICY "Allow public update custom_fields" ON custom_fields FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete custom_fields" ON custom_fields;
CREATE POLICY "Allow public delete custom_fields" ON custom_fields FOR DELETE USING (true);


-- ==========================================
-- OPTION 2: SECURE POLICIES (Production / With Login)
-- ==========================================
-- Use these ONLY if you have users logging in via supabase.auth.signInWithPassword()

/*
-- First, drop the open policies
DROP POLICY IF EXISTS "Allow public read custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public insert custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public update custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public delete custom_fields" ON custom_fields;

-- READ: Allow anyone to read, OR restrict to authenticated
CREATE POLICY "Authenticated read custom_fields" ON custom_fields
    FOR SELECT TO authenticated USING (true);

-- WRITE (Insert/Update/Delete): Only authenticated users
CREATE POLICY "Authenticated insert custom_fields" ON custom_fields
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update custom_fields" ON custom_fields
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated delete custom_fields" ON custom_fields
    FOR DELETE TO authenticated USING (true);
*/
