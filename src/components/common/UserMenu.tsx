import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Settings, LogOut, ChevronUp, CreditCard, HelpCircle, Sparkles } from 'lucide-react';
import './UserMenu.css';

interface UserMenuProps {
    user: {
        email?: string;
        user_metadata?: {
            full_name?: string;
            avatar_url?: string;
        };
    };
    plan?: 'free' | 'pro' | 'team';
}

const PLAN_LABELS: Record<string, { label: string; className: string }> = {
    free: { label: 'Free', className: 'plan-badge--free' },
    pro: { label: 'Pro', className: 'plan-badge--pro' },
    team: { label: 'Team', className: 'plan-badge--team' },
};

export function UserMenu({ user, plan = 'free' }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.free;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="user-menu__avatar">
                    {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt={displayName} />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
                <div className="user-menu__info">
                    <span className="user-menu__name">{displayName}</span>
                    <span className={`user-menu__plan ${planInfo.className}`}>
                        {plan !== 'free' && <Sparkles size={10} />}
                        {planInfo.label}
                    </span>
                </div>
                <ChevronUp
                    size={16}
                    className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="user-menu__dropdown" role="menu">
                    <div className="user-menu__header">
                        <div className="user-menu__avatar user-menu__avatar--lg">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt={displayName} />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div>
                            <p className="user-menu__header-name">{displayName}</p>
                            <p className="user-menu__header-email">{user.email}</p>
                        </div>
                    </div>

                    <div className="user-menu__divider" />

                    <button
                        className="user-menu__item"
                        onClick={() => { navigate('/settings'); setIsOpen(false); }}
                        role="menuitem"
                    >
                        <Settings size={16} />
                        Settings
                    </button>

                    <button
                        className="user-menu__item"
                        onClick={() => { navigate('/settings/billing'); setIsOpen(false); }}
                        role="menuitem"
                    >
                        <CreditCard size={16} />
                        Billing
                    </button>

                    <button
                        className="user-menu__item"
                        onClick={() => window.open('mailto:support@leadmanager.app', '_blank')}
                        role="menuitem"
                    >
                        <HelpCircle size={16} />
                        Help & Support
                    </button>

                    <div className="user-menu__divider" />

                    <button
                        className="user-menu__item user-menu__item--danger"
                        onClick={handleLogout}
                        role="menuitem"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

