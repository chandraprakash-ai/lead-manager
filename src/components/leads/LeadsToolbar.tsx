import { useState } from 'react';
import { Search, Layers, Tag, Trash2, ArrowUpDown, X, ListFilter, MapPin, CheckSquare, Globe, ChevronDown, Undo, Redo, Pencil } from 'lucide-react';
import type { DealStage, Lead, WebsiteStatus } from '../../types';
import './LeadsToolbar.css';

interface LeadsToolbarProps {
    searchValue: string;
    onSearchChange: (val: string) => void;

    // Multi-select Contexts
    activeStages: DealStage[];
    onStagesChange: (val: DealStage[]) => void;


    activeNiches: string[];
    onNichesChange: (val: string[]) => void;
    availableNiches: string[];

    activeCities: string[];
    onCitiesChange: (val: string[]) => void;
    availableCities: string[];

    activeContacted: 'all' | 'yes' | 'no';
    onContactedChange: (val: 'all' | 'yes' | 'no') => void;

    selectedCount: number;
    onDeleteSelected: () => void;
    onBulkUpdate: (updates: Partial<Lead>) => void;

    currentSort: { field: keyof Lead | string; order: 'asc' | 'desc' } | null;
    onSortChange: (field: keyof Lead | string | null) => void;

    // Undo/Redo
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export const LeadsToolbar = ({
    searchValue, onSearchChange,
    activeStages, onStagesChange,
    activeNiches, onNichesChange, availableNiches,
    activeCities, onCitiesChange, availableCities,
    activeContacted, onContactedChange,
    selectedCount, onDeleteSelected, onBulkUpdate,
    currentSort, onSortChange,
    canUndo = false, canRedo = false, onUndo, onRedo
}: LeadsToolbarProps) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Bulk Menus
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [editSubMenu, setEditSubMenu] = useState<'contacted' | 'status' | 'web' | null>(null);

    // Helper to toggle item in array
    const toggleItem = (current: string[], item: string, onChange: (v: string[]) => void) => {
        if (current.includes(item)) {
            onChange(current.filter(i => i !== item));
        } else {
            onChange([...current, item]);
        }
    };

    const ALL_STAGES: DealStage[] = ['New', 'Contacting', 'Interested', 'Proposal', 'Closed', 'Lost'];
    const WEB_STATUSES: WebsiteStatus[] = ['yes', 'no', 'bad'];

    return (
        <div className="leads-toolbar">
            {/* Left: Search & Filters */}
            <div className="toolbar-left">
                <div className="search-group">
                    <Search size={14} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search leads..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>



                {/* Unified Filter Menu */}
                <div className="relative">
                    <button
                        className={`ltoolbar-btn ${showFilterMenu ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <ListFilter size={14} /> Filters
                        {(activeNiches.length + activeCities.length + activeStages.length + (activeContacted !== 'all' ? 1 : 0)) > 0 && (
                            <span className="badge-count">
                                {activeNiches.length + activeCities.length + activeStages.length + (activeContacted !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <>
                            <div className="ltoolbar-menu-overlay" onClick={() => setShowFilterMenu(false)}></div>
                            <div className="ltoolbar-menu ltoolbar-filters-menu">
                                {/* Contacted Status Section */}
                                <div className="filter-section">
                                    <div className="filter-section-header">
                                        <CheckSquare size={12} /> Contacted Status
                                    </div>
                                    <div className="filter-options-grid">
                                        <label className="filter-option-item">
                                            <input
                                                type="radio"
                                                name="contacted"
                                                checked={activeContacted === 'all'}
                                                onChange={() => onContactedChange('all')}
                                            />
                                            <span>All</span>
                                        </label>
                                        <label className="filter-option-item">
                                            <input
                                                type="radio"
                                                name="contacted"
                                                checked={activeContacted === 'yes'}
                                                onChange={() => onContactedChange('yes')}
                                            />
                                            <span>Contacted</span>
                                        </label>
                                        <label className="filter-option-item">
                                            <input
                                                type="radio"
                                                name="contacted"
                                                checked={activeContacted === 'no'}
                                                onChange={() => onContactedChange('no')}
                                            />
                                            <span>Not Contacted</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="menu-divider"></div>

                                {/* Stages Section */}
                                <div className="filter-section">
                                    <div className="filter-section-header">
                                        <Layers size={12} /> Deal Stages
                                    </div>
                                    <div className="filter-options-grid">
                                        {ALL_STAGES.map(stage => (
                                            <label key={stage} className="filter-option-item">
                                                <input
                                                    type="checkbox"
                                                    checked={activeStages.includes(stage)}
                                                    onChange={() => toggleItem(activeStages, stage, onStagesChange as any)}
                                                />
                                                <span>{stage}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="menu-divider"></div>

                                {/* Niches Section */}
                                <div className="filter-section">
                                    <div className="filter-section-header">
                                        <Tag size={12} /> Niches
                                    </div>
                                    <div className="filter-options-grid">
                                        {availableNiches.map(niche => (
                                            <label key={niche} className="filter-option-item">
                                                <input
                                                    type="checkbox"
                                                    checked={activeNiches.includes(niche)}
                                                    onChange={() => toggleItem(activeNiches, niche, onNichesChange)}
                                                />
                                                <span>{niche}</span>
                                            </label>
                                        ))}
                                        {availableNiches.length === 0 && <span className="text-muted text-xs p-2">No niches found</span>}
                                    </div>
                                </div>

                                <div className="menu-divider"></div>

                                {/* Cities Section */}
                                <div className="filter-section">
                                    <div className="filter-section-header">
                                        <MapPin size={12} /> Cities
                                    </div>
                                    <div className="filter-options-grid">
                                        {availableCities.map(city => (
                                            <label key={city} className="filter-option-item">
                                                <input
                                                    type="checkbox"
                                                    checked={activeCities.includes(city)}
                                                    onChange={() => toggleItem(activeCities, city, onCitiesChange)}
                                                />
                                                <span>{city}</span>
                                            </label>
                                        ))}
                                        {availableCities.length === 0 && <span className="text-muted text-xs p-2">No cities found</span>}
                                    </div>
                                </div>

                                <div className="menu-footer">
                                    <button
                                        className="ltoolbar-clear-btn"
                                        onClick={() => {
                                            onStagesChange([]);
                                            onNichesChange([]);
                                            onCitiesChange([]);
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Active Tags Display (Removable) */}
                <div className="active-tags-list">
                    {activeStages.map(stage => (
                        <div key={stage} className="filter-tag">
                            <Layers size={10} className="opacity-50" />
                            <span>{stage}</span>
                            <button onClick={() => toggleItem(activeStages, stage, onStagesChange as any)} className="remove-tag">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    {activeNiches.map(niche => (
                        <div key={niche} className="filter-tag">
                            <Tag size={10} className="opacity-50" />
                            <span>{niche}</span>
                            <button onClick={() => toggleItem(activeNiches, niche, onNichesChange)} className="remove-tag">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    {activeCities.map(city => (
                        <div key={city} className="filter-tag">
                            <MapPin size={10} className="opacity-50" />
                            <span>{city}</span>
                            <button onClick={() => toggleItem(activeCities, city, onCitiesChange)} className="remove-tag">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="divider-vertical"></div>

                {/* Sort Option */}
                <div style={{ position: 'relative' }}>
                    <button
                        className={`ltoolbar-btn ${showSortMenu ? 'active' : ''}`}
                        onClick={() => { setShowSortMenu(!showSortMenu); }}
                    >
                        <ArrowUpDown size={14} /> Sort
                    </button>
                    {showSortMenu && (
                        <>
                            <div className="ltoolbar-menu-overlay" onClick={() => setShowSortMenu(false)}></div>
                            <div className="ltoolbar-menu">
                                <button
                                    className={`ltoolbar-menu-item ${!currentSort ? 'active' : ''}`}
                                    onClick={() => { onSortChange(null); setShowSortMenu(false); }}
                                >
                                    Default (Score)
                                </button>
                                <button
                                    className={`ltoolbar-menu-item ${currentSort?.field === 'business_name' ? 'active' : ''}`}
                                    onClick={() => { onSortChange('business_name'); setShowSortMenu(false); }}
                                >
                                    Business Name
                                </button>
                                <button
                                    className={`ltoolbar-menu-item ${currentSort?.field === 'rating' ? 'active' : ''}`}
                                    onClick={() => { onSortChange('rating'); setShowSortMenu(false); }}
                                >
                                    Rating (High-Low)
                                </button>
                                <button
                                    className={`ltoolbar-menu-item ${currentSort?.field === 'deal_stage' ? 'active' : ''}`}
                                    onClick={() => { onSortChange('deal_stage'); setShowSortMenu(false); }}
                                >
                                    Deal Stage
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="divider-vertical"></div>

                {/* Undo / Redo */}
                <div className="flex items-center gap-1">
                    <button
                        className="ltoolbar-btn px-2"
                        title="Undo (Bulk Actions)"
                        disabled={!canUndo}
                        onClick={onUndo}
                        style={{ opacity: canUndo ? 1 : 0.5, cursor: canUndo ? 'pointer' : 'default' }}
                    >
                        <Undo size={14} />
                    </button>
                    <button
                        className="ltoolbar-btn px-2"
                        title="Redo"
                        disabled={!canRedo}
                        onClick={onRedo}
                        style={{ opacity: canRedo ? 1 : 0.5, cursor: canRedo ? 'pointer' : 'default' }}
                    >
                        <Redo size={14} />
                    </button>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="toolbar-right">
                {selectedCount > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <span className="text-sm text-[var(--text-muted)] mr-2">
                            <span className="font-medium text-[var(--primary-600)]">{selectedCount}</span> selected
                        </span>

                        {/* Bulk Actions */}

                        {/* 1. Contacted */}
                        {/* 1. Bulk Edit Dropdown */}
                        <div style={{ position: 'relative' }} onMouseLeave={() => setEditSubMenu(null)}>
                            <button
                                className={`ltoolbar-btn ${showEditMenu ? 'active' : ''}`}
                                onClick={() => setShowEditMenu(!showEditMenu)}
                            >
                                <Pencil size={14} /> Edit <ChevronDown size={12} />
                            </button>

                            {showEditMenu && (
                                <>
                                    <div className="ltoolbar-menu-overlay" onClick={() => setShowEditMenu(false)}></div>
                                    <div className="ltoolbar-menu">
                                        {/* Contacted Item */}
                                        <div
                                            className="relative"
                                            onMouseEnter={() => setEditSubMenu('contacted')}
                                        >
                                            <button className="ltoolbar-menu-item w-full flex justify-between items-center">
                                                <span className="flex items-center gap-2"><CheckSquare size={14} /> Contacted</span>
                                                <ChevronDown size={12} className="-rotate-90" />
                                            </button>
                                            {editSubMenu === 'contacted' && (
                                                <div className="ltoolbar-submenu">
                                                    <button
                                                        className="ltoolbar-menu-item"
                                                        onClick={() => { onBulkUpdate({ contacted: true }); setShowEditMenu(false); }}
                                                    >
                                                        Mark as Contacted
                                                    </button>
                                                    <button
                                                        className="ltoolbar-menu-item"
                                                        onClick={() => { onBulkUpdate({ contacted: false }); setShowEditMenu(false); }}
                                                    >
                                                        Mark as Not Contacted
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Item */}
                                        <div
                                            className="relative"
                                            onMouseEnter={() => setEditSubMenu('status')}
                                        >
                                            <button className="ltoolbar-menu-item w-full flex justify-between items-center">
                                                <span className="flex items-center gap-2"><Layers size={14} /> Status</span>
                                                <ChevronDown size={12} className="-rotate-90" />
                                            </button>
                                            {editSubMenu === 'status' && (
                                                <div className="ltoolbar-submenu">
                                                    {ALL_STAGES.map(stage => (
                                                        <button
                                                            key={stage}
                                                            className="ltoolbar-menu-item"
                                                            onClick={() => { onBulkUpdate({ deal_stage: stage }); setShowEditMenu(false); }}
                                                        >
                                                            {stage}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Web Item */}
                                        <div
                                            className="relative"
                                            onMouseEnter={() => setEditSubMenu('web')}
                                        >
                                            <button className="ltoolbar-menu-item w-full flex justify-between items-center">
                                                <span className="flex items-center gap-2"><Globe size={14} /> Web Status</span>
                                                <ChevronDown size={12} className="-rotate-90" />
                                            </button>
                                            {editSubMenu === 'web' && (
                                                <div className="ltoolbar-submenu">
                                                    {WEB_STATUSES.map(status => (
                                                        <button
                                                            key={status}
                                                            className="ltoolbar-menu-item"
                                                            onClick={() => { onBulkUpdate({ website_status: status }); setShowEditMenu(false); }}
                                                        >
                                                            {status === 'yes' ? 'Has Website' : status === 'no' ? 'No Website' : 'Bad Website'}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-4 w-px bg-gray-200 mx-1"></div>

                        <button
                            onClick={onDeleteSelected}
                            className="ltoolbar-btn ltoolbar-btn-danger"
                            title="Delete Selected"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
