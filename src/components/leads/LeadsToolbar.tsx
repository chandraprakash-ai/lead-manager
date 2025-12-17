
import { useState } from 'react';
import { Search, Layers, Tag, Trash2, ArrowUpDown } from 'lucide-react';
import type { DealStage, NicheCategory, Lead } from '../../types';

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
        <div className="leads-toolbar relative">
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
                <div className="relative">
                    <button
                        className={`filter - btn ${showSortMenu ? 'active' : ''} `}
                        onClick={() => { setShowSortMenu(!showSortMenu); }}
                    >
                        <ArrowUpDown size={14} /> Sort
                    </button>
                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-[var(--border-default)] rounded-lg shadow-lg z-20 p-1 flex flex-col">
                                <button
                                    className={`text - left px - 3 py - 2 text - xs hover: bg - [var(--bg - hover)]rounded - md ${!currentSort ? 'font-medium text-[var(--primary-700)] bg-[var(--primary-50)]' : ''} `}
                                    onClick={() => { onSortChange(null); setShowSortMenu(false); }}
                                >
                                    Default (Newest)
                                </button>
                                <button
                                    className={`text - left px - 3 py - 2 text - xs hover: bg - [var(--bg - hover)]rounded - md ${currentSort?.field === 'business_name' && currentSort.order === 'asc' ? 'font-medium text-[var(--primary-700)] bg-[var(--primary-50)]' : ''} `}
                                    onClick={() => { onSortChange('business_name'); setShowSortMenu(false); }}
                                >
                                    Name (A-Z)
                                </button>
                                {/* Add more quick sorts if needed */}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Bulk Actions */}
            {selectedCount > 0 && (
                <div className="bulk-actions fade-in">
                    <span className="selected-count">{selectedCount} selected</span>
                    <button
                        className="btn-danger-soft"
                        onClick={onDeleteSelected}
                    >
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};
