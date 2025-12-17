import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Briefcase, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './MainLayout.css';
import type { NicheCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function MainLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);

    const niches: NicheCategory[] = ['Cafe', 'Gym', 'Clinic', 'Other'];
    const cities = ['Vadodara', 'Ahmedabad', 'Jaipur', 'Mumbai'];

    const [isOpenNiches, setIsOpenNiches] = useState(false);
    const [isOpenCities, setIsOpenCities] = useState(false);

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

                    {/* Niches Section */}
                    <div className="nav-section">
                        {!isCollapsed && (
                            <button
                                className="nav-section-header"
                                onClick={() => setIsOpenNiches(!isOpenNiches)}
                            >
                                <span>Niches</span>
                                {isOpenNiches ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        )}
                        {(!isCollapsed ? isOpenNiches : false) && (
                            <div className="nav-section-content">
                                {niches.map(niche => (
                                    <NavLink
                                        key={niche}
                                        to={`/leads?niche=${niche}`}
                                        className={() => `nav-item-sub ${location.search.includes(niche) ? 'active' : ''}`}
                                    >
                                        <Briefcase size={14} /> {niche}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cities Section */}
                    <div className="nav-section">
                        {!isCollapsed && (
                            <button
                                className="nav-section-header"
                                onClick={() => setIsOpenCities(!isOpenCities)}
                            >
                                <span>Cities</span>
                                {isOpenCities ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        )}
                        {(!isCollapsed ? isOpenCities : false) && (
                            <div className="nav-section-content">
                                {cities.map(city => (
                                    <NavLink
                                        key={city}
                                        to={`/leads?city=${city}`}
                                        className={() => `nav-item-sub ${location.search.includes(city) ? 'active' : ''}`}
                                    >
                                        <MapPin size={14} /> {city}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
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
