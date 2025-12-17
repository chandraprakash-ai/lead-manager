
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomFields() {
    // Check if 'custom_fields' table exists
    const { data, error } = await supabase.from('custom_fields').select('*').limit(1);
    if (error) {
        console.log('custom_fields table error:', error.message);
    } else {
        console.log('custom_fields table exists.');
        if (data.length > 0) {
            console.log('Sample row:', data[0]);
        } else {
            console.log('Table empty. Cannot infer columns easily.');
        }
    }

    // Check 'leads' columns again to see if 'custom_fields' column exists there (for data)
    const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*').limit(1);
    if (!leadsError && leadsData.length > 0) {
        console.log('Leads columns:', Object.keys(leadsData[0]));
    }
}

checkCustomFields();
