import { useState } from 'react';
import { Target, Plus, X } from 'lucide-react';
import type { PriorityLevel, DealStage, WebsiteStatus } from '../../types';

// Labels
export const HeaderLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex-align-center gap-small">
        <Icon size={13} style={{ color: 'var(--text-muted)' }} />
        <span>{text}</span>
    </div>
);

// Selects
export const PrioritySelect = ({ value, onChange }: { value: PriorityLevel, onChange: (v: string | number) => void }) => {
    // Show exactly what is in DB. If it's a number, show number.
    // If it is strictly null/undefined, show empty string.
    const displayValue = (value === null || value === undefined) ? '' : value;

    // Simple color coding for urgency 1-3 or High-Low
    const getStyle = (val: any) => {
        // Try number first
        const num = Number(val);
        if (num === 1) return { bg: 'var(--danger-bg)', col: 'var(--danger-text)' };
        if (num === 2) return { bg: 'var(--warning-bg)', col: 'var(--warning-text)' };
        if (num === 3) return { bg: 'var(--gray-100)', col: 'var(--text-muted)' };

        // Legacy string check (case-insensitive)
        const s = String(val).toLowerCase();
        if (s === 'high') return { bg: 'var(--danger-bg)', col: 'var(--danger-text)' };
        if (s === 'medium') return { bg: 'var(--warning-bg)', col: 'var(--warning-text)' };
        if (s === 'low') return { bg: 'var(--gray-100)', col: 'var(--text-muted)' };

        return { bg: 'transparent', col: 'inherit' };
    };

    const s = getStyle(value);

    return (
        <input
            type="text"
            className="lt-input w-full text-center font-bold"
            value={displayValue}
            onChange={(e) => {
                const val = e.target.value;
                // Try to parse as number if it looks like one
                const num = parseFloat(val);
                if (!isNaN(num) && isFinite(num)) {
                    onChange(num);
                } else {
                    onChange(val);
                }
            }}
            placeholder="-"
            style={{
                backgroundColor: s.bg,
                color: s.col,
                maxWidth: '40px',
                height: '24px',
                borderRadius: '999px',
                margin: '0 auto'
            }}
        />
    );
};

export const StageSelect = ({ value, onChange }: { value: DealStage | 'Contacted', onChange: (v: DealStage) => void }) => {
    // Legacy support
    const normalizedValue = value === 'Contacted' ? 'Contacting' : value;

    const s = {
        'New': { bg: 'var(--primary-50)', col: 'var(--primary-700)' },
        'Contacting': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
        'Interested': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Proposal': { bg: 'var(--info-bg)', col: 'var(--info-text)' },
        'Closed': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Lost': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
    }[normalizedValue] || { bg: 'transparent', col: 'inherit' };

    return (
        <select
            className="no-arrow tag w-full text-center cursor-pointer"
            value={normalizedValue}
            onChange={(e) => onChange(e.target.value as DealStage)}
            style={{ backgroundColor: s.bg, color: s.col }}
        >
            <option value="New">New</option>
            <option value="Contacting">Contacting</option>
            <option value="Interested">Interested</option>
            <option value="Proposal">Proposal</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
        </select>
    );
};

export const TargetToggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onChange(!value); }}
            className={`p-1 rounded-full transition-colors inline-flex items-center justify-center ${value ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-gray-500'}`}
            title="Toggle Today's Target"
        >
            <Target size={18} fill={value ? "currentColor" : "none"} />
        </button>
    );
};

export const TagsCell = ({ value = [], onChange }: { value: string[] | null, onChange: (v: string[]) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState('');
    const tags = Array.isArray(value) ? value : [];

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove));
    };

    const addTag = () => {
        if (newTag.trim()) {
            if (!tags.includes(newTag.trim())) {
                onChange([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
        setIsAdding(false);
    };

    return (
        <div className="flex flex-wrap gap-1 items-center justify-center min-w-[100px]">
            {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {tag}
                    <button
                        onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                        className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                        <X size={8} />
                    </button>
                </span>
            ))}
            {isAdding ? (
                <input
                    autoFocus
                    type="text"
                    className="w-16 text-xs border border-blue-200 rounded px-1 outline-none bg-white"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onBlur={addTag}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag();
                        if (e.key === 'Escape') setIsAdding(false);
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                    className="text-gray-400 hover:text-blue-600 p-0.5 hover:bg-blue-50 rounded"
                    title="Add Tag"
                >
                    <Plus size={12} />
                </button>
            )}
        </div>
    );
};

export const WebsiteStatusSelect = ({ value, onChange }: { value: WebsiteStatus | null | undefined | string, onChange: (v: WebsiteStatus) => void }) => {
    const safeValue = (value as WebsiteStatus) || 'no';
    const s = {
        'yes': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
        'no': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'bad': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
    }[safeValue] || { bg: 'transparent', col: 'inherit' };

    return (
        <select
            className="no-arrow tag w-full text-center cursor-pointer"
            value={safeValue}
            onChange={(e) => onChange(e.target.value as WebsiteStatus)}
            style={{ backgroundColor: s.bg, color: s.col }}
        >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="bad">Bad</option>
        </select>
    );
};
