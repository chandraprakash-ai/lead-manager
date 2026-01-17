import { useEffect, useState } from 'react';
import './HeroDemo.css';

// Premium demo data - Modern Tech companies
const DEMO_LEADS = [
    { name: 'Linear', stage: 'Proposal', niche: 'SaaS', priority: 'High' },
    { name: 'Vercel', stage: 'Interested', niche: 'DevTools', priority: 'Medium' },
    { name: 'Raycast', stage: 'Contacting', niche: 'Productivity', priority: 'High' },
    { name: 'Figma', stage: 'New', niche: 'Design', priority: 'Low' },
];

export function HeroDemo() {
    const [visible, setVisible] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 400);
        const t2 = setTimeout(() => setStatsVisible(true), 800);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <div className={`hero-demo ${visible ? 'hero-demo--visible' : ''}`}>
            {/* Window chrome */}
            <div className="hero-demo__chrome">
                <div className="hero-demo__dots">
                    <span></span><span></span><span></span>
                </div>
                <div className="hero-demo__title">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search...
                </div>
                <div style={{ width: 40 }}></div> {/* Spacer for balance */}
            </div>

            {/* Main content */}
            <div className="hero-demo__content">
                {/* Stats Row */}
                <div className={`hero-demo__stats ${statsVisible ? 'hero-demo__stats--visible' : ''}`}>
                    <div className="demo-stat">
                        <span className="demo-stat__value">142</span>
                        <span className="demo-stat__label">Total Active</span>
                    </div>
                    <div className="demo-stat">
                        <span className="demo-stat__value" style={{ color: '#60A5FA' }}>84</span>
                        <span className="demo-stat__label">In Progress</span>
                    </div>
                    <div className="demo-stat">
                        <span className="demo-stat__value" style={{ color: '#4ADE80' }}>29</span>
                        <span className="demo-stat__label">Won Deals</span>
                    </div>
                    <div className="demo-stat">
                        <span className="demo-stat__value" style={{ color: '#FBBF24' }}>18%</span>
                        <span className="demo-stat__label">Conversion</span>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="hero-demo__table">
                    <div className="demo-table__header">
                        <span>Organization</span>
                        <span>Stage</span>
                        <span>Sector</span>
                        <span>Priority</span>
                    </div>
                    {DEMO_LEADS.map((lead, i) => (
                        <div
                            key={lead.name}
                            className="demo-table__row"
                            style={{ animationDelay: `${1000 + i * 120}ms` }}
                        >
                            <span className="demo-table__name">{lead.name}</span>
                            <span className="demo-table__stage">{lead.stage}</span>
                            <span className="demo-table__niche">{lead.niche}</span>
                            <span className={`demo-table__priority demo-table__priority--${lead.priority.toLowerCase()}`}>
                                {lead.priority}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating cursor SVG */}
            <div className="hero-demo__cursor">
                <svg viewBox="0 0 24 24">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                </svg>
                <div className="cursor-label">Sarah is viewing</div>
            </div>
        </div>
    );
}
