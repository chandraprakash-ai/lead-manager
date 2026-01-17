import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import './WelcomeModal.css';

interface WelcomeModalProps {
    onStartTour: () => void;
    onSkip: () => void;
}

export function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`welcome-overlay ${visible ? 'welcome-overlay--visible' : ''}`}>
            <div className="welcome-modal">
                <button className="welcome-close" onClick={onSkip} aria-label="Close">
                    <X size={20} />
                </button>

                <div className="welcome-icon">
                    <Sparkles size={32} />
                </div>

                <h1 className="welcome-title">Welcome to LeadManager!</h1>
                <p className="welcome-subtitle">
                    Your simple CRM is ready. Let's take a quick tour to help you get started.
                </p>

                <div className="welcome-features">
                    <div className="welcome-feature">
                        <span className="welcome-feature__icon">📊</span>
                        <span>Track all your leads in one place</span>
                    </div>
                    <div className="welcome-feature">
                        <span className="welcome-feature__icon">🎯</span>
                        <span>Never miss a follow-up</span>
                    </div>
                    <div className="welcome-feature">
                        <span className="welcome-feature__icon">📈</span>
                        <span>See your pipeline at a glance</span>
                    </div>
                </div>

                <div className="welcome-actions">
                    <button className="welcome-btn welcome-btn--primary" onClick={onStartTour}>
                        Take the Tour <ArrowRight size={16} />
                    </button>
                    <button className="welcome-btn welcome-btn--ghost" onClick={onSkip}>
                        I'll explore on my own
                    </button>
                </div>
            </div>
        </div>
    );
}
