import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchLeads } from '../api/leads';
import type { Lead, DealStage } from '../types';
import {
    Users,
    PhoneCall,
    Trophy,
    TrendingUp,
    Calendar,
    AlertCircle,
    Clock,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import './Dashboard.css';

// Deal stage configuration
const DEAL_STAGES: { key: DealStage; label: string; color: string }[] = [
    { key: 'New', label: 'New', color: 'var(--gray-400)' },
    { key: 'Contacting', label: 'Contacting', color: 'var(--primary-400)' },
    { key: 'Interested', label: 'Interested', color: 'var(--primary-500)' },
    { key: 'Proposal', label: 'Proposal', color: 'var(--primary-600)' },
    { key: 'Closed', label: 'Closed', color: 'var(--success-text)' },
    { key: 'Lost', label: 'Lost', color: 'var(--danger-text)' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Compute all stats
    const stats = useMemo(() => {
        if (!leads.length) return null;

        const total = leads.length;
        const contacted = leads.filter(l => l.contacted).length;
        const closed = leads.filter(l => l.deal_stage === 'Closed').length;
        const lost = leads.filter(l => l.deal_stage === 'Lost').length;
        const conversionRate = total > 0 ? ((closed / total) * 100) : 0;
        const contactRate = total > 0 ? ((contacted / total) * 100) : 0;

        // Pipeline by stage
        const pipeline = DEAL_STAGES.map(stage => ({
            ...stage,
            count: leads.filter(l => l.deal_stage === stage.key).length,
        }));
        const maxPipeline = Math.max(...pipeline.map(p => p.count), 1);

        // Leads by niche
        const nicheMap = leads.reduce((acc, l) => {
            const niche = l.niche || 'Other';
            acc[niche] = (acc[niche] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const niches = Object.entries(nicheMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        const maxNiche = Math.max(...niches.map(n => n.count), 1);

        // Follow-ups
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const followUps = {
            overdue: [] as Lead[],
            today: [] as Lead[],
            tomorrow: [] as Lead[],
            thisWeek: [] as Lead[],
        };

        leads.forEach(lead => {
            if (!lead.follow_up_date || lead.deal_stage === 'Closed' || lead.deal_stage === 'Lost') return;
            const date = new Date(lead.follow_up_date);
            date.setHours(0, 0, 0, 0);

            if (date < today) {
                followUps.overdue.push(lead);
            } else if (date.getTime() === today.getTime()) {
                followUps.today.push(lead);
            } else if (date.getTime() === tomorrow.getTime()) {
                followUps.tomorrow.push(lead);
            } else if (date < weekEnd) {
                followUps.thisWeek.push(lead);
            }
        });

        // High priority active
        const highPriority = leads.filter(
            l => l.priority === 'High' && l.deal_stage !== 'Closed' && l.deal_stage !== 'Lost'
        ).length;

        return {
            total,
            contacted,
            contactRate,
            closed,
            lost,
            conversionRate,
            highPriority,
            pipeline,
            maxPipeline,
            niches,
            maxNiche,
            followUps,
        };
    }, [leads]);

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading__spinner"></div>
                <span>Loading dashboard...</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="dashboard-empty">
                <Users size={48} />
                <h2>No leads yet</h2>
                <p>Start adding leads to see your dashboard insights.</p>
                <button className="btn btn-primary" onClick={() => navigate('/leads')}>
                    Go to Leads
                </button>
            </div>
        );
    }

    const totalFollowUps =
        stats.followUps.overdue.length +
        stats.followUps.today.length +
        stats.followUps.tomorrow.length +
        stats.followUps.thisWeek.length;

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Your lead pipeline at a glance</p>
                </div>
            </header>

            {/* Content Area */}
            <div className="dashboard__content">
                {/* Top Stats Row */}
                <div className="dashboard__stats">
                    <StatCard
                        icon={<Users size={20} />}
                        iconColor="var(--primary-500)"
                        title="Total Pipeline"
                        value={stats.total}
                    />
                    <StatCard
                        icon={<PhoneCall size={20} />}
                        iconColor="var(--info-text)"
                        title="Contacted"
                        value={stats.contacted}
                        subtitle={`${stats.contactRate.toFixed(0)}% reach rate`}
                    />
                    <StatCard
                        icon={<Trophy size={20} />}
                        iconColor="var(--success-text)"
                        title="Closed Deals"
                        value={stats.closed}
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        iconColor="var(--warning-text)"
                        title="Conversion Rate"
                        value={`${stats.conversionRate.toFixed(1)}%`}
                        subtitle={`${stats.lost} lost`}
                    />
                </div>

                {/* Main Grid */}
                <div className="dashboard__grid">
                    {/* Pipeline Funnel */}
                    <div className="dashboard__card">
                        <div className="dashboard__card-header">
                            <h2>Pipeline Funnel</h2>
                            <button className="dashboard__card-action" onClick={() => navigate('/leads')}>
                                View all <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="pipeline-chart">
                            {stats.pipeline.map(stage => (
                                <div key={stage.key} className="pipeline-row">
                                    <span className="pipeline-label">{stage.label}</span>
                                    <div className="pipeline-bar-wrap">
                                        <div
                                            className="pipeline-bar"
                                            style={{
                                                width: `${(stage.count / stats.maxPipeline) * 100}%`,
                                                backgroundColor: stage.color,
                                            }}
                                        />
                                    </div>
                                    <span className="pipeline-count">{stage.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leads by Niche */}
                    <div className="dashboard__card">
                        <div className="dashboard__card-header">
                            <h2>Leads by Niche</h2>
                            <Briefcase size={16} className="text-muted" />
                        </div>
                        <div className="niche-chart">
                            {stats.niches.map(niche => (
                                <div key={niche.name} className="niche-row">
                                    <span className="niche-label">{niche.name}</span>
                                    <div className="niche-bar-wrap">
                                        <div
                                            className="niche-bar"
                                            style={{
                                                width: `${(niche.count / stats.maxNiche) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="niche-count">{niche.count}</span>
                                </div>
                            ))}
                            {stats.niches.length === 0 && (
                                <div className="chart-empty">No niche data</div>
                            )}
                        </div>
                    </div>

                    {/* Follow-up Tracker */}
                    <div className="dashboard__card dashboard__card--followups">
                        <div className="dashboard__card-header">
                            <h2>Follow-ups</h2>
                            <span className="followup-badge">{totalFollowUps}</span>
                        </div>
                        <div className="followup-list">
                            {stats.followUps.overdue.length > 0 && (
                                <FollowUpGroup
                                    icon={<AlertCircle size={14} />}
                                    label="Overdue"
                                    leads={stats.followUps.overdue}
                                    variant="danger"
                                    navigate={navigate}
                                />
                            )}
                            {stats.followUps.today.length > 0 && (
                                <FollowUpGroup
                                    icon={<Clock size={14} />}
                                    label="Today"
                                    leads={stats.followUps.today}
                                    variant="warning"
                                    navigate={navigate}
                                />
                            )}
                            {stats.followUps.tomorrow.length > 0 && (
                                <FollowUpGroup
                                    icon={<Calendar size={14} />}
                                    label="Tomorrow"
                                    leads={stats.followUps.tomorrow}
                                    navigate={navigate}
                                />
                            )}
                            {stats.followUps.thisWeek.length > 0 && (
                                <FollowUpGroup
                                    icon={<Calendar size={14} />}
                                    label="This Week"
                                    leads={stats.followUps.thisWeek}
                                    navigate={navigate}
                                />
                            )}
                            {totalFollowUps === 0 && (
                                <div className="followup-empty">
                                    <Calendar size={24} />
                                    <span>No upcoming follow-ups</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="dashboard__card dashboard__card--quick">
                        <div className="dashboard__card-header">
                            <h2>Quick Stats</h2>
                        </div>
                        <div className="quick-stats">
                            <div className="quick-stat">
                                <span className="quick-stat__value">{stats.highPriority}</span>
                                <span className="quick-stat__label">High Priority Active</span>
                            </div>
                            <div className="quick-stat">
                                <span className="quick-stat__value">{stats.followUps.overdue.length}</span>
                                <span className="quick-stat__label">Overdue Follow-ups</span>
                            </div>
                            <div className="quick-stat">
                                <span className="quick-stat__value">
                                    {leads.filter(l => l.deal_stage === 'Proposal').length}
                                </span>
                                <span className="quick-stat__label">In Proposal Stage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    icon: React.ReactNode;
    iconColor: string;
    title: string;
    value: string | number;
    subtitle?: string;
}

function StatCard({ icon, iconColor, title, value, subtitle }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card__icon" style={{ color: iconColor }}>
                {icon}
            </div>
            <div className="stat-card__content">
                <span className="stat-card__title">{title}</span>
                <span className="stat-card__value">{value}</span>
                {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
            </div>
        </div>
    );
}

// Follow-up Group Component
interface FollowUpGroupProps {
    icon: React.ReactNode;
    label: string;
    leads: Lead[];
    variant?: 'danger' | 'warning';
    navigate: (path: string) => void;
}

function FollowUpGroup({ icon, label, leads, variant, navigate }: FollowUpGroupProps) {
    return (
        <div className={`followup-group ${variant ? `followup-group--${variant}` : ''}`}>
            <div className="followup-group__header">
                {icon}
                <span>{label}</span>
                <span className="followup-group__count">{leads.length}</span>
            </div>
            <div className="followup-group__items">
                {leads.slice(0, 3).map(lead => (
                    <button
                        key={lead.id}
                        className="followup-item"
                        onClick={() => navigate(`/leads?search=${encodeURIComponent(lead.business_name)}`)}
                    >
                        <span className="followup-item__name">{lead.business_name}</span>
                        <span className="followup-item__niche">{lead.niche}</span>
                    </button>
                ))}
                {leads.length > 3 && (
                    <span className="followup-more">+{leads.length - 3} more</span>
                )}
            </div>
        </div>
    );
}
