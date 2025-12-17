
import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';

// Load env manuanlly since we are running with ts-node
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

async function testCreate() {
    console.log('Attempting to create a test custom field...');
    const { data, error } = await supabase.from('custom_fields').insert({
        name: 'Debug Field',
        key: 'debug_field',
        type: 'text'
    }).select();

    if (error) {
        console.error('Error creating field:', error);
    } else {
        console.log('Success:', data);
        // Cleanup
        await supabase.from('custom_fields').delete().eq('key', 'debug_field');
    }
}

testCreate();
