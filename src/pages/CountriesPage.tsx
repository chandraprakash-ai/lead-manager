import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCountriesWithCities } from '../api/leads';
import { Globe, MapPin, ChevronDown } from 'lucide-react';
import './CountriesPage.css';
import { useState } from 'react';

export default function CountriesPage() {
    const navigate = useNavigate();
    const { data: countries = [], isLoading } = useQuery({
        queryKey: ['countries_tree'],
        queryFn: fetchCountriesWithCities,
        staleTime: 1000 * 60 * 15 // 15 minutes
    });

    const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

    const toggleExpand = (country: string) => {
        const next = new Set(expandedCountries);
        if (next.has(country)) next.delete(country);
        else next.add(country);
        setExpandedCountries(next);
    };

    if (isLoading) return <div className="p-8 text-center text-[var(--text-muted)]">Loading countries...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">
                <Globe /> All Countries
            </h1>

            <div className="countries-grid">
                {countries.map(({ country, cities }) => {
                    const isExpanded = expandedCountries.has(country);
                    return (
                        <div key={country} className={`country-card ${isExpanded ? 'expanded' : ''}`}>
                            <div
                                className="country-header"
                                onClick={() => toggleExpand(country)}
                            >
                                <div className="flex items-center gap-2">
                                    <Globe size={18} className="text-blue-500 opacity-60" />
                                    <span className="font-semibold text-lg">{country}</span>
                                    <span className="text-xs text-gray-400 font-normal ml-2">({cities.length} cities)</span>
                                </div>
                                <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-gray-400`} />
                            </div>

                            {isExpanded && (
                                <div className="cities-list">
                                    {cities.map(city => (
                                        <div
                                            key={city}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/leads?city=${encodeURIComponent(city)}`);
                                            }}
                                            className="city-item"
                                            title={city}
                                        >
                                            <MapPin size={14} className="opacity-50" />
                                            <span className="truncate">{city}</span>
                                        </div>
                                    ))}
                                    {cities.length === 0 && (
                                        <div className="text-sm text-gray-400 italic p-2">No cities recorded</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {countries.length === 0 && (
                    <div className="empty-state">
                        No countries found. Use the lead table to add country data.
                    </div>
                )}
            </div>
        </div>
    );
}
