import type { PriorityLevel, DealStage, WebsiteStatus } from '../../types';

// Labels
export const HeaderLabel = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex-align-center gap-small">
        <Icon size={13} style={{ color: 'var(--text-muted)' }} />
        <span>{text}</span>
    </div>
);

// Selects
export const PrioritySelect = ({ value, onChange }: { value: PriorityLevel, onChange: (v: PriorityLevel) => void }) => {
    const s = {
        'High': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
        'Medium': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
        'Low': { bg: 'var(--gray-100)', col: 'var(--text-muted)' },
    }[value] || { bg: 'transparent', col: 'inherit' };

    return (
        <select
            className="no-arrow tag w-full text-center cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value as PriorityLevel)}
            style={{ backgroundColor: s.bg, color: s.col }}
        >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>
    );
};

export const StageSelect = ({ value, onChange }: { value: DealStage, onChange: (v: DealStage) => void }) => {
    const s = {
        'New': { bg: 'var(--primary-50)', col: 'var(--primary-700)' },
        'Contacted': { bg: 'var(--warning-bg)', col: 'var(--warning-text)' },
        'Interested': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Proposal': { bg: 'var(--info-bg)', col: 'var(--info-text)' },
        'Closed': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'Lost': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
    }[value] || { bg: 'transparent', col: 'inherit' };

    return (
        <select
            className="no-arrow tag w-full text-center cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value as DealStage)}
            style={{ backgroundColor: s.bg, color: s.col }}
        >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Proposal">Proposal</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
        </select>
    );
};

export const WebsiteStatusSelect = ({ value, onChange }: { value: WebsiteStatus | null | undefined | string, onChange: (v: WebsiteStatus) => void }) => {
    const safeValue = (value as WebsiteStatus) || 'no';
    const s = {
        'yes': { bg: 'var(--success-bg)', col: 'var(--success-text)' },
        'no': { bg: 'var(--gray-100)', col: 'var(--text-muted)' },
        'bad': { bg: 'var(--danger-bg)', col: 'var(--danger-text)' },
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
