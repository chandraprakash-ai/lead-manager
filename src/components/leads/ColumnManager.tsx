import React from 'react';
import {
    Plus, Type, Hash, Calendar, List, CheckSquare,
    AlignLeft, Link, GripVertical, X
} from 'lucide-react';
import './ColumnManager.css';

interface ColumnDef {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'url' | 'boolean' | 'phone' | 'status';
}

interface ColumnManagerProps {
    allColumns: { id: string; label: string }[];
    visibleColumns: Set<string>;
    onToggleColumn: (id: string) => void;
    onClose: () => void;
}

const getColumnType = (id: string): ColumnDef['type'] => {
    switch (id) {
        case 'sn': return 'number';
        case 'business_name': return 'text';
        case 'priority': return 'select';
        case 'deal_stage': return 'status';
        case 'contacted': return 'boolean';
        case 'website_status': return 'status';
        case 'social': return 'url';
        case 'website': return 'url';
        case 'phone': return 'phone';
        case 'rating': return 'number';
        case 'reviews': return 'number';
        case 'city': return 'text';
        case 'niche': return 'select';
        case 'notes': return 'text';
        default: return 'text';
    }
};

const TypeIcon = ({ type, size = 16 }: { type: ColumnDef['type'], size?: number }) => {
    return (
        <div className={`icon-box ${type}`}>
            {type === 'text' && <Type size={size} strokeWidth={1.5} />}
            {type === 'number' && <Hash size={size} strokeWidth={1.5} />}
            {type === 'select' && <List size={size} strokeWidth={1.5} />}
            {type === 'status' && <CheckSquare size={size} strokeWidth={1.5} />}
            {type === 'date' && <Calendar size={size} strokeWidth={1.5} />}
            {type === 'url' && <Link size={size} strokeWidth={1.5} />}
            {type === 'boolean' && <CheckSquare size={size} strokeWidth={1.5} />}
            {type === 'phone' && <Hash size={size} strokeWidth={1.5} />}
            {/* Fallback */}
            {type !== 'text' && type !== 'number' && type !== 'select' && type !== 'status' &&
                type !== 'date' && type !== 'url' && type !== 'boolean' && type !== 'phone' &&
                <AlignLeft size={size} strokeWidth={1.5} />}
        </div>
    );
};

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className="cm-switch"
        data-checked={checked}
    >
        <span className="cm-switch-knob" />
    </button>
);

export const ColumnManager = ({ allColumns, visibleColumns, onToggleColumn, onClose }: ColumnManagerProps) => {

    const visibleList = allColumns.filter(c => visibleColumns.has(c.id));
    const hiddenList = allColumns.filter(c => !visibleColumns.has(c.id));

    return (
        <div className="cm-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="cm-card">
                {/* Header */}
                <div className="cm-header">
                    <div className="cm-title">
                        <h3>Table Properties</h3>
                        <p>Manage data visibility</p>
                    </div>
                    <button onClick={onClose} className="cm-close-btn">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="cm-body">
                    {/* Shown Columns */}
                    <div className="cm-section">
                        <div className="cm-section-header">
                            <span className="cm-section-title">Visible</span>
                            <span className="cm-count">{visibleList.length}</span>
                        </div>

                        {visibleList.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                                No properties shown
                            </div>
                        )}

                        {visibleList.map(col => (
                            <div key={col.id} className="cm-row">
                                <div className="cm-row-info">
                                    <div className="cm-grip">
                                        <GripVertical size={14} />
                                    </div>
                                    <TypeIcon type={getColumnType(col.id)} />
                                    <span className="cm-col-label">{col.label}</span>
                                </div>
                                <Switch checked={true} onChange={() => onToggleColumn(col.id)} />
                            </div>
                        ))}
                    </div>

                    {/* Hidden Columns */}
                    {hiddenList.length > 0 && (
                        <div className="cm-section cm-hidden-section">
                            <div className="cm-section-header" style={{ marginTop: '12px' }}>
                                <span className="cm-section-title">Hidden</span>
                                <span className="cm-count">{hiddenList.length}</span>
                            </div>
                            {hiddenList.map(col => (
                                <div key={col.id} className="cm-row">
                                    <div className="cm-row-info">
                                        <div style={{ width: '14px' }}></div>
                                        <TypeIcon type={getColumnType(col.id)} />
                                        <span className="cm-col-label">{col.label}</span>
                                    </div>
                                    <Switch checked={false} onChange={() => onToggleColumn(col.id)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="cm-footer">
                    <button className="cm-create-btn">
                        <Plus size={16} />
                        Create new property
                    </button>
                </div>
            </div>
        </div>
    );
};
