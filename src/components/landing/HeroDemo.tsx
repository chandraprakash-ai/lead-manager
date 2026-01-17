import { useEffect, useState } from 'react';
import './HeroDemo.css';

// Premium demo data - feels real
const DEMO_LEADS = [
    { name: 'Velocity Ventures', stage: 'Proposal', niche: 'SaaS', priority: 'High' },
    { name: 'Atlas Coffee Labs', stage: 'Interested', niche: 'F&B', priority: 'Medium' },
    { name: 'Meridian Health', stage: 'Contacting', niche: 'Healthcare', priority: 'High' },
    { name: 'Nexus Consulting', stage: 'New', niche: 'Consulting', priority: 'Low' },
];

const STAGE_COLORS: Record<string, string> = {
    New: '#52525b',
    Contacting: '#3b82f6',
    Interested: '#a855f7',
    Proposal: '#f59e0b',
    Closed: '#22c55e',
};

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
                <div className="hero-demo__title">Pipeline Overview</div>
            </div>

            {/* Main content */}
            <div className="hero-demo__content">
                {/* Stats Row */}
                <div className={`hero-demo__stats ${statsVisible ? 'hero-demo__stats--visible' : ''}`}>
                    <div className="demo-stat">
                        <span className="demo-stat__value">147</span>
                        <span className="demo-stat__label">Total Leads</span>
                    </div>
                    <div className="demo-stat demo-stat--blue">
                        <span className="demo-stat__value">89</span>
                        <span className="demo-stat__label">Contacted</span>
                    </div>
                    <div className="demo-stat demo-stat--green">
                        <span className="demo-stat__value">31</span>
                        <span className="demo-stat__label">Closed</span>
                    </div>
                    <div className="demo-stat demo-stat--amber">
                        <span className="demo-stat__value">21%</span>
                        <span className="demo-stat__label">Conv. Rate</span>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="hero-demo__table">
                    <div className="demo-table__header">
                        <span>Company</span>
                        <span>Stage</span>
                        <span>Industry</span>
                        <span>Priority</span>
                    </div>
                    {DEMO_LEADS.map((lead, i) => (
                        <div
                            key={lead.name}
                            className="demo-table__row"
                            style={{ animationDelay: `${1000 + i * 120}ms` }}
                        >
                            <span className="demo-table__name">{lead.name}</span>
                            <span
                                className="demo-table__stage"
                                style={{
                                    backgroundColor: `${STAGE_COLORS[lead.stage]}15`,
                                    color: STAGE_COLORS[lead.stage],
                                    border: `1px solid ${STAGE_COLORS[lead.stage]}30`
                                }}
                            >
                                {lead.stage}
                            </span>
                            <span className="demo-table__niche">{lead.niche}</span>
                            <span className={`demo-table__priority demo-table__priority--${lead.priority.toLowerCase()}`}>
                                {lead.priority}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating cursor */}
            <div className="hero-demo__cursor"></div>
        </div>
    );
}
