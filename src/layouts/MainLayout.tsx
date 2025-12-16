import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NicheCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function MainLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);

    const niches: NicheCategory[] = ['Cafe', 'Gym', 'Clinic', 'Other'];
    const cities = ['Vadodara', 'Ahmedabad', 'Jaipur', 'Mumbai'];

    return (
        <div className="app-layout">
            <aside className={`sidebar transition-all duration-300 ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}`} style={{ width: isCollapsed ? '60px' : '240px' }}>
                <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                    {!isCollapsed && (
                        <h2 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            <Users size={18} /> LeadTrack
                        </h2>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-gray-900 p-1">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
                        <LayoutDashboard size={16} style={{ minWidth: '16px' }} /> {!isCollapsed && "Dashboard"}
                    </NavLink>

                    <NavLink to="/leads" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "All Leads" : ""}>
                        <Users size={16} style={{ minWidth: '16px' }} /> {!isCollapsed && "All Leads"}
                    </NavLink>

                    {!isCollapsed && <div className="nav-section-title">Niches</div>}
                    {niches.map(niche => (
                        <NavLink
                            key={niche}
                            to={`/leads?niche=${niche}`}
                            className={() => `nav-item ${location.search.includes(niche) ? 'active' : ''}`}
                            title={isCollapsed ? niche : ""}
                        >
                            <Briefcase size={14} style={{ minWidth: '14px' }} /> {!isCollapsed && niche}
                        </NavLink>
                    ))}

                    {!isCollapsed && <div className="nav-section-title">Cities</div>}
                    {cities.map(city => (
                        <NavLink
                            key={city}
                            to={`/leads?city=${city}`}
                            className={() => `nav-item ${location.search.includes(city) ? 'active' : ''}`}
                            title={isCollapsed ? city : ""}
                        >
                            <MapPin size={14} style={{ minWidth: '14px' }} /> {!isCollapsed && city}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: isCollapsed ? 'none' : 'block' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Internal Ops Tool
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
