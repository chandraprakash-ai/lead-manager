import { useState } from 'react';
import {
    Plus, Type, Hash, Calendar, List, CheckSquare,
    AlignLeft, Link, GripVertical, X, Trash2
} from 'lucide-react';
import './ColumnManager.css';
import type { CustomField } from '../../types';

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
    customFields: CustomField[];
    onCreateField: (name: string, type: CustomField['type']) => void;
    onDeleteField: (id: string, key: string) => void;
}

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

export const ColumnManager = ({ allColumns, visibleColumns, onToggleColumn, onClose, customFields, onCreateField, onDeleteField }: ColumnManagerProps) => {

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<CustomField['type']>('text');

    const visibleList = allColumns.filter(c => visibleColumns.has(c.id));
    const hiddenList = allColumns.filter(c => !visibleColumns.has(c.id));

    const getColumnType = (id: string): ColumnDef['type'] => {
        // Custom fields check first
        const cf = customFields.find(c => c.key === id);
        if (cf) return cf.type as any; // Cast to match ColumnDef type if needed

        switch (id) {
            case 'sn': return 'number';
            case 'business_name': return 'text';
            case 'email': return 'text';
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

    const handleCreate = () => {
        if (!newName.trim()) return;
        onCreateField(newName, newType);
        setNewName('');
        setNewType('text');
        setIsCreating(false);
    };

    const renderRow = (col: { id: string; label: string }, isVisible: boolean) => {
        const customField = customFields.find(c => c.key === col.id);
        return (
            <div key={col.id} className="cm-row">
                <div className="cm-row-info">
                    {isVisible ? (
                        <div className="cm-grip">
                            <GripVertical size={14} />
                        </div>
                    ) : (
                        <div style={{ width: '14px' }}></div>
                    )}
                    <TypeIcon type={getColumnType(col.id)} />
                    <span className="cm-col-label">{col.label}</span>
                    {customField && (
                        <button
                            className="cm-delete-btn"
                            title="Delete Property"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${col.label}"?`)) onDeleteField(customField.id, customField.key);
                            }}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#ef4444', marginLeft: '6px', opacity: 0.6 }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
                <Switch checked={isVisible} onChange={() => onToggleColumn(col.id)} />
            </div>
        );
    };

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

                        {visibleList.map(col => renderRow(col, true))}
                    </div>

                    {/* Hidden Columns */}
                    {hiddenList.length > 0 && (
                        <div className="cm-section cm-hidden-section">
                            <div className="cm-section-header" style={{ marginTop: '12px' }}>
                                <span className="cm-section-title">Hidden</span>
                                <span className="cm-count">{hiddenList.length}</span>
                            </div>
                            {hiddenList.map(col => renderRow(col, false))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="cm-footer">
                    {!isCreating ? (
                        <button className="cm-create-btn" onClick={() => setIsCreating(true)}>
                            <Plus size={16} />
                            Create new property
                        </button>
                    ) : (
                        <div className="cm-create-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    autoFocus
                                    placeholder="Property name"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-default)', fontSize: '13px' }}
                                />
                                <select
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                    style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-default)', fontSize: '13px' }}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="url">URL</option>
                                    <option value="boolean">Checkbox</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    style={{ padding: '6px 12px', fontSize: '12px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName}
                                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: 'none', background: 'var(--primary-600)', color: 'white', cursor: 'pointer', opacity: !newName ? 0.5 : 1 }}
                                >
                                    Create Property
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
