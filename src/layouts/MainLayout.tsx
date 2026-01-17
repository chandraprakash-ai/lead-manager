import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Briefcase, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import './MainLayout.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserMenu } from '../components/common/UserMenu';
import { supabase } from '../lib/supabaseClient';
import { useSubscription } from '../hooks/useSubscription';
import { WelcomeModal } from '../components/onboarding/WelcomeModal';
import { GuidedTour } from '../components/onboarding/GuidedTour';

export default function MainLayout() {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);
    const [pinnedNiches] = useLocalStorage<string[]>('pinned_niches', []);
    const [pinnedCities] = useLocalStorage<string[]>('pinned_cities', []);
    const [user, setUser] = useState<any>(null);
    const { plan } = useSubscription();

    // Onboarding state
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage('onboarding_complete', false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            // Show welcome modal for new users after a short delay
            if (user && !onboardingComplete) {
                setTimeout(() => setShowWelcome(true), 500);
            }
        });
    }, [onboardingComplete]);

    const handleStartTour = () => {
        setShowWelcome(false);
        setTimeout(() => setShowTour(true), 300);
    };

    const handleSkipOnboarding = () => {
        setShowWelcome(false);
        setOnboardingComplete(true);
    };

    const handleTourComplete = () => {
        setShowTour(false);
        setOnboardingComplete(true);
    };

    return (
        <div className="app-layout">
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <h2 className="brand-logo">
                            <Users size={18} /> LeadManager
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

                    <NavLink to="/leads" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Leads" : ""}>
                        <Users size={16} className="nav-icon" /> {!isCollapsed && "Leads"}
                    </NavLink>

                    {/* Niches */}
                    <NavLink to="/niches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Niches" : ""}>
                        <Briefcase size={16} className="nav-icon" /> {!isCollapsed && "Niches"}
                    </NavLink>

                    {!isCollapsed && pinnedNiches.length > 0 && (
                        <div className="nav-section-content">
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

                    {/* Cities */}
                    <NavLink to="/cities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Cities" : ""}>
                        <MapPin size={16} className="nav-icon" /> {!isCollapsed && "Cities"}
                    </NavLink>

                    {!isCollapsed && pinnedCities.length > 0 && (
                        <div className="nav-section-content">
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

                    {/* Countries */}
                    <NavLink to="/countries" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Countries" : ""}>
                        <Globe size={16} className="nav-icon" /> {!isCollapsed && "Countries"}
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    {user && <UserMenu user={user} plan={plan} />}
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            {/* Onboarding */}
            {showWelcome && (
                <WelcomeModal
                    onStartTour={handleStartTour}
                    onSkip={handleSkipOnboarding}
                />
            )}
            {showTour && (
                <GuidedTour onComplete={handleTourComplete} />
            )}
        </div>
    );
}


