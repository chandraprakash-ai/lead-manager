import React, { useState, useRef } from 'react';
import {
    AlertCircle, Building2, CheckSquare, FileText, Globe, Layers, Link, MapPin,
    MessageSquare, Phone, Plus, Share2, Star, Tag, Mail
} from 'lucide-react';
import type { Lead, CustomField } from '../../../types';
import { HeaderLabel, PrioritySelect, StageSelect, WebsiteStatusSelect } from '../LeadsTableCells';
import './LeadsTable.css';

interface LeadsTableProps {
    leads: Lead[];
    customFields: CustomField[];
    visibleColumns: Set<string>;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    onUpdateLead: (id: string, field: keyof Lead | string, value: any) => void;
    pendingUpdates: Record<string, any>;
    sortConfig: { field: keyof Lead; order: 'asc' | 'desc' } | null;
    onSortChange: (field: keyof Lead | null) => void;
    onOpenColumnManager: () => void;
}

// Helper for resizable headers
const ResizableHeader = ({ col, label, width, sortConfig, onSort, onResizeStart }: any) => (
    <th
        style={{ width }}
        className={`resizable-th ${sortConfig?.field === col ? 'sorted' : ''}`}
        onClick={() => onSort(col)}
    >
        <div className="flex items-center gap-2">
            {label}
            {sortConfig?.field === col && (
                <span className="text-xs text-[var(--primary-500)]">
                    {sortConfig.order === 'asc' ? '↑' : '↓'}
                </span>
            )}
        </div>
        <div
            className="resizer"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => onResizeStart(e, col)}
        />
    </th>
);

export const LeadsTable = ({
    leads,
    customFields,
    visibleColumns,
    selectedIds,
    onSelectionChange,
    onUpdateLead,
    pendingUpdates,
    sortConfig,
    onSortChange,
    onOpenColumnManager
}: LeadsTableProps) => {
    // Local state for column widths (visual only)
    const [colWidths, setColWidths] = useState<Record<string, number>>({
        checkbox: 40, sn: 60, business_name: 220, email: 200, priority: 140, deal_stage: 160,
        contacted: 100, website_status: 150, social: 180, website: 180,
        phone: 150, rating: 100, reviews: 100, city: 140, niche: 140, notes: 300
    });

    const resizingRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

    const startResize = (e: React.MouseEvent, col: string) => {
        e.preventDefault();
        resizingRef.current = { col, startX: e.clientX, startWidth: colWidths[col] };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { col, startX, startWidth } = resizingRef.current;
        const diff = e.clientX - startX;
        setColWidths(prev => ({ ...prev, [col]: Math.max(50, startWidth + diff) }));
    };

    const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onSelectionChange(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === leads.length) onSelectionChange(new Set());
        else onSelectionChange(new Set(leads.map(l => l.id)));
    };

    return (
        <div className="lt-container">
            <table className="lt-table">
                <thead>
                    <tr>
                        <th style={{ width: colWidths.checkbox }}>
                            <input
                                type="checkbox"
                                className="lt-checkbox"
                                checked={leads.length > 0 && selectedIds.size === leads.length}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        {visibleColumns.has('sn') && <ResizableHeader col="sn" label="#" width={colWidths.sn} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('business_name') && <ResizableHeader col="business_name" label={<HeaderLabel icon={Building2} text="Business Name" />} width={colWidths.business_name} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('priority') && <ResizableHeader col="priority" label={<HeaderLabel icon={AlertCircle} text="Priority" />} width={colWidths.priority} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('deal_stage') && <ResizableHeader col="deal_stage" label={<HeaderLabel icon={Layers} text="Deal Status" />} width={colWidths.deal_stage} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('contacted') && <ResizableHeader col="contacted" label={<HeaderLabel icon={CheckSquare} text="Contacted" />} width={colWidths.contacted} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('website_status') && <ResizableHeader col="website_status" label={<HeaderLabel icon={Globe} text="Web Status" />} width={colWidths.website_status} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('social') && <ResizableHeader col="social" label={<HeaderLabel icon={Share2} text="Social" />} width={colWidths.social} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('email') && <ResizableHeader col="email" label={<HeaderLabel icon={Mail} text="Email" />} width={colWidths.email} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('website') && <ResizableHeader col="website" label={<HeaderLabel icon={Link} text="Website" />} width={colWidths.website} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('phone') && <ResizableHeader col="phone" label={<HeaderLabel icon={Phone} text="Phone" />} width={colWidths.phone} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('rating') && <ResizableHeader col="rating" label={<HeaderLabel icon={Star} text="Rating" />} width={colWidths.rating} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('reviews') && <ResizableHeader col="reviews" label={<HeaderLabel icon={MessageSquare} text="Reviews" />} width={colWidths.reviews} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('city') && <ResizableHeader col="city" label={<HeaderLabel icon={MapPin} text="City" />} width={colWidths.city} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {visibleColumns.has('niche') && <ResizableHeader col="niche" label={<HeaderLabel icon={Tag} text="Niche" />} width={colWidths.niche} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}
                        {customFields && customFields.map(cf => visibleColumns.has(cf.key) && (
                            <ResizableHeader key={cf.id} col={cf.key} label={cf.name} width={colWidths[cf.key] || 150} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />
                        ))}
                        {visibleColumns.has('notes') && <ResizableHeader col="notes" label={<HeaderLabel icon={FileText} text="Notes" />} width={colWidths.notes} sortConfig={sortConfig} onSort={onSortChange} onResizeStart={startResize} />}

                        {/* Add Column Button */}
                        <th className="lt-add-col-th">
                            <button
                                className="lt-add-col-btn"
                                onClick={onOpenColumnManager}
                                title="Manage Columns"
                            >
                                <Plus size={18} />
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead, index) => {
                        const isDirty = !!pendingUpdates[lead.id];
                        return (
                            <tr key={lead.id} className={isDirty ? 'lt-row-dirty' : ''}>
                                <td className="lt-center">
                                    <input type="checkbox" className="lt-checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                                </td>
                                {visibleColumns.has('sn') && <td className="lt-cell-muted">#{index + 1}</td>}
                                {visibleColumns.has('business_name') && <td className="lt-cell-main">
                                    <input
                                        className="lt-input"
                                        value={lead.business_name}
                                        onChange={(e) => onUpdateLead(lead.id, 'business_name', e.target.value)}
                                    />
                                </td>}
                                {visibleColumns.has('priority') && <td>
                                    <PrioritySelect value={lead.priority} onChange={(val) => onUpdateLead(lead.id, 'priority', val)} />
                                </td>}
                                {visibleColumns.has('deal_stage') && <td>
                                    <StageSelect value={lead.deal_stage} onChange={(val) => onUpdateLead(lead.id, 'deal_stage', val)} />
                                </td>}
                                {visibleColumns.has('contacted') && <td className="lt-center">
                                    <input
                                        type="checkbox"
                                        className="lt-checkbox-lg"
                                        checked={lead.contacted}
                                        onChange={(e) => onUpdateLead(lead.id, 'contacted', e.target.checked)}
                                    />
                                </td>}
                                {visibleColumns.has('website_status') && <td>
                                    <WebsiteStatusSelect value={lead.website_status} onChange={(val) => onUpdateLead(lead.id, 'website_status', val)} />
                                </td>}
                                {visibleColumns.has('social') && <td>
                                    <input className="lt-input lt-text-muted" placeholder="Social Link" value={lead.social_media || ''} onChange={(e) => onUpdateLead(lead.id, 'social_media', e.target.value)} />
                                </td>}
                                {visibleColumns.has('email') && <td>
                                    <input className="lt-input lt-text-muted" placeholder="Email" type="email" value={lead.email || ''} onChange={(e) => onUpdateLead(lead.id, 'email', e.target.value)} />
                                </td>}
                                {visibleColumns.has('website') && <td>
                                    <input className="lt-input lt-text-link" placeholder="Website" value={lead.website || ''} onChange={(e) => onUpdateLead(lead.id, 'website', e.target.value)} />
                                </td>}
                                {visibleColumns.has('phone') && <td>
                                    <input className="lt-input lt-text-secondary" placeholder="Phone" value={lead.phone || ''} onChange={(e) => onUpdateLead(lead.id, 'phone', e.target.value)} />
                                </td>}
                                {visibleColumns.has('rating') && <td className="lt-center"><span className={(lead.rating || 0) > 4 ? "lt-rating-high" : "lt-text-muted"}>{lead.rating || '-'}</span></td>}
                                {visibleColumns.has('reviews') && <td className="lt-center"><span className="lt-text-muted">{lead.reviews || 0}</span></td>}
                                {visibleColumns.has('city') && <td><span className="lt-text-main">{lead.city}</span></td>}
                                {visibleColumns.has('niche') && <td className="lt-center">
                                    <span className="lt-tag">{lead.niche}</span>
                                </td>}
                                {customFields && customFields.map(cf => visibleColumns.has(cf.key) && (
                                    <td key={cf.id}>
                                        <input
                                            className="lt-input"
                                            value={lead.custom_data?.[cf.key] || ''}
                                            onChange={(e) => onUpdateLead(lead.id, cf.key, e.target.value)}
                                        />
                                    </td>
                                ))}
                                {visibleColumns.has('notes') && <td className="lt-cell-notes" title={lead.notes || ''}>
                                    {lead.notes || <span className="lt-text-faint">Empty</span>}
                                </td>}
                            </tr>
                        );
                    })}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={visibleColumns.size + 2} className="lt-empty-state">
                                No leads match your filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
