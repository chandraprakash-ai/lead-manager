import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUniqueNiches } from '../api/leads';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Briefcase, Pin } from 'lucide-react';
import './NichesPage.css';

export default function NichesPage() {
    const navigate = useNavigate();
    const { data: niches = [], isLoading } = useQuery({
        queryKey: ['niches'],
        queryFn: fetchUniqueNiches,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const [pinnedNiches, setPinnedNiches] = useLocalStorage<string[]>('pinned_niches', []);

    const togglePin = (e: React.MouseEvent, niche: string) => {
        e.stopPropagation();
        setPinnedNiches(prev =>
            prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
        );
    };

    if (isLoading) return <div className="p-8 text-center text-[var(--text-muted)]">Loading niches...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">
                <Briefcase /> All Niches
            </h1>

            <div className="items-grid">
                {niches.map(niche => {
                    const isPinned = pinnedNiches.includes(niche);
                    return (
                        <div
                            key={niche}
                            onClick={() => navigate(`/leads?niche=${encodeURIComponent(niche)}`)}
                            className="item-card group"
                        >
                            <span className="item-name" title={niche}>
                                {niche}
                            </span>
                            <button
                                onClick={(e) => togglePin(e, niche)}
                                className={`btn-pin ${isPinned ? 'pinned' : ''}`}
                                title={isPinned ? "Unpin from sidebar" : "Pin to sidebar"}
                            >
                                {isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
                            </button>
                        </div>
                    );
                })}
                {niches.length === 0 && (
                    <div className="empty-state">
                        No niches found in database.
                    </div>
                )}
            </div>
        </div>
    );
}
