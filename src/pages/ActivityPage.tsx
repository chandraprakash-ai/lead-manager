import { useActionHistory } from '../context/ActionHistoryContext';
import { RotateCcw, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ActivityPage.css';

export default function ActivityPage() {
    const { past, undo } = useActionHistory();
    const navigate = useNavigate();
    const reversedHistory = [...past].reverse();

    return (
        <div className="activity-page">
            <header className="page-header">
                <div className="header-left">
                    <button
                        onClick={() => navigate(-1)}
                        className="header-btn-back"
                        title="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title">Activity Log</h1>
                </div>
            </header>

            <main className="activity-content-wrapper">
                <div className="activity-card">
                    {past.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon-wrapper">
                                <Clock size={32} />
                            </div>
                            <h2>No Activity Recorded</h2>
                            <p>Actions you perform on your leads will appear here,<br />giving you a safety net to undo changes.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%' }}>Business / Context</th>
                                        <th style={{ width: '15%' }}>Category</th>
                                        <th style={{ width: '15%' }}>City</th>
                                        <th style={{ width: '25%' }}>Action</th>
                                        <th style={{ width: '10%' }}>Time</th>
                                        <th style={{ width: '10%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reversedHistory.map((action, index) => {
                                        const isLatest = index === 0;
                                        // Helper validation for badge style
                                        const isUpdate = action.name.toLowerCase().includes('update');
                                        const isDelete = action.name.toLowerCase().includes('delete');
                                        const badgeClass = `action-badge ${isDelete ? 'delete' : 'update'}`;

                                        return (
                                            <tr key={action.id} className={isLatest ? 'latest-row' : ''}>
                                                <td>
                                                    <div className="business-name">
                                                        {action.businessName || '—'}
                                                    </div>
                                                </td>
                                                <td className="text-gray-500">{action.category || '—'}</td>
                                                <td className="text-gray-500">{action.city || '—'}</td>
                                                <td>
                                                    <div className="flex flex-col gap-1">
                                                        <span className={badgeClass}>{action.name}</span>
                                                        {action.details && (
                                                            <span className="text-xs text-gray-500 truncate max-w-xs" title={action.details}>
                                                                {action.details}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-gray-400 text-sm whitespace-nowrap">
                                                    {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="text-right">
                                                    {isLatest && (
                                                        <button
                                                            onClick={undo}
                                                            className="undo-btn"
                                                            title="Undo this action"
                                                        >
                                                            <RotateCcw size={14} />
                                                            <span>Undo</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
