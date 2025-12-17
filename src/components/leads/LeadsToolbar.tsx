import { useState } from 'react';
import { Search, Layers, Tag, Trash2, ArrowUpDown } from 'lucide-react';
import type { DealStage, NicheCategory, Lead } from '../../types';
import './LeadsToolbar.css';

interface LeadsToolbarProps {
    searchValue: string;
    onSearchChange: (val: string) => void;
    activeStage: DealStage | 'All';
    onStageChange: (val: DealStage | 'All') => void;
    activeNiche: NicheCategory | 'All';
    onNicheChange: (val: NicheCategory | 'All') => void;
    selectedCount: number;
    onDeleteSelected: () => void;

    // Sorting
    currentSort: { field: keyof Lead; order: 'asc' | 'desc' } | null;
    onSortChange: (field: keyof Lead | null) => void; // null for default
}

export const LeadsToolbar = ({
    searchValue, onSearchChange,
    activeStage, onStageChange,
    activeNiche, onNicheChange,
    selectedCount, onDeleteSelected,
    currentSort, onSortChange
}: LeadsToolbarProps) => {
    const [showSortMenu, setShowSortMenu] = useState(false);

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

                {/* Stage Filter */}
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

                {/* Niche Filter */}
                <div className="filter-wrapper">
                    <Tag size={14} className="filter-icon" />
                    <select
                        className="filter-select"
                        value={activeNiche}
                        onChange={(e) => onNicheChange(e.target.value as NicheCategory | 'All')}
                    >
                        <option value="All">All Tags</option>
                        <option value="Cafe">Cafe</option>
                        <option value="Gym">Gym</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Other">Other</option>
                    </select>
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
