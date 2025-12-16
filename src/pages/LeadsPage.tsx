
import { useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, deleteLead, bulkUpdateLeads } from '../api/leads';
import type { Lead, NicheCategory, PriorityLevel, DealStage, WebsiteStatus } from '../types';
import { Search, Trash2, Building2, AlertCircle, Layers, CheckSquare, Globe, Share2, Link, Phone, Star, MessageSquare, MapPin, Tag, FileText, Save, X, RefreshCw } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import { supabase } from '../lib/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- Sub-Components defined outside to prevent re-creation ---

const Label = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-2">
        <Icon size={13} className="text-gray-400" />
        <span>{text}</span>
    </div>
);

const PrioritySelect = ({ value, onChange }: { value: PriorityLevel, onChange: (v: PriorityLevel) => void }) => {
    const s = {
        'High': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
        'Medium': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
        'Low': { bg: 'var(--gray-100)', col: 'var(--text-muted)' },
    }[value] || { bg: 'transparent', col: 'inherit' };

    return (
        <select className="no-arrow tag w-full text-center cursor-pointer" value={value} onChange={(e) => onChange(e.target.value as PriorityLevel)}
            style={{ backgroundColor: s.bg, color: s.col }}>
            <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
        </select>
    );
};

const StageSelect = ({ value, onChange }: { value: DealStage, onChange: (v: DealStage) => void }) => {
    const s = {
        'New': { bg: 'var(--primary-50)', col: 'var(--primary-700)' },
        'Contacted': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
        'Interested': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Proposal': { bg: 'var(--info-bg)', col: 'var(--info-text)' },
        'Closed': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Lost': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
    }[value] || { bg: 'transparent', col: 'inherit' };

    return (
        <select className="no-arrow tag w-full text-center cursor-pointer" value={value} onChange={(e) => onChange(e.target.value as DealStage)}
            style={{ backgroundColor: s.bg, color: s.col }}>
            <option value="New">New</option><option value="Contacted">Contacted</option><option value="Interested">Interested</option>
            <option value="Proposal">Proposal</option><option value="Closed">Closed</option><option value="Lost">Lost</option>
        </select>
    );
}

const WebsiteStatusSelect = ({ value, onChange }: { value: WebsiteStatus, onChange: (v: WebsiteStatus) => void }) => {
    const s = {
        'yes': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'no': { bg: 'var(--gray-100)', col: 'var(--text-muted)' },
        'bad': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
    }[value] || { bg: 'transparent', col: 'inherit' };

    return (
        <select className="no-arrow tag w-full text-center cursor-pointer" value={value} onChange={(e) => onChange(e.target.value as WebsiteStatus)}
            style={{ backgroundColor: s.bg, color: s.col }}>
            <option value="yes">Yes</option><option value="no">No</option><option value="bad">Bad</option>
        </select>
    );
}

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
        <div className="flex items-center h-full justify-between gap-2">
            <span className="font-medium flex items-center gap-2 group-hover:text-gray-900 transition-colors">{label}</span>
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

    // --- Write Strategy: Local Draft State ---
    const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Lead>>>({});

    // Helper to track local changes
    const updateLocal = (id: string, field: keyof Lead, value: any) => {
        setPendingUpdates(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const hasPendingChanges = Object.keys(pendingUpdates).length > 0;
    const discardChanges = () => setPendingUpdates({});

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

    // Derived Filters from URL + Local Search
    const activeNiche = searchParams.get('niche') as NicheCategory | null;
    const activeCity = searchParams.get('city');

    const filteredLeads = useMemo(() => {
        let result = [...(allLeads || [])];

        // 1. Apply Drafts over Server Data (Optimistic View)
        if (hasPendingChanges) {
            result = result.map(l => pendingUpdates[l.id] ? { ...l, ...pendingUpdates[l.id] } : l);
        }

        // 2. Filters
        if (activeNiche) result = result.filter(l => l.niche === activeNiche);
        if (activeCity) result = result.filter(l => l.city === activeCity);
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
    }, [allLeads, pendingUpdates, activeNiche, activeCity, localSearch, sortConfig]);

    // Resizing Logic (Visual only, no DB interaction)
    const [colWidths, setColWidths] = useLocalStorage<Record<string, number>>('leads_table_col_widths', {
        checkbox: 40, sn: 50, business_name: 200, priority: 100, deal_stage: 120, contacted: 100,
        website_status: 100, social: 150, website: 150, phone: 120, rating: 80, reviews: 80,
        city: 120, niche: 100, notes: 200, actions: 60
    });

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
            setColWidths(prev => ({
                ...prev,
                [activeResize.current!.col]: newWidth
            }));
        });
    }, [setColWidths]);

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
        if (selectedIds.size === filteredLeads.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredLeads.map(l => l.id)));
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

    return (
        <div className="flex flex-col h-full overflow-hidden relative">

            {/* Toolbar */}
            <div className="flex items-center gap-4 flex-shrink-0 p-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
                <div className="font-semibold text-[15px] text-[var(--text-main)]">
                    {[
                        activeNiche ? `${activeNiche} Leads` : 'All Leads',
                        activeCity ? ` in ${activeCity}` : ''
                    ].join('')}
                    <span className="ml-2 text-[var(--text-muted)] font-normal text-xs">
                        {filteredLeads.length} records {isRefetching && '(Refreshing...)'}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-sm relative">
                    <Search size={14} className="absolute left-2.5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        className="input"
                        style={{ paddingLeft: '32px' }}
                        placeholder="Search local..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {selectedIds.size > 0 && (
                        <button
                            className="btn"
                            style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-text)', background: 'var(--danger-bg)' }}
                            onClick={() => { if (confirm(`Delete ${selectedIds.size} leads ? `)) bulkDeleteMutation.mutate(Array.from(selectedIds)); }}
                        >
                            <Trash2 size={14} /> Delete ({selectedIds.size})
                        </button>
                    )}

                    <button className="btn" onClick={() => refetch()} title="Force Reload from DB">
                        <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsImportOpen(true)}>+ Import</button>
                </div>
            </div>

            {/* Save Action Bar (Appears when has updates) */}
            {hasPendingChanges && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
                    <span className="text-sm font-medium">
                        {Object.keys(pendingUpdates).length} unsaved changes
                    </span>
                    <button
                        className="px-3 py-1 bg-white text-gray-900 rounded font-semibold text-xs hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => saveMutation.mutate(pendingUpdates)}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                    </button>
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={discardChanges}
                        title="Discard Changes"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Table Area */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: colWidths.checkbox }}>
                                <input type="checkbox" checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length} onChange={toggleSelectAll} />
                            </th>
                            <ResizableHeader col="sn" label="#" width={colWidths.sn} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="business_name" label={<Label icon={Building2} text="Business Name" />} width={colWidths.business_name} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="priority" label={<Label icon={AlertCircle} text="Priority" />} width={colWidths.priority} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="deal_stage" label={<Label icon={Layers} text="Deal Status" />} width={colWidths.deal_stage} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="contacted" label={<Label icon={CheckSquare} text="Contacted" />} width={colWidths.contacted} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="website_status" label={<Label icon={Globe} text="Web Status" />} width={colWidths.website_status} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="social" label={<Label icon={Share2} text="Social" />} width={colWidths.social} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="website" label={<Label icon={Link} text="Website" />} width={colWidths.website} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="phone" label={<Label icon={Phone} text="Phone" />} width={colWidths.phone} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="rating" label={<Label icon={Star} text="Rating" />} width={colWidths.rating} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="reviews" label={<Label icon={MessageSquare} text="Reviews" />} width={colWidths.reviews} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="city" label={<Label icon={MapPin} text="City" />} width={colWidths.city} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="niche" label={<Label icon={Tag} text="Niche" />} width={colWidths.niche} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <ResizableHeader col="notes" label={<Label icon={FileText} text="Notes" />} width={colWidths.notes} sortConfig={sortConfig} onSort={handleSort} onResizeStart={startResize} />
                            <th style={{ width: colWidths.actions, borderRight: 'none', background: 'var(--bg-surface)' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead, index) => {
                            const isDirty = !!pendingUpdates[lead.id];
                            return (
                                <tr key={lead.id} className={isDirty ? 'bg-amber-50' : ''}>
                                    <td>
                                        <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                                    </td>
                                    <td><span className="text-[var(--text-muted)]">#{index + 1}</span></td>
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
                                    <td className="text-center">
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
                                        <input className="input-cell text-gray-500" placeholder="Social Link" value={lead.social_media || ''} onChange={(e) => updateLocal(lead.id, 'social_media', e.target.value)} />
                                    </td>
                                    <td>
                                        <input className="input-cell text-blue-600 hover:underline" placeholder="Website" value={lead.website || ''} onChange={(e) => updateLocal(lead.id, 'website', e.target.value)} />
                                    </td>
                                    <td>
                                        <input className="input-cell text-gray-600" placeholder="Phone" value={lead.phone || ''} onChange={(e) => updateLocal(lead.id, 'phone', e.target.value)} />
                                    </td>
                                    <td><span className={(lead.rating || 0) > 4 ? "text-amber-600 font-medium" : "text-gray-500"}>{lead.rating || '-'}</span></td>
                                    <td><span className="text-gray-500">{lead.reviews || 0}</span></td>
                                    <td><span className="text-gray-700">{lead.city}</span></td>
                                    <td><span className="tag border border-[var(--border-default)] bg-[var(--gray-100)] text-[var(--text-muted)]">{lead.niche}</span></td>
                                    <td className="max-w-[200px] truncate" title={lead.notes || ''}>
                                        {lead.notes || <span className="text-[var(--text-faint)] italic">Empty</span>}
                                    </td>
                                    <td>
                                        <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(lead.id); }} className="text-[var(--text-faint)] hover:text-red-500 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan={Object.keys(colWidths).length} className="text-center p-8 text-[var(--text-muted)]">
                                    No leads match your filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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

