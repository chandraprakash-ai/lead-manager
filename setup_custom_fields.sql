
-- 1. Create the definitions table
CREATE TABLE IF NOT EXISTS custom_fields (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    key text NOT NULL UNIQUE,
    type text NOT NULL, -- 'text', 'number', 'date', 'boolean', etc.
    created_at timestamptz DEFAULT now()
);

-- 2. Add the data column to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_data jsonb DEFAULT '{}';

-- 3. Enable RLS (Optional, mirroring leads)
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for now" ON custom_fields
FOR ALL USING (true) WITH CHECK (true);
