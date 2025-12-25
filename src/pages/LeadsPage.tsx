import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { useActionHistory } from '../context/ActionHistoryContext';
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
    const [sortConfig, setSortConfig] = useState<{ field: keyof Lead | string; order: 'asc' | 'desc' } | null>({ field: 'score', order: 'desc' });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Filters
    const [activeStageFilters, setActiveStageFilters] = useState<DealStage[]>([]);

    // Multi-select Filters (Arrays)
    const [activeNicheFilters, setActiveNicheFilters] = useState<string[]>(
        searchParams.get('niche') ? [searchParams.get('niche')!] : []
    );
    const [activeCityFilters, setActiveCityFilters] = useState<string[]>(
        searchParams.get('city') ? [searchParams.get('city')!] : []
    );
    const [activeContactedFilter, setActiveContactedFilter] = useState<'all' | 'yes' | 'no'>('all');

    // --- Sync State with URL ---
    useEffect(() => {
        const nicheParam = searchParams.get('niche');
        const cityParam = searchParams.get('city');

        setActiveNicheFilters(nicheParam ? [nicheParam] : []);
        setActiveCityFilters(cityParam ? [cityParam] : []);
    }, [searchParams]);

    // --- Undo/Redo ---
    const { addAction, undo, redo, canUndo, canRedo } = useActionHistory();

    // --- Local Pending Updates ---
    const [pendingUpdates, setPendingUpdates] = useLocalStorage<Record<string, Partial<Lead>>>('leads_pending_updates', {});
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

    const updateLocal = (id: string, field: keyof Lead | string, value: any) => {
        // 1. Capture State for Undo
        const baseLead = allLeads.find(l => l.id === id);
        const existingPending = pendingUpdates[id] || {};

        // Get the current value (either pending or base)
        let prevValue: any;
        if (field === 'priority') {
            prevValue = existingPending.custom_data?.priority ?? baseLead?.custom_data?.priority;
        } else if (customFields.some(cf => cf.key === field)) {
            prevValue = existingPending.custom_data?.[field as string] ?? baseLead?.custom_data?.[field as string];
        } else {
            // @ts-ignore
            prevValue = existingPending[field] ?? baseLead?.[field];
        }

        const actionName = `Update ${field}`;

        addAction({
            name: actionName,
            businessName: baseLead?.business_name,
            category: baseLead?.niche,
            city: baseLead?.city,
            details: `Changed ${field} from "${String(prevValue ?? 'empty')}" to "${String(value ?? 'empty')}"`,
            undo: () => {
                setPendingUpdates(prev => {
                    const next = { ...prev };
                    const current = next[id] || {};
                    // Revert logic
                    if (field === 'priority') {
                        next[id] = { ...current, custom_data: { ...(current.custom_data || {}), priority: prevValue } };
                    } else if (customFields.some(cf => cf.key === field)) {
                        next[id] = { ...current, custom_data: { ...(current.custom_data || {}), [field as string]: prevValue } };
                    } else {
                        next[id] = { ...current, [field as keyof Lead]: prevValue };
                    }
                    return next;
                });
                setSaveStatus('unsaved');
            },
            redo: () => {
                setPendingUpdates(prev => {
                    // Re-apply the exact same logic as the main update
                    // Ideally we'd extract the logic below into a pure function, but we can just use the setter
                    // Actually, simpler: just trigger the updateLocal again? No, that would add another action.
                    // We must reproduce the state change manually here.
                    const existing = prev[id] || {};
                    const nextUpdate = { ...existing };
                    if (field === 'priority') {
                        nextUpdate.custom_data = { ...(existing.custom_data || {}), priority: Number(value) };
                    } else if (customFields.some(cf => cf.key === field)) {
                        nextUpdate.custom_data = { ...(existing.custom_data || {}), [field as string]: value };
                    } else {
                        nextUpdate[field as keyof Partial<Lead>] = value;
                    }
                    // Side effects (automation) logic must also be repeated or we risk desync. 
                    // For brevity in redo, we assume direct field set. 
                    // To be perfect, we should extract the "calculateNextState" function.

                    // Lets duplicate side-effects logic for correctness:
                    const currentStage = existing.deal_stage ?? baseLead?.deal_stage;
                    if (field === 'contacted') {
                        if (value === true) {
                            if (!currentStage || currentStage === 'New') nextUpdate.deal_stage = 'Contacting';
                        } else {
                            if (currentStage === 'Contacting') nextUpdate.deal_stage = 'New';
                        }
                    }
                    if (field === 'deal_stage') {
                        if (value === 'Contacting') nextUpdate.contacted = true;
                        else if (value === 'New') nextUpdate.contacted = false;
                    }

                    return { ...prev, [id]: nextUpdate };
                });
                setSaveStatus('unsaved');
            }
        });

        setPendingUpdates((prev: Record<string, Partial<Lead>>) => {
            const existing = prev[id] || {};
            // Determine effective current values for logic
            const currentStage = existing.deal_stage ?? baseLead?.deal_stage;

            // Prepare the new update object
            const nextUpdate = { ...existing };

            // 1. Apply the primary change
            if (field === 'priority') {
                nextUpdate.custom_data = {
                    ...(existing.custom_data || {}),
                    priority: Number(value)
                };
            } else if (customFields.some(cf => cf.key === field)) {
                nextUpdate.custom_data = {
                    ...(existing.custom_data || {}),
                    [field as string]: value
                };
            } else {
                nextUpdate[field as keyof Partial<Lead>] = value;
            }

            // 2. Apply Automation Logic (Side Effects)

            // Link Contacted -> Deal Stage
            if (field === 'contacted') {
                if (value === true) {
                    // If ticking Contacted, move to Contacting ONLY if currently New (or undefined)
                    // We avoid demoting "Interested", "Proposal", etc.
                    if (!currentStage || currentStage === 'New') {
                        nextUpdate.deal_stage = 'Contacting';
                    }
                } else {
                    // If unticking Contacted, move back to New ONLY if currently Contacting
                    if (currentStage === 'Contacting') {
                        nextUpdate.deal_stage = 'New';
                    }
                }
            }

            // Link Deal Stage -> Contacted
            if (field === 'deal_stage') {
                const newStage = value as DealStage;
                if (newStage === 'Contacting') {
                    nextUpdate.contacted = true;
                } else if (newStage === 'New') {
                    nextUpdate.contacted = false;
                }
                // For other stages (Interested, Proposal, etc), we do NOT force 'contacted' state
                // This adheres to "don't change contacted when i move up"
            }

            return {
                ...prev,
                [id]: nextUpdate
            };
        });
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
            const ALLOWED_FIELDS = [
                'business_name', 'contact_name', 'email', 'niche', 'city', 'country', 'map',
                'website', 'website_status', 'social_media', 'phone', 'rating', 'score',
                'reviews', 'contacted', 'priority', 'deal_stage', 'follow_up_date', 'notes', 'custom_data'
            ];

            const batch = Object.entries(updates).map(([id, changes]) => {
                const sanitizedChanges: any = {};
                Object.keys(changes).forEach(key => {
                    if (ALLOWED_FIELDS.includes(key)) {
                        sanitizedChanges[key] = (changes as any)[key];
                    }
                });
                return { id, changes: sanitizedChanges };
            });
            return bulkUpdateLeads(batch);
        },
        onSuccess: () => {
            setPendingUpdates({});
            setSaveStatus('saved');
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: (error) => {
            console.error("Failed to save changes:", error);
            setSaveStatus('unsaved'); // Keep as unsaved so user knows retry is needed
            // Optional: You could show a toast here
            alert("Failed to save changes. Please check if 'country' column exists in Supabase or check console for details.");
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
    }, [localSearch, activeStageFilters, activeNicheFilters, activeCityFilters, activeContactedFilter]);

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

        if (activeStageFilters.length > 0) {
            result = result.filter(l => {
                const stage = (l.deal_stage as string) === 'Contacted' ? 'Contacting' : l.deal_stage;
                return activeStageFilters.includes(stage as DealStage);
            });
        }

        if (activeContactedFilter !== 'all') {
            const isContacted = activeContactedFilter === 'yes';
            result = result.filter(l => Boolean(l.contacted) === isContacted);
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
                const field = sortConfig.field as string;
                let aVal = (a as any)[field];
                let bVal = (b as any)[field];

                // Check custom_data if not found at root logic
                if (aVal === undefined && a.custom_data) aVal = a.custom_data[field];
                if (bVal === undefined && b.custom_data) bVal = b.custom_data[field];

                if (aVal === bVal) {
                    // Secondary sort: Created DESC
                    return (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                }
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                // Helper for number comparison
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.order === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // Try parsing as number if it looks like one (handle "100" vs "20")
                const numA = Number(aVal);
                const numB = Number(bVal);
                if (!isNaN(numA) && !isNaN(numB) && aVal !== '' && bVal !== '') {
                    return sortConfig.order === 'asc' ? numA - numB : numB - numA;
                }

                const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
                return sortConfig.order === 'asc' ? comparison : -comparison;
            });
        } else {
            // Default sort: Score DESC, then Created DESC
            result.sort((a, b) => {
                const sA = a.score || a.custom_data?.score || 0;
                const sB = b.score || b.custom_data?.score || 0;
                if (sA !== sB) return Number(sB) - Number(sA);
                return (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            });
        }
        return result;
    }, [allLeads, pendingUpdates, hasPendingChanges, activeNicheFilters, activeCityFilters, activeStageFilters, activeContactedFilter, localSearch, sortConfig]);

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
            { id: 'score', label: 'Score' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
            { id: 'map', label: 'Map' },
            { id: 'niche', label: 'Niche' },
            { id: 'target', label: 'Target' },
            { id: 'tags', label: 'Tags' },
            { id: 'follow_up_date', label: 'Follow Up' },
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

    const handleSort = (field: keyof Lead | string) => {
        setSortConfig(current => {
            if (current?.field === field) {
                // Cycle: DESC -> ASC -> OFF
                if (current.order === 'desc') return { field, order: 'asc' };
                if (current.order === 'asc') return null; // Turn off sorting
            }
            // New field or was off -> Default to DESC (usually better for scores/dates)
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

    const navigate = useNavigate();

    if (isLeadsLoading) return <div className="p-4 text-center text-gray-500">Loading leads...</div>;

    return (
        <div className="leads-page main-layout-container">
            <LeadsHeader
                title={getHeaderTitle()}
                count={filteredLeads.length}
                isSyncing={isRefetching}
                saveStatus={saveStatus}
                onSync={() => refetch()}
                onImport={() => setIsImportOpen(true)}
                hasPendingChanges={hasPendingChanges}
                onSave={() => saveMutation.mutate(pendingUpdates)}
                onActivityClick={() => navigate('/activity')}
            />

            <main className="content-wrapper">
                <div className="leads-card">
                    <LeadsToolbar
                        searchValue={localSearch}
                        onSearchChange={setLocalSearch}
                        activeStages={activeStageFilters}
                        onStagesChange={setActiveStageFilters}

                        activeNiches={activeNicheFilters}
                        onNichesChange={setActiveNicheFilters}
                        availableNiches={allNiches}

                        activeCities={activeCityFilters}
                        onCitiesChange={setActiveCityFilters}
                        availableCities={allCities}

                        activeContacted={activeContactedFilter}
                        onContactedChange={setActiveContactedFilter}

                        selectedCount={selectedIds.size}
                        onDeleteSelected={() => {
                            if (confirm(`Delete ${selectedIds.size} leads ? `)) bulkDeleteMutation.mutate(Array.from(selectedIds));
                        }}
                        currentSort={sortConfig}
                        onSortChange={(field) => {
                            if (field === null) setSortConfig(null);
                            else handleSort(field);
                        }}

                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={undo}
                        onRedo={redo}

                        onBulkUpdate={(updates) => {
                            // 1. Capture previous state for Undo
                            const previousState: Record<string, Partial<Lead>> = {};
                            selectedIds.forEach(id => {
                                // Logic to get current effective value from pendingUpdates OR allLeads
                                const currentLead = allLeads.find(l => l.id === id);
                                if (!currentLead) return;

                                const pending = pendingUpdates[id] || {};
                                // We only need to save the fields being updated
                                Object.keys(updates).forEach(key => {
                                    // @ts-ignore
                                    previousState[id] = previousState[id] || {};
                                    // @ts-ignore
                                    previousState[id][key] = pending[key] ?? currentLead[key];
                                });
                            });

                            const updateAction = {
                                name: 'Bulk Update',
                                businessName: `${selectedIds.size} Leads`,
                                category: 'Multiple', // Could technically deduce if filters are applied, but simpler this way
                                city: 'Multiple',
                                details: `Updated ${Object.keys(updates).join(', ')}`,
                                undo: () => {
                                    setPendingUpdates(prev => {
                                        const next = { ...prev };
                                        Object.entries(previousState).forEach(([id, revertChanges]) => {
                                            const existing = next[id] || {};
                                            next[id] = { ...existing, ...revertChanges };
                                        });
                                        return next;
                                    });
                                    setSaveStatus('unsaved');
                                },
                                redo: () => {
                                    setPendingUpdates(prev => {
                                        const next = { ...prev };
                                        selectedIds.forEach(id => {
                                            const existing = next[id] || {};
                                            next[id] = { ...existing, ...updates };
                                        });
                                        return next;
                                    });
                                    setSaveStatus('unsaved');
                                }
                            };

                            addAction(updateAction);

                            // 2. Apply Update
                            setPendingUpdates((prev: Record<string, Partial<Lead>>) => {
                                const next = { ...prev };
                                selectedIds.forEach(id => {
                                    const existing = next[id] || {};
                                    next[id] = { ...existing, ...updates };
                                });
                                return next;
                            });
                            setSaveStatus('unsaved');
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
