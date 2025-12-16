import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../api/leads';
import { BarChart3, Users, CheckCircle, XCircle, ListFilter } from 'lucide-react';

export default function Dashboard() {
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(),
        staleTime: Infinity
    });

    if (isLoading) return <div className="p-4">Loading stats...</div>;

    const total = leads?.length || 0;
    const contacted = leads?.filter(l => l.contacted).length || 0;
    const closed = leads?.filter(l => l.deal_stage === 'Closed').length || 0;
    const highPriority = leads?.filter(l => l.priority === 'High' && l.deal_stage !== 'Closed' && l.deal_stage !== 'Lost').length || 0;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <h1>Dashboard</h1>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Operational Overview</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard title="Total Pipeline" value={total} icon={<Users size={20} color="var(--primary-blue)" />} />
                <StatCard title="Contacted Leads" value={contacted} subtext={`${((contacted / total) * 100 || 0).toFixed(0)}% coverage`} icon={<CheckCircle size={20} color="var(--status-green-text)" />} />
                <StatCard title="Closed Deals" value={closed} icon={<BarChart3 size={20} color="var(--text-primary)" />} />
                <StatCard title="High Priority Active" value={highPriority} icon={<ListFilter size={20} color="var(--status-red-text)" />} />
            </div>
        </div>
    );
}

const StatCard = ({ title, value, subtext, icon }: any) => (
    <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
        <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
            {icon}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600 }}>{value}</div>
        {subtext && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{subtext}</div>}
    </div>
);
