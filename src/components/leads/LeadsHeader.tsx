import { RefreshCw, CheckSquare, Trash2 } from 'lucide-react';
import './LeadsHeader.css';

interface LeadsHeaderProps {
    title: string;
    subtitle?: string;
    count: number;
    isSyncing: boolean;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    onSync: () => void;
    onImport: () => void;
}

export const LeadsHeader = ({
    title, subtitle, count, isSyncing, saveStatus, onSync, onImport
}: LeadsHeaderProps) => {
    return (
        <header className="page-header">
            <div className="header-left">
                <h1 className="page-title">
                    {title}
                    {subtitle && <span className="page-subtitle">{subtitle}</span>}
                </h1>
                <div className="header-meta">
                    <span className="record-count">
                        {count} records
                    </span>
                    <div className="status-indicators">
                        {saveStatus === 'saving' && (
                            <span className="status-saving">
                                <RefreshCw size={10} className="spin" /> Saving...
                            </span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="status-saved">
                                <CheckSquare size={10} /> Saved
                            </span>
                        )}
                        {isSyncing && (
                            <span className="status-syncing">
                                <RefreshCw size={10} className="spin" /> Syncing...
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="header-actions">
                <button
                    className="btn btn-secondary"
                    onClick={onSync}
                    title="Sync with Database"
                >
                    <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
                    <span>Sync</span>
                </button>
                <button
                    className="btn btn-primary"
                    onClick={onImport}
                >
                    <span>+ New Lead</span>
                </button>
            </div>
        </header>
    );
};
