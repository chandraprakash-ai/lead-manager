import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <div className="legal-nav">
                <Link to="/" className="legal-nav__logo">LeadManager</Link>
            </div>

            <article className="legal-content">
                <header className="legal-header">
                    <h1>Privacy Policy</h1>
                    <p className="legal-date">Last updated: January 17, 2026</p>
                </header>

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        LeadManager ("we", "our", or "us") is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you use our lead management platform.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Information You Provide</h3>
                    <ul>
                        <li><strong>Account Information:</strong> Email address, name, and password when you create an account.</li>
                        <li><strong>Lead Data:</strong> Business contacts, notes, and custom fields you add to the platform.</li>
                        <li><strong>Payment Information:</strong> Billing details processed securely through Stripe.</li>
                        <li><strong>Communications:</strong> Support requests and feedback you send us.</li>
                    </ul>

                    <h3>2.2 Automatically Collected Information</h3>
                    <ul>
                        <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent.</li>
                        <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                        <li><strong>Log Data:</strong> IP addresses, access times, and pages viewed.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use collected information to:</p>
                    <ul>
                        <li>Provide and maintain our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Analyze usage patterns to improve our platform</li>
                        <li>Detect, prevent, and address technical issues</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal information. We may share information with:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> Third parties that help us operate our platform (e.g., Supabase, Stripe).</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures including:
                    </p>
                    <ul>
                        <li>SSL/TLS encryption for all data transmission</li>
                        <li>Row-level security on database access</li>
                        <li>Regular security audits and updates</li>
                        <li>Secure password hashing</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access and export your data at any time from Settings</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your account and data</li>
                        <li>Opt out of marketing communications</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account is active. Upon account deletion,
                        your data is permanently removed within 30 days, except where retention is required
                        by law.
                    </p>
                </section>

                <section>
                    <h2>8. Cookies</h2>
                    <p>
                        We use essential cookies for authentication and session management. We do not use
                        third-party tracking cookies for advertising purposes.
                    </p>
                </section>

                <section>
                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any
                        changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                </section>

                <section>
                    <h2>10. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <p>
                        <strong>Email:</strong> privacy@leadmanager.app<br />
                    </p>
                </section>
            </article>

            <footer className="legal-footer">
                <div className="legal-footer__links">
                    <Link to="/terms">Terms of Service</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/">Back to Home</Link>
                </div>
                <p>© 2026 LeadManager. All rights reserved.</p>
            </footer>
        </div>
    );
}
