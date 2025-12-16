import { Search, Layers, Tag, Trash2 } from 'lucide-react';
import type { DealStage, NicheCategory } from '../../types';

interface LeadsToolbarProps {
    searchValue: string;
    onSearchChange: (val: string) => void;
    activeStage: DealStage | 'All';
    onStageChange: (val: DealStage | 'All') => void;
    activeNiche: NicheCategory | 'All';
    onNicheChange: (val: NicheCategory | 'All') => void;
    selectedCount: number;
    onDeleteSelected: () => void;
}

export const LeadsToolbar = ({
    searchValue, onSearchChange,
    activeStage, onStageChange,
    activeNiche, onNicheChange,
    selectedCount, onDeleteSelected
}: LeadsToolbarProps) => {
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
