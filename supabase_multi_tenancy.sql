-- ==========================================
-- MULTI-TENANCY MIGRATION
-- ==========================================
-- This script adds user_id columns and updates RLS policies
-- to ensure each user only sees their own data.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ==========================================

-- STEP 1: Add user_id to leads table
-- ==========================================
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- Backfill existing leads with the first authenticated user (if any)
-- IMPORTANT: Run this only once during migration
-- UPDATE leads SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL for future inserts (run after backfill)
-- ALTER TABLE leads ALTER COLUMN user_id SET NOT NULL;

-- STEP 2: Add user_id to custom_fields table
-- ==========================================
ALTER TABLE custom_fields 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- Backfill existing custom_fields
-- UPDATE custom_fields SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL for future inserts (run after backfill)
-- ALTER TABLE custom_fields ALTER COLUMN user_id SET NOT NULL;

-- STEP 3: Create indexes for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON custom_fields(user_id);

-- ==========================================
-- STEP 4: Update RLS Policies for LEADS
-- ==========================================

-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read leads" ON leads;
DROP POLICY IF EXISTS "Allow public insert leads" ON leads;
DROP POLICY IF EXISTS "Allow public update leads" ON leads;
DROP POLICY IF EXISTS "Allow public delete leads" ON leads;
DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leads;
DROP POLICY IF EXISTS "Enable update for users based on email" ON leads;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON leads;

-- Enable RLS if not already
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- New secure policies: Users can only access their own leads
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON leads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ==========================================
-- STEP 5: Update RLS Policies for CUSTOM_FIELDS
-- ==========================================

-- Drop existing open policies
DROP POLICY IF EXISTS "Allow public read custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public insert custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public update custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Allow public delete custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Authenticated read custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Authenticated insert custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Authenticated update custom_fields" ON custom_fields;
DROP POLICY IF EXISTS "Authenticated delete custom_fields" ON custom_fields;

-- Enable RLS if not already
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- New secure policies: Users can only access their own custom fields
CREATE POLICY "Users can view own custom_fields" ON custom_fields
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom_fields" ON custom_fields
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom_fields" ON custom_fields
    FOR UPDATE TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom_fields" ON custom_fields
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ==========================================
-- VERIFICATION QUERIES (Run after migration)
-- ==========================================
-- Check that user_id columns exist:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'custom_fields' AND column_name = 'user_id';

-- Check RLS policies:
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('leads', 'custom_fields');
