import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import '../styles/landing.css';
import { LayoutDashboard, BarChart3, X, ArrowRight, Zap, Target, Star, TrendingDown, Clock, FileX } from 'lucide-react';
import { PricingSection } from '../components/pricing/PricingSection';
import { HeroDemo } from '../components/landing/HeroDemo';


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
                <button className="btn-landing-outline" onClick={toggleAuth}>Sign In</button>
            </nav>

            {/* HERO SECTION */}
            <header className="landing-hero">
                <div className="landing-hero-content">
                    <div className="trust-badge animate-fade-in">
                        <span className="trust-stars">★★★★★</span>
                        <span className="trust-text">Trusted by 500+ Freelancers</span>
                    </div>
                    <h1 className="landing-title animate-fade-in-up">
                        Stop Losing Leads in <br />
                        <span className="highlight-text">Messy Spreadsheets</span>
                    </h1>
                    <p className="landing-subtitle animate-fade-in-up delay-100">
                        The simple CRM for freelancers who want to close more deals without the chaos.
                        Organize, track, and follow up in seconds.
                    </p>
                    <div className="landing-cta-wrapper animate-fade-in-up delay-200">
                        <button className="btn-landing-primary" onClick={toggleAuth}>
                            Start Closing More Deals <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                        <p className="cta-subtext">No credit card required · Free 14-day trial</p>
                    </div>
                </div>
                <div className="landing-hero-demo animate-fade-in-up delay-300">
                    <HeroDemo />
                </div>
            </header>

            {/* PAIN SECTION */}
            <section className="landing-pain">
                <div className="section-container">
                    <h2 className="section-title text-center">Is your manual process holding you back?</h2>
                    <div className="pain-grid">
                        <div className="pain-card">
                            <div className="pain-icon-wrapper"><FileX className="pain-icon" /></div>
                            <h3>Leads slipping away</h3>
                            <p>Without a system, valuable opportunities get buried in your inbox or lost in spreadsheet rows.</p>
                        </div>
                        <div className="pain-card">
                            <div className="pain-icon-wrapper"><TrendingDown className="pain-icon" /></div>
                            <h3>Unpredictable revenue</h3>
                            <p>No visibility into your pipeline means you can't forecast income or plan for the future.</p>
                        </div>
                        <div className="pain-card">
                            <div className="pain-icon-wrapper"><Clock className="pain-icon" /></div>
                            <h3>Hours of busywork</h3>
                            <p>Manual data entry eats up the time you should be spending on client work and strategy.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOLUTION SECTION */}
            <section id="features" className="landing-solution">
                <div className="section-container">
                    <h2 className="section-title text-center">A smarter way to manage your business</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Target /></div>
                            <h3 className="feature-title">Total Pipeline Clarity</h3>
                            <p className="feature-desc">See exactly where every deal stands. Drag and drop leads through stages and know who to call next.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Zap /></div>
                            <h3 className="feature-title">Fast & Flexible</h3>
                            <p className="feature-desc">Customizable fields that adapt to YOUR niche. Whether you sell design, code, or consulting.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><BarChart3 /></div>
                            <h3 className="feature-title">Automatic Insights</h3>
                            <p className="feature-desc">Know your conversion rates and projected revenue instantly. Make decisions based on data.</p>
                        </div>
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
                    <p className="cta-subtext-white">No setup fees · Cancel anytime</p>
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
                            <LayoutDashboard className="h-5 w-5 text-blue-600" />
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
                                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                                <p className="text-gray-500">Sign in to your account</p>
                            </div>
                            <Auth
                                supabaseClient={supabase}
                                appearance={{
                                    theme: ThemeSupa,
                                    variables: { default: { colors: { brand: '#2563eb', brandAccent: '#1d4ed8' } } },
                                }}
                                providers={[]}
                                theme="light"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}

