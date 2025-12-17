import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, bulkUpdateLeads, fetchUniqueNiches, fetchUniqueCities } from '../api/leads';
import { fetchCustomFields, createCustomField, deleteCustomField } from '../api/customFields';
import type { Lead, DealStage, CustomField } from '../types';
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

    // --- Data Fetching ---
    const { data: allLeads = [], isLoading: isLeadsLoading, isRefetching, refetch } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    const { data: allNiches = [] } = useQuery({ queryKey: ['niches'], queryFn: fetchUniqueNiches });
    const { data: allCities = [] } = useQuery({ queryKey: ['cities'], queryFn: fetchUniqueCities });
    const { data: customFields = [] } = useQuery({ queryKey: ['customFields'], queryFn: fetchCustomFields });

    // --- State ---
    const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
    const [sortConfig, setSortConfig] = useState<{ field: keyof Lead; order: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Filters
    const [activeStageFilter, setActiveStageFilter] = useState<DealStage | 'All'>('All');

    // Multi-select Filters (Arrays)
    const [activeNicheFilters, setActiveNicheFilters] = useState<string[]>(
        searchParams.get('niche') ? [searchParams.get('niche')!] : []
    );
    const [activeCityFilters, setActiveCityFilters] = useState<string[]>(
        searchParams.get('city') ? [searchParams.get('city')!] : []
    );

    // --- Sync State with URL ---
    useEffect(() => {
        const nicheParam = searchParams.get('niche');
        const cityParam = searchParams.get('city');

        setActiveNicheFilters(nicheParam ? [nicheParam] : []);
        setActiveCityFilters(cityParam ? [cityParam] : []);
    }, [searchParams]);

    // --- Local Pending Updates ---
    const [pendingUpdates, setPendingUpdates] = useLocalStorage<Record<string, Partial<Lead>>>('leads_pending_updates', {});
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

    const updateLocal = (id: string, field: keyof Lead | string, value: any) => {
        // Handle custom fields
        if (customFields.some(cf => cf.key === field)) {
            setPendingUpdates((prev: Record<string, Partial<Lead>>) => {
                const existing = prev[id] || {};
                // We'll store it in custom_data object in pendingUpdates.
                return {
                    ...prev,
                    [id]: {
                        ...existing,
                        custom_data: { ...(existing.custom_data || {}), [field as string]: value }
                    }
                };
            });
            setSaveStatus('unsaved');
            return;
        }

        setPendingUpdates((prev: Record<string, Partial<Lead>>) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
        setSaveStatus('unsaved');
    };

    // Auto-Save Effect
    useEffect(() => {
        if (!hasPendingChanges) return;
        if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

        setSaveStatus('unsaved');
        autoSaveTimeout.current = setTimeout(() => {
            setSaveStatus('saving');
            saveMutation.mutate(pendingUpdates);
        }, 2000); // 2s debounce

        return () => {
            if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
        };
    }, [pendingUpdates, hasPendingChanges]);

    // --- Mutations ---
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

    // Create Custom Field Mutation
    const createFieldMutation = useMutation({
        mutationFn: async ({ name, type }: { name: string, type: CustomField['type'] }) => {
            return createCustomField(name, type);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customFields'] });
        }
    });

    const deleteFieldMutation = useMutation({
        mutationFn: async ({ id, key }: { id: string, key: string }) => {
            return deleteCustomField(id, key);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customFields'] });
        }
    });

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

    // --- Filtering & Sorting Logic ---
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [localSearch, activeStageFilter, activeNicheFilters, activeCityFilters]);

    const filteredLeads = useMemo(() => {
        let result = [...(allLeads || [])];

        // 1. Optimistic Updates
        if (hasPendingChanges) {
            result = result.map(l => {
                const u = pendingUpdates[l.id];
                if (!u) return l;
                // Merge custom data specifically
                const mergedCustom = { ...l.custom_data, ...u.custom_data };
                return { ...l, ...u, custom_data: mergedCustom };
            });
        }

        // 2. Filters
        if (activeNicheFilters.length > 0) {
            result = result.filter(l => l.niche && activeNicheFilters.includes(l.niche));
        }

        if (activeCityFilters.length > 0) {
            result = result.filter(l => l.city && activeCityFilters.includes(l.city));
        }

        if (activeStageFilter !== 'All') {
            result = result.filter(l => l.deal_stage === activeStageFilter);
        }

        // Search
        if (localSearch) {
            const q = localSearch.toLowerCase();
            result = result.filter(l =>
                l.business_name.toLowerCase().includes(q) ||
                l.city.toLowerCase().includes(q) ||
                (l.email && l.email.toLowerCase().includes(q)) ||
                l.niche.toLowerCase().includes(q) ||
                (l.website && l.website.toLowerCase().includes(q)) ||
                (l.phone && l.phone.toLowerCase().includes(q))
            );
        }

        // 3. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.field];
                const bVal = b[sortConfig.field];

                if (aVal === bVal) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                const comparison = aVal < bVal ? -1 : 1;
                return sortConfig.order === 'asc' ? comparison : -comparison;
            });
        } else {
            // Default sort: Created DESC
            result.sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
        }

        return result;
    }, [allLeads, pendingUpdates, hasPendingChanges, activeNicheFilters, activeCityFilters, activeStageFilter, localSearch, sortConfig]);

    // Pagination View
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLeads.slice(start, start + itemsPerPage);
    }, [filteredLeads, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

    // --- Columns ---
    const allColumns: { id: string; label: string }[] = useMemo(() => {
        const base = [
            { id: 'sn', label: '#' },
            { id: 'business_name', label: 'Business Name' },
            { id: 'email', label: 'Email' },
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
        ];
        // Merge custom fields
        const custom = customFields.map(cf => ({ id: cf.key, label: cf.name }));
        return [...base, ...custom];
    }, [customFields]);

    const [visibleColumnsList, setVisibleColumnsList] = useLocalStorage<string[]>('leads_visible_columns_v2',
        allColumns.map(c => c.id)
    );

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

    const getHeaderTitle = () => {
        if (activeNicheFilters.length > 0) {
            return `${activeNicheFilters.join(', ')} Leads`;
        }
        if (activeCityFilters.length > 0) {
            return `${activeCityFilters.join(', ')} Leads`;
        }
        return 'All Leads';
    };

    if (isLeadsLoading) return <div className="p-4 text-center text-gray-500">Loading leads...</div>;

    return (
        <div className="main-layout-container">
            <LeadsHeader
                title={getHeaderTitle()}
                count={filteredLeads.length}
                isSyncing={isRefetching}
                saveStatus={saveStatus}
                onSync={() => refetch()}
                onImport={() => setIsImportOpen(true)}
                hasPendingChanges={hasPendingChanges}
                onSave={() => saveMutation.mutate(pendingUpdates)}
            />

            <main className="content-wrapper">
                <div className="leads-card">
                    <LeadsToolbar
                        searchValue={localSearch}
                        onSearchChange={setLocalSearch}
                        activeStage={activeStageFilter}
                        onStageChange={setActiveStageFilter}

                        activeNiches={activeNicheFilters}
                        onNichesChange={setActiveNicheFilters}
                        availableNiches={allNiches}

                        activeCities={activeCityFilters}
                        onCitiesChange={setActiveCityFilters}
                        availableCities={allCities}

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

                    <LeadsTable
                        leads={paginatedLeads}
                        customFields={customFields}
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

                    <LeadsPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredLeads.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </main>

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
                    onCreateField={(name: string, type: CustomField['type']) => createFieldMutation.mutate({ name, type })}
                    onDeleteField={(id: string, key: string) => deleteFieldMutation.mutate({ id, key })}
                    customFields={customFields}
                />
            )}
        </div>
    );
}
