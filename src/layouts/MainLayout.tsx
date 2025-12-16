import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import './MainLayout.css';
import type { NicheCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function MainLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);

    const niches: NicheCategory[] = ['Cafe', 'Gym', 'Clinic', 'Other'];
    const cities = ['Vadodara', 'Ahmedabad', 'Jaipur', 'Mumbai'];

    return (
        <div className="app-layout">
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <h2 className="brand-logo">
                            <Users size={18} /> LeadTrack
                        </h2>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn-toggle-sidebar">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Dashboard" : ""}>
                        <LayoutDashboard size={16} className="nav-icon" /> {!isCollapsed && "Dashboard"}
                    </NavLink>

                    <NavLink to="/leads" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "All Leads" : ""}>
                        <Users size={16} className="nav-icon" /> {!isCollapsed && "All Leads"}
                    </NavLink>

                    {!isCollapsed && <div className="nav-section-title">Niches</div>}
                    {niches.map(niche => (
                        <NavLink
                            key={niche}
                            to={`/leads?niche=${niche}`}
                            className={() => `nav-item ${location.search.includes(niche) ? 'active' : ''}`}
                            title={isCollapsed ? niche : ""}
                        >
                            <Briefcase size={14} className="nav-icon" /> {!isCollapsed && niche}
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
                            <MapPin size={14} className="nav-icon" /> {!isCollapsed && city}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="footer-text">
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
