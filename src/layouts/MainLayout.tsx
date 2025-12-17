import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import './MainLayout.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function MainLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);
    const [pinnedNiches] = useLocalStorage<string[]>('pinned_niches', []);
    const [pinnedCities] = useLocalStorage<string[]>('pinned_cities', []);

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

                    <div className="my-2 border-t border-[var(--border-subtle)]"></div>

                    {/* Niches */}
                    <NavLink to="/niches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "All Niches" : ""}>
                        <Briefcase size={16} className="nav-icon" /> {!isCollapsed && "All Niches"}
                    </NavLink>

                    {!isCollapsed && pinnedNiches.length > 0 && (
                        <div className="nav-section-content mt-1">
                            {pinnedNiches.map(niche => (
                                <NavLink
                                    key={niche}
                                    to={`/leads?niche=${encodeURIComponent(niche)}`}
                                    className={() => `nav-item-sub ${location.search.includes(niche) ? 'active' : ''}`}
                                    title={niche}
                                >
                                    <span className="truncate">{niche}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}

                    <div className="my-2 border-t border-[var(--border-subtle)]"></div>

                    {/* Cities */}
                    <NavLink to="/cities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "All Cities" : ""}>
                        <MapPin size={16} className="nav-icon" /> {!isCollapsed && "All Cities"}
                    </NavLink>

                    {!isCollapsed && pinnedCities.length > 0 && (
                        <div className="nav-section-content mt-1">
                            {pinnedCities.map(city => (
                                <NavLink
                                    key={city}
                                    to={`/leads?city=${encodeURIComponent(city)}`}
                                    className={() => `nav-item-sub ${location.search.includes(city) ? 'active' : ''}`}
                                    title={city}
                                >
                                    <span className="truncate">{city}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
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
