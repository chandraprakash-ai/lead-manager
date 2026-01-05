import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import '../styles/landing.css';
import { LayoutDashboard, BarChart3, X, ArrowRight, Zap, Target } from 'lucide-react';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);

    const toggleAuth = () => setShowAuth(!showAuth);

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-logo">
                    <LayoutDashboard className="h-6 w-6 text-blue-600" />
                    <span>LeadManager</span>
                </div>
                <button className="btn-landing-outline" onClick={toggleAuth}>
                    Sign In
                </button>
            </nav>

            <header className="landing-hero">
                <div className="landing-hero-content">
                    <h1 className="landing-title">
                        Master Your Leads, <br />
                        <span style={{ color: '#2563eb' }}>Grow Your Business</span>
                    </h1>
                    <p className="landing-subtitle">
                        The all-in-one CRM designed for modern freelancers and agencies.
                        Track, manage, and convert leads with an interface that feels like magic.
                    </p>
                    <div className="landing-cta-group">
                        <button className="btn-landing-primary" onClick={toggleAuth}>
                            Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                        <button className="btn-landing-outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                            Learn More
                        </button>
                    </div>
                </div>
                <div className="landing-image-container">
                    <img
                        src="/hero-image.png"
                        alt="Lead Manager Dashboard"
                        className="landing-image"
                    />
                </div>
            </header>

            <section id="features" className="landing-features">
                <div className="max-w-6xl mx-auto px-4 mb-16 text-center">
                    <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
                    <p className="text-gray-500 text-lg">Powerful features wrapped in a simple, intuitive design.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Target />
                        </div>
                        <h3 className="feature-title">Smart Lead Tracking</h3>
                        <p className="feature-desc">
                            Visualize your pipeline with our intuitive kanban and list views. Never miss a follow-up again.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap />
                        </div>
                        <h3 className="feature-title">Custom Fields</h3>
                        <p className="feature-desc">
                            Every business is unique. Adapt the CRM to your needs with flexible custom data fields.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <BarChart3 />
                        </div>
                        <h3 className="feature-title">Real-time Analytics</h3>
                        <p className="feature-desc">
                            Gain insights into your conversion rates and deal flow with beautiful, real-time charts.
                        </p>
                    </div>
                </div>
            </section>

            {/* Auth Overlay */}
            {showAuth && (
                <div className="auth-overlay" onClick={toggleAuth}>
                    <div className="auth-card" onClick={e => e.stopPropagation()}>
                        <button className="auth-close" onClick={toggleAuth}>
                            <X />
                        </button>
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-gray-500">Sign in to your account</p>
                        </div>
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: '#2563eb',
                                            brandAccent: '#1d4ed8',
                                        },
                                    },
                                },
                            }}
                            providers={[]} // Add providers if configured
                            theme="light"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
