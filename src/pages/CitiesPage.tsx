import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUniqueCities } from '../api/leads';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MapPin, Pin } from 'lucide-react';
import './CitiesPage.css';

export default function CitiesPage() {
    const navigate = useNavigate();
    const { data: cities = [], isLoading } = useQuery({
        queryKey: ['cities'],
        queryFn: fetchUniqueCities,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const [pinnedCities, setPinnedCities] = useLocalStorage<string[]>('pinned_cities', []);

    const togglePin = (e: React.MouseEvent, city: string) => {
        e.stopPropagation();
        setPinnedCities(prev =>
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
        );
    };

    if (isLoading) return <div className="p-8 text-center text-[var(--text-muted)]">Loading cities...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">
                <MapPin /> All Cities
            </h1>

            <div className="items-grid">
                {cities.map(city => {
                    const isPinned = pinnedCities.includes(city);
                    return (
                        <div
                            key={city}
                            onClick={() => navigate(`/leads?city=${encodeURIComponent(city)}`)}
                            className="item-card group"
                        >
                            <span className="item-name" title={city}>
                                {city}
                            </span>
                            <button
                                onClick={(e) => togglePin(e, city)}
                                className={`btn-pin ${isPinned ? 'pinned' : ''}`}
                                title={isPinned ? "Unpin from sidebar" : "Pin to sidebar"}
                            >
                                {isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
                            </button>
                        </div>
                    );
                })}
                {cities.length === 0 && (
                    <div className="empty-state">
                        No cities found in database.
                    </div>
                )}
            </div>
        </div>
    );
}
