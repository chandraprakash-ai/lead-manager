
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, deleteLead, bulkUpdateLeads } from '../api/leads';
import type { Lead, NicheCategory, DealStage } from '../types';
import { Trash2, Building2, AlertCircle, Layers, CheckSquare, Globe, Share2, Link, Phone, Star, MessageSquare, MapPin, Tag, FileText } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import { supabase } from '../lib/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LeadsHeader } from '../components/leads/LeadsHeader';
import { LeadsToolbar } from '../components/leads/LeadsToolbar';
import { HeaderLabel, PrioritySelect, StageSelect, WebsiteStatusSelect } from '../components/leads/LeadsTableCells';
import { LeadsPagination } from '../components/leads/LeadsPagination';
import './LeadsPage.css';

// --- Sub-Components defined outside to prevent re-creation ---

const ResizableHeader = ({ col, label, width, sortConfig, onSort, onResizeStart }: {
    col: string,
    label: React.ReactNode,
    width: number,
    sortConfig: { field: keyof Lead; order: 'asc' | 'desc' } | null,
    onSort: (field: keyof Lead) => void,
    onResizeStart: (e: React.MouseEvent, col: string) => void
}) => (
    <th
        className="resizable-th transition-colors cursor-pointer group"
        style={{ width: width, minWidth: width }}
        onClick={(e) => { e.preventDefault(); onSort(col as keyof Lead); }}
    >
        <div className="flex-align-center h-full justify-between gap-2">
            <span className="font-medium flex-align-center gap-small group-hover-text-dark transition-colors">{label}</span>
            {sortConfig?.field === col && (
                <span className="text-gray-400 text-xs">{sortConfig.order === 'asc' ? '↑' : '↓'}</span>
            )}
        </div>
        <div className="resizer" onMouseDown={(e) => onResizeStart(e, col)} onClick={(e) => e.stopPropagation()} />
    </th>
);

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

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteLead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
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

    // --- Client-Side Filtering & Sorting ---
    const [sortConfig, setSortConfig] = useState<{ field: keyof Lead; order: 'asc' | 'desc' } | null>(null);

    // Filters
    // Sync initial state with URL if present, else default
    const [activeStageFilter, setActiveStageFilter] = useState<DealStage | 'All'>('All');

    // We can initialize niche from URL, but keep local control primary for the UI
    const [activeNicheFilter, setActiveNicheFilter] = useState<NicheCategory | 'All'>((searchParams.get('niche') as NicheCategory) || 'All');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [localSearch, activeStageFilter, activeNicheFilter]);

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

    // Resizing Logic (Visual only, no DB interaction)
    const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
        try {
            const saved = window.localStorage.getItem('leads_table_col_widths');
            const defaults = {
                checkbox: 40, sn: 50, business_name: 200, priority: 100, deal_stage: 120, contacted: 100,
                website_status: 100, social: 150, website: 150, phone: 120, rating: 80, reviews: 80,
                city: 120, niche: 100, notes: 200, actions: 60
            };
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return {
                checkbox: 40, sn: 50, business_name: 200, priority: 100, deal_stage: 120, contacted: 100,
                website_status: 100, social: 150, website: 150, phone: 120, rating: 80, reviews: 80,
                city: 120, niche: 100, notes: 200, actions: 60
            };
        }
    });

    // Debounced save to localStorage
    const saveColWidthsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const saveColWidths = useCallback((widths: Record<string, number>) => {
        if (saveColWidthsTimeout.current) clearTimeout(saveColWidthsTimeout.current);
        saveColWidthsTimeout.current = setTimeout(() => {
            window.localStorage.setItem('leads_table_col_widths', JSON.stringify(widths));
        }, 500);
    }, []);

    const activeResize = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

    const startResize = (e: React.MouseEvent, col: string) => {
        e.preventDefault(); e.stopPropagation();
        const currentWidth = colWidths[col] || 100; // Fallback to avoid crashes
        activeResize.current = { col, startX: e.clientX, startWidth: currentWidth };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent selection
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        const th = (e.target as HTMLElement).closest('th');
        if (th) th.classList.add('resizing');
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!activeResize.current) return;
        const diff = e.clientX - activeResize.current.startX;
        const newWidth = Math.max(50, activeResize.current.startWidth + diff);

        // Use requestAnimationFrame to smooth updates and avoid thrashing
        requestAnimationFrame(() => {
            setColWidths(prev => {
                const updated = { ...prev, [activeResize.current!.col]: newWidth };
                saveColWidths(updated); // Schedule save
                return updated;
            });
        });
    }, [saveColWidths]);

    const handleMouseUp = useCallback(() => {
        activeResize.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.querySelectorAll('.resizing').forEach(el => el.classList.remove('resizing'));
    }, [handleMouseMove]);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedLeads.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(paginatedLeads.map(l => l.id)));
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
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
                title={activeNicheFilter !== 'All' ? `${activeNicheFilter} Leads` : 'All Leads'}
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
                    />

                    {/* Table Container */}
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: colWidths.checkbox }}>
                                        <input type="checkbox" checked={paginatedLeads.length > 0 && selectedIds.size === paginatedLeads.length} onChange={toggleSelectAll} />
                                    </th>
                                    <ResizableHeader col="sn" label="#" width={colWidths.sn} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="business_name" label={<HeaderLabel icon={Building2} text="Business Name" />} width={colWidths.business_name} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="priority" label={<HeaderLabel icon={AlertCircle} text="Priority" />} width={colWidths.priority} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="deal_stage" label={<HeaderLabel icon={Layers} text="Deal Status" />} width={colWidths.deal_stage} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="contacted" label={<HeaderLabel icon={CheckSquare} text="Contacted" />} width={colWidths.contacted} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="website_status" label={<HeaderLabel icon={Globe} text="Web Status" />} width={colWidths.website_status} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="social" label={<HeaderLabel icon={Share2} text="Social" />} width={colWidths.social} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="website" label={<HeaderLabel icon={Link} text="Website" />} width={colWidths.website} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="phone" label={<HeaderLabel icon={Phone} text="Phone" />} width={colWidths.phone} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="rating" label={<HeaderLabel icon={Star} text="Rating" />} width={colWidths.rating} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="reviews" label={<HeaderLabel icon={MessageSquare} text="Reviews" />} width={colWidths.reviews} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="city" label={<HeaderLabel icon={MapPin} text="City" />} width={colWidths.city} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="niche" label={<HeaderLabel icon={Tag} text="Niche" />} width={colWidths.niche} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <ResizableHeader col="notes" label={<HeaderLabel icon={FileText} text="Notes" />} width={colWidths.notes} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                                    <th style={{ width: colWidths.actions, borderRight: 'none', background: 'var(--bg-surface)' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLeads.map((lead, index) => {
                                    const isDirty = !!pendingUpdates[lead.id];
                                    return (
                                        <tr key={lead.id} style={isDirty ? { backgroundColor: 'var(--warning-bg)' } : undefined}>
                                            <td>
                                                <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                                            </td>
                                            <td><span style={{ color: 'var(--text-muted)' }}>#{index + 1 + ((currentPage - 1) * itemsPerPage)}</span></td>
                                            <td style={{ fontWeight: 500 }}>
                                                <input
                                                    className="input-cell font-medium"
                                                    value={lead.business_name}
                                                    onChange={(e) => updateLocal(lead.id, 'business_name', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <PrioritySelect value={lead.priority} onChange={(val) => updateLocal(lead.id, 'priority', val)} />
                                            </td>
                                            <td>
                                                <StageSelect value={lead.deal_stage} onChange={(val) => updateLocal(lead.id, 'deal_stage', val)} />
                                            </td>
                                            <td className="text-center" style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={lead.contacted}
                                                    onChange={(e) => updateLocal(lead.id, 'contacted', e.target.checked)}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-500)' }}
                                                />
                                            </td>
                                            <td>
                                                <WebsiteStatusSelect value={lead.website_status} onChange={(val) => updateLocal(lead.id, 'website_status', val)} />
                                            </td>
                                            <td>
                                                <input className="input-cell" style={{ color: 'var(--text-muted)' }} placeholder="Social Link" value={lead.social_media || ''} onChange={(e) => updateLocal(lead.id, 'social_media', e.target.value)} />
                                            </td>
                                            <td>
                                                <input className="input-cell" style={{ color: 'var(--primary-600)', textDecoration: 'underline' }} placeholder="Website" value={lead.website || ''} onChange={(e) => updateLocal(lead.id, 'website', e.target.value)} />
                                            </td>
                                            <td>
                                                <input className="input-cell" style={{ color: 'var(--text-main)' }} placeholder="Phone" value={lead.phone || ''} onChange={(e) => updateLocal(lead.id, 'phone', e.target.value)} />
                                            </td>
                                            <td><span style={{ color: (lead.rating || 0) > 4 ? "var(--warning-text)" : "var(--text-muted)", fontWeight: 500 }}>{lead.rating || '-'}</span></td>
                                            <td><span style={{ color: 'var(--text-muted)' }}>{lead.reviews || 0}</span></td>
                                            <td><span style={{ color: 'var(--text-main)' }}>{lead.city}</span></td>
                                            {/* Centered Tag */}
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="tag" style={{ border: '1px solid var(--border-default)', background: 'var(--gray-100)', color: 'var(--text-muted)' }}>{lead.niche}</span>
                                            </td>
                                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.notes || ''}>
                                                {lead.notes || <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>Empty</span>}
                                            </td>
                                            <td>
                                                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(lead.id); }} style={{ color: 'var(--text-faint)', padding: '4px' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={Object.keys(colWidths).length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                            No leads match your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
        </div>
    );
}
