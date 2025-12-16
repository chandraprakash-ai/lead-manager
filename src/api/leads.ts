import { supabase } from '../lib/supabaseClient';
import type { Lead, LeadFilter } from '../types';

export const fetchLeads = async (filter?: LeadFilter) => {
    // Primary read strategy: Fetch virtually everything (limit to reasonable recent set if needed)
    // Client-side will handle sorting and filtering.
    let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    // Optional: Server-side narrow can still exist for huge datasets/archived data
    // but default usage is filter-free.
    if (filter?.niche) {
        query = query.eq('niche', filter.niche);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching leads:', error);
        throw error;
    }

    return (data || []) as Lead[];
};

export const updateLead = async (id: string, updates: Partial<Lead>) => {
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Lead;
};

export const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
}

export const bulkInsertLeads = async (leads: Omit<Lead, 'id' | 'created_at'>[]) => {
    const { data, error } = await supabase.from('leads').insert(leads).select();
    if (error) throw error;
    return data;
}

export const bulkUpdateLeads = async (updates: { id: string; changes: Partial<Lead> }[]) => {
    // In a perfect world, we'd use a Postgres Function (RPC) for atomic bulk updates.
    // For now, we'll process them in parallel. Supabase handles concurrency well.
    const promises = updates.map(({ id, changes }) =>
        supabase.from('leads').update(changes).eq('id', id)
    );

    const results = await Promise.all(promises);
    const error = results.find(r => r.error);
    if (error) throw error.error;

    return results.map(r => r.data);
};
