
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

async function testUpdate() {
    console.log('Attempting to update a lead with new fields...');

    // 1. Get a lead
    const { data: leads, error: fetchError } = await supabase.from('leads').select('id').limit(1);
    if (fetchError || !leads || leads.length === 0) {
        console.error("Could not fetch a lead to test:", fetchError);
        return;
    }

    const leadId = leads[0].id;
    console.log(`Testing update on lead: ${leadId}`);

    // 2. Try update
    const { data, error } = await supabase.from('leads').update({
        country: 'Test Country',
        map: 'https://test.map',
        email: 'test@example.com'
    }).eq('id', leadId).select();

    if (error) {
        console.error('Error updating lead:', error);
    } else {
        console.log('Success! Updated lead:', data);
    }
}

testUpdate();
