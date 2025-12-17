
import { supabase } from '../lib/supabaseClient';
import type { CustomField } from '../types';

export const fetchCustomFields = async () => {
    const { data, error } = await supabase.from('custom_fields').select('*').order('created_at', { ascending: true });
    if (error) {
        // If table doesn't exist, return empty to avoid crash, but log it
        console.warn('Error fetching custom fields (table might be missing):', error.message);
        return [];
    }
    return data as CustomField[];
};

export const createCustomField = async (name: string, type: CustomField['type']) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const { data, error } = await supabase.from('custom_fields').insert({
        name,
        key,
        type
    }).select().single();

    if (error) throw error;
    return data as CustomField;
};

export const deleteCustomField = async (id: string, _key?: string) => {
    // 1. Delete definition
    const { error } = await supabase.from('custom_fields').delete().eq('id', id);
    if (error) throw error;

    // 2. Optional: Cleanup definition from leads? 
    // Usually we keep the data or we can nullify it. 
    // Postgres JSONB doesn't strictly enforce schema, so "deleting" column means we just stop showing it.
    // To strictly delete data: 
    // await supabase.rpc('delete_custom_key', { key_to_remove: key }); 
    // But we won't implement RPC now.
};
