import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, bulkUpdateLeads } from '../api/leads';
import type { Lead, NicheCategory, DealStage } from '../types';
import ImportModal from '../components/ImportModal';
import { supabase } from '../lib/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LeadsToolbar } from '../components/leads/LeadsToolbar';
import { LeadsHeader } from '../components/leads/LeadsHeader';
import { ColumnManager } from '../components/leads/ColumnManager';
import { LeadsPagination } from '../components/leads/LeadsPagination';
import { LeadsTable } from '../components/leads/LeadsTable/LeadsTable';
import './LeadsPage.css';

export default function LeadsPage() {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [localSearch, setLocalSearch] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // --- Write Strategy: Local Draft State + Auto-Save ---
    const [pendingUpdates, setPendingUpdates] = useLocalStorage<Record<string, Partial<Lead>>>('leads_pending_updates', {});
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Helper to track local changes
    const updateLocal = (id: string, field: keyof Lead, value: any) => {
        setPendingUpdates((prev: Record<string, Partial<Lead>>) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
        setSaveStatus('unsaved');
    };

    const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

    // Auto-Save Effect
    useEffect(() => {
        if (!hasPendingChanges) return;

        if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

        setSaveStatus('unsaved');
        autoSaveTimeout.current = setTimeout(() => {
            setSaveStatus('saving');
            saveMutation.mutate(pendingUpdates);
        }, 2000); // 2 seconds debounce

        return () => {
            if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
        };
    }, [pendingUpdates, hasPendingChanges]);

    // --- Read Strategy: Load Once ---
    const { data: allLeads = [], isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(), // Fetches all (or sensible default limit)
        staleTime: Infinity, // Never stale automatically. User must explicit refresh.
        refetchOnWindowFocus: false,
    });

    // --- Bulk Mutations ---
    const saveMutation = useMutation({
        mutationFn: async (updates: Record<string, Partial<Lead>>) => {
            const batch = Object.entries(updates).map(([id, changes]) => ({ id, changes }));
            return bulkUpdateLeads(batch);
        },
        onSuccess: () => {
            setPendingUpdates({});
            setSaveStatus('saved');
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
    });

    // const deleteMutation = useMutation({
    //     mutationFn: deleteLead,
    //     onMutate: async (id) => {
    //         await queryClient.cancelQueries({ queryKey: ['leads'] });
    //         const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
    //         queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => old ? old.filter(l => l.id !== id) : []);
    //         return { previousLeads };
    //     },
    //     onError: (err, id, context) => {
    //         queryClient.setQueryData(['leads'], context?.previousLeads);
    //         alert('Failed to delete lead');
    //     },
    //     onSettled: () => {
    //         queryClient.invalidateQueries({ queryKey: ['leads'] });
    //     }
    // });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const { error } = await supabase.from('leads').delete().in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            setSelectedIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
    });

    // --- Client-Side Filtering & Sorting ---
    const [sortConfig, setSortConfig] = useState<{ field: keyof Lead; order: 'asc' | 'desc' } | null>(null);

    // Filters
    const [activeStageFilter, setActiveStageFilter] = useState<DealStage | 'All'>('All');
    const [activeNicheFilter, setActiveNicheFilter] = useState<NicheCategory | 'All'>((searchParams.get('niche') as NicheCategory) || 'All');
    const [activeCityFilter, setActiveCityFilter] = useState<string | 'All'>((searchParams.get('city') as string) || 'All');

    // Sync state with URL params when they change (e.g. Sidebar navigation)
    useEffect(() => {
        const nicheParam = searchParams.get('niche');
        const cityParam = searchParams.get('city');

        setActiveNicheFilter(nicheParam ? (nicheParam as NicheCategory) : 'All');
        setActiveCityFilter(cityParam ? cityParam : 'All');
    }, [searchParams]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [localSearch, activeStageFilter, activeNicheFilter, activeCityFilter]);

    const filteredLeads = useMemo(() => {
        let result = [...(allLeads || [])];

        // 1. Apply Drafts over Server Data (Optimistic View)
        if (hasPendingChanges) {
            result = result.map(l => pendingUpdates[l.id] ? { ...l, ...pendingUpdates[l.id] } : l);
        }

        // 2. Filters
        if (activeNicheFilter !== 'All') {
            result = result.filter(l => l.niche === activeNicheFilter);
        }

        if (activeCityFilter !== 'All') {
            result = result.filter(l => l.city === activeCityFilter);
        }

        if (activeStageFilter !== 'All') {
            result = result.filter(l => l.deal_stage === activeStageFilter);
        }

        if (localSearch) {
            const q = localSearch.toLowerCase();
            result = result.filter(l => l.business_name?.toLowerCase().includes(q) || l.city?.toLowerCase().includes(q));
        }

        // 3. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.field];
                const bVal = b[sortConfig.field];
                if (aVal === bVal) return 0;

                // Handle nulls
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                const comparison = aVal < bVal ? -1 : 1;
                return sortConfig.order === 'asc' ? comparison : -comparison;
            });
        } else {
            // Default sort: Created DESC
            result.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
        }

        return result;
    }, [allLeads, pendingUpdates, activeNicheFilter, activeStageFilter, localSearch, sortConfig]);

    // Pagination Logic
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLeads.slice(start, start + itemsPerPage);
    }, [filteredLeads, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

    // --- Column & Sort Configuration ---
    const allColumns: { id: string; label: string }[] = useMemo(() => [
        { id: 'sn', label: '#' },
        { id: 'business_name', label: 'Business Name' },
        { id: 'priority', label: 'Priority' },
        { id: 'deal_stage', label: 'Deal Status' },
        { id: 'contacted', label: 'Contacted' },
        { id: 'website_status', label: 'Web Status' },
        { id: 'social', label: 'Social' },
        { id: 'website', label: 'Website' },
        { id: 'phone', label: 'Phone' },
        { id: 'rating', label: 'Rating' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'city', label: 'City' },
        { id: 'niche', label: 'Niche' },
        { id: 'notes', label: 'Notes' },
    ], []);

    const [visibleColumnsList, setVisibleColumnsList] = useLocalStorage<string[]>('leads_visible_columns_v2',
        allColumns.map(c => c.id)
    );

    // Safety check: ensure it is an array before creating Set
    const visibleColumns = useMemo(() => {
        if (Array.isArray(visibleColumnsList)) return new Set(visibleColumnsList);
        return new Set(allColumns.map(c => c.id));
    }, [visibleColumnsList, allColumns]);

    const toggleColumn = (id: string) => {
        const next = new Set(visibleColumns);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setVisibleColumnsList(Array.from(next));
    };


    const handleSort = (field: keyof Lead) => {
        setSortConfig(current => {
            if (current?.field === field) return { field, order: current.order === 'asc' ? 'desc' : 'asc' };
            return { field, order: 'desc' };
        });
    };


    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading leads...</div>;

    // ... (Hooks and State remain)

    return (
        <div className="main-layout-container">
            <LeadsHeader
                title={
                    activeNicheFilter !== 'All' ? `${activeNicheFilter} Leads` :
                        activeCityFilter !== 'All' ? `${activeCityFilter} Leads` :
                            'All Leads'
                }
                count={filteredLeads.length}
                isSyncing={isRefetching}
                saveStatus={saveStatus}
                onSync={() => refetch()}
                onImport={() => setIsImportOpen(true)}
            />

            <main className="content-wrapper">
                <div className="leads-card">
                    <LeadsToolbar
                        searchValue={localSearch}
                        onSearchChange={setLocalSearch}
                        activeStage={activeStageFilter}
                        onStageChange={setActiveStageFilter}
                        activeNiche={activeNicheFilter}
                        onNicheChange={setActiveNicheFilter}
                        selectedCount={selectedIds.size}
                        onDeleteSelected={() => {
                            if (confirm(`Delete ${selectedIds.size} leads ? `)) bulkDeleteMutation.mutate(Array.from(selectedIds));
                        }}
                        currentSort={sortConfig}
                        onSortChange={(field) => {
                            if (field === null) setSortConfig(null);
                            else handleSort(field);
                        }}
                    />

                    {/* Leads Table Module */}
                    <LeadsTable
                        leads={paginatedLeads}
                        visibleColumns={visibleColumns}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onUpdateLead={updateLocal}
                        pendingUpdates={pendingUpdates}
                        sortConfig={sortConfig}
                        onSortChange={(field) => {
                            if (field === null) setSortConfig(null);
                            else handleSort(field);
                        }}
                        onOpenColumnManager={() => setShowColumnSelector(true)}
                    />

                    {/* Pagination */}
                    <LeadsPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredLeads.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div >
            </main >

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['leads'] });
                    setIsImportOpen(false);
                }}
            />
            {showColumnSelector && (
                <ColumnManager
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    onClose={() => setShowColumnSelector(false)}
                />
            )}
        </div >
    );
}
