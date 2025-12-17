import { useState } from 'react';
import { Search, Layers, Tag, Trash2, ArrowUpDown, X, ListFilter, MapPin } from 'lucide-react';
import type { DealStage, Lead } from '../../types';
import './LeadsToolbar.css';

interface LeadsToolbarProps {
    searchValue: string;
    onSearchChange: (val: string) => void;

    // Filters
    activeStage: DealStage | 'All';
    onStageChange: (val: DealStage | 'All') => void;

    // Multi-select Contexts
    activeNiches: string[];
    onNichesChange: (val: string[]) => void;
    availableNiches: string[];

    activeCities: string[];
    onCitiesChange: (val: string[]) => void;
    availableCities: string[];

    selectedCount: number;
    onDeleteSelected: () => void;
    currentSort: { field: keyof Lead; order: 'asc' | 'desc' } | null;
    onSortChange: (field: keyof Lead | null) => void;
}

export const LeadsToolbar = ({
    searchValue, onSearchChange,
    activeStage, onStageChange,
    activeNiches, onNichesChange, availableNiches,
    activeCities, onCitiesChange, availableCities,
    selectedCount, onDeleteSelected,
    currentSort, onSortChange
}: LeadsToolbarProps) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Helper to toggle item in array
    const toggleItem = (current: string[], item: string, onChange: (v: string[]) => void) => {
        if (current.includes(item)) {
            onChange(current.filter(i => i !== item));
        } else {
            onChange([...current, item]);
        }
    };

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

                <div className="divider-vertical"></div>

                {/* Stage Filter - Always visible as Primary View */}
                <div className="filter-wrapper">
                    <Layers size={14} className="filter-icon" />
                    <select
                        className="filter-select"
                        value={activeStage}
                        onChange={(e) => onStageChange(e.target.value as DealStage | 'All')}
                    >
                        <option value="All">All Stages</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Closed">Closed</option>
                        <option value="Lost">Lost</option>
                    </select>
                </div>

                {/* Unified Filter Menu */}
                <div className="relative">
                    <button
                        className={`ltoolbar-btn ${showFilterMenu ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <ListFilter size={14} /> Filters
                        {(activeNiches.length + activeCities.length) > 0 && (
                            <span className="badge-count">{activeNiches.length + activeCities.length}</span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <>
                            <div className="ltoolbar-menu-overlay" onClick={() => setShowFilterMenu(false)}></div>
                            <div className="ltoolbar-menu ltoolbar-filters-menu">
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
                                    Default (Newest)
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
            </div>

            {/* Right: Actions */}
            <div className="toolbar-right">
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                        <span className="text-sm text-[var(--text-muted)]">
                            <span className="font-medium text-[var(--primary-600)]">{selectedCount}</span> selected
                        </span>
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
