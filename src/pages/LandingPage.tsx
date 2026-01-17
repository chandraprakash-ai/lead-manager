import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import '../styles/landing.css';
import { LayoutDashboard, BarChart3, X, ArrowRight, Zap, Target, Star, TrendingDown } from 'lucide-react';
import { PricingSection } from '../components/pricing/PricingSection';
import { HeroDemo } from '../components/landing/HeroDemo';


export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const toggleAuth = () => setShowAuth(!showAuth);

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-logo">
                    <LayoutDashboard className="h-6 w-6 text-blue-500" />
                    <span>LeadManager</span>
                </div>
                <button className="btn-landing-outline" onClick={toggleAuth}>Sign In</button>
            </nav>

            {/* HERO SECTION */}
            <header className="landing-hero">
                <div className="landing-hero-content">
                    <div className="trust-badge animate-fade-in">
                        <span className="trust-stars">★★★★★</span>
                        <span className="trust-text">Loved by 500+ Freelancers</span>
                    </div>
                    <h1 className="landing-title animate-fade-in-up">
                        Your Workflow,<br />
                        <span className="highlight-text">Supercharged.</span>
                    </h1>
                    <p className="landing-subtitle animate-fade-in-up delay-100">
                        Stop juggling spreadsheets. Manage leads, track your pipeline, and close more deals with a tool designed for speed and clarity.
                    </p>
                    <div className="landing-cta-wrapper animate-fade-in-up delay-200">
                        <button className="btn-landing-primary" onClick={toggleAuth}>
                            Start for Free <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="landing-hero-demo animate-fade-in-up delay-300">
                    <HeroDemo />
                </div>
            </header>

            {/* BENTO FEATURES */}
            <section id="features" className="landing-features">
                <h2 className="section-title">Everything you need to grow</h2>
                <div className="bento-grid">
                    {/* Card 1: Pipeline - Large */}
                    <div className="bento-card large">
                        <div className="bento-icon"><BarChart3 /></div>
                        <h3 className="bento-title">Visual Pipeline</h3>
                        <p className="bento-desc">See your entire sales funnel at a glance. Drag and drop deals as they progress from 'New' to 'Closed'. Never lose track of a lead again.</p>
                        <div className="bento-visual">
                            {/* Visual representation handled by CSS/Image */}
                            <img src="/pipeline-preview.png" alt="Pipeline" className="absolute inset-0 w-full h-full object-cover opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    </div>

                    {/* Card 2: Speed - Small */}
                    <div className="bento-card">
                        <div className="bento-icon"><Zap /></div>
                        <h3 className="bento-title">Built for Speed</h3>
                        <p className="bento-desc">Keyboard shortcuts, instant search, and zero lag. Designed for power users who hate waiting.</p>
                    </div>

                    {/* Card 3: Organization - Small */}
                    <div className="bento-card">
                        <div className="bento-icon"><Target /></div>
                        <h3 className="bento-title">Niche Targeting</h3>
                        <p className="bento-desc">Organize leads by specific niches or industries. Tailor your pitch and track what's converting best.</p>
                    </div>

                    {/* Card 4: Analytics - Large */}
                    <div className="bento-card large">
                        <div className="bento-icon"><TrendingDown /></div>
                        <h3 className="bento-title">Automatic Insights</h3>
                        <p className="bento-desc">We calculate conversion rates, projected revenue, and deal velocity automatically. Make data-driven decisions without the math.</p>
                    </div>
                </div>
            </section>

            {/* PROOF SECTION */}
            <section className="landing-proof">
                <div className="section-container">
                    <h2 className="section-title text-center">Loved by modern freelancers</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="stars flex gap-1 mb-3 text-yellow-400">
                                <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
                            </div>
                            <p className="quote">"I used to track everything in Excel. Since switching, I've doubled my close rate because I never miss a follow-up."</p>
                            <div className="author">
                                <div className="avatar">SD</div>
                                <div>
                                    <div className="name">Sarah Davis</div>
                                    <div className="role">Freelance Designer</div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="stars flex gap-1 mb-3 text-yellow-400">
                                <Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} /><Star fill="currentColor" size={16} />
                            </div>
                            <p className="quote">"Simple, fast, and does exactly what it promises. It's the only tool I keep open all day."</p>
                            <div className="author">
                                <div className="avatar">MJ</div>
                                <div>
                                    <div className="name">Mike Johnson</div>
                                    <div className="role">Marketing Consultant</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Logos placeholder */}
                    <div className="logos-strip">
                        <span className="logo-text">Trusted by folks at:</span>
                        <div className="logo-placeholder">Acme Corp</div>
                        <div className="logo-placeholder">Stark Industries</div>
                        <div className="logo-placeholder">Wayne Ent</div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="landing-cta-final">
                <div className="cta-container">
                    <h2>Ready to organize your chaos?</h2>
                    <p>Join 500+ freelancers managing their leads the right way.</p>
                    <button className="btn-landing-primary large" onClick={toggleAuth}>
                        Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <p className="cta-subtext">No setup fees · Cancel anytime</p>
                </div>
            </section>

            {/* PRICING SECTION */}
            <PricingSection isLandingPage onSelectPlan={() => toggleAuth()} />

            {/* FAQ SECTION */}
            <section className="landing-faq">
                <div className="section-container">
                    <h2 className="section-title text-center">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>Is there a free trial?</h3>
                            <p>Yes! The Starter plan is free forever with up to 100 leads. Pro plans include a 14-day free trial.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Can I import my existing data?</h3>
                            <p>Absolutely. We support CSV and Excel imports, so you can migrate from spreadsheets in seconds.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Is my data secure?</h3>
                            <p>Yes. All data is encrypted, we use row-level security, and regular backups are performed automatically.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Can I cancel anytime?</h3>
                            <p>Yes, you can cancel your subscription at any time with no questions asked. Your data remains accessible.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <LayoutDashboard className="h-5 w-5 text-blue-500" />
                            <span>LeadManager</span>
                        </div>
                        <p>Simple CRM for freelancers who want to close more deals.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <button onClick={toggleAuth}>Sign In</button>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/terms">Terms of Service</a>
                        </div>
                        <div className="footer-col">
                            <h4>Support</h4>
                            <a href="mailto:support@leadmanager.app">Contact Us</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 LeadManager. All rights reserved.</p>
                </div>
            </footer>

            {/* Auth Overlay */}
            {
                showAuth && (
                    <div className="auth-overlay" onClick={toggleAuth}>
                        <div className="auth-card" onClick={e => e.stopPropagation()}>
                            <button className="auth-close" onClick={toggleAuth}><X /></button>
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                                <p className="text-gray-400">Sign in to your account</p>
                            </div>
                            <Auth
                                supabaseClient={supabase}
                                appearance={{
                                    theme: ThemeSupa,
                                    variables: {
                                        default: {
                                            colors: {
                                                brand: '#3b82f6',
                                                brandAccent: '#2563eb',
                                                inputText: 'white',
                                                inputBackground: '#27272a',
                                                inputBorder: '#3f3f46',
                                                inputLabelText: '#a1a1aa',
                                                inputPlaceholder: '#71717a',
                                            }
                                        }
                                    },
                                }}
                                providers={[]}
                                theme="dark"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}

