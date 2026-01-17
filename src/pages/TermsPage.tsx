import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function TermsPage() {
    return (
        <div className="legal-page">
            <div className="legal-nav">
                <Link to="/" className="legal-nav__logo">LeadManager</Link>
            </div>

            <article className="legal-content">
                <header className="legal-header">
                    <h1>Terms of Service</h1>
                    <p className="legal-date">Last updated: January 17, 2026</p>
                </header>

                <section>
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using LeadManager ("Service"), you agree to be bound by these
                        Terms of Service ("Terms"). If you disagree with any part of these terms,
                        you may not access the Service.
                    </p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>
                        LeadManager is a lead management platform that allows users to organize, track,
                        and manage business leads. Features include lead storage, custom fields,
                        filtering, import/export, and analytics.
                    </p>
                </section>

                <section>
                    <h2>3. User Accounts</h2>
                    <h3>3.1 Account Creation</h3>
                    <p>
                        You must create an account to use the Service. You are responsible for
                        maintaining the confidentiality of your account credentials and for all
                        activities that occur under your account.
                    </p>

                    <h3>3.2 Account Requirements</h3>
                    <ul>
                        <li>You must be at least 18 years old to use the Service</li>
                        <li>You must provide accurate and complete information</li>
                        <li>One person or entity may maintain only one account</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Violate any laws or regulations</li>
                        <li>Infringe on intellectual property rights of others</li>
                        <li>Upload malicious code or attempt to breach security</li>
                        <li>Spam, harass, or abuse others</li>
                        <li>Store sensitive personal data without proper consent</li>
                        <li>Resell or redistribute the Service without authorization</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Subscription and Payments</h2>
                    <h3>5.1 Free and Paid Plans</h3>
                    <p>
                        The Service offers both free and paid subscription plans. Free plans have
                        limited features and capacity. Paid plans unlock additional features as
                        described on our pricing page.
                    </p>

                    <h3>5.2 Billing</h3>
                    <ul>
                        <li>Paid subscriptions are billed monthly or annually in advance</li>
                        <li>Payments are processed securely through Stripe</li>
                        <li>Prices may change with 30 days notice</li>
                    </ul>

                    <h3>5.3 Refunds</h3>
                    <p>
                        We offer a 14-day free trial for paid plans. After the trial period,
                        payments are non-refundable except where required by law.
                    </p>
                </section>

                <section>
                    <h2>6. Data Ownership</h2>
                    <p>
                        You retain all rights to your data. By using the Service, you grant us a
                        limited license to store, process, and display your data solely to provide
                        the Service. We do not claim ownership of your content.
                    </p>
                </section>

                <section>
                    <h2>7. Service Availability</h2>
                    <p>
                        We strive for 99.9% uptime but do not guarantee uninterrupted service.
                        We may suspend the Service for maintenance, updates, or circumstances
                        beyond our control.
                    </p>
                </section>

                <section>
                    <h2>8. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, LeadManager and its affiliates
                        shall not be liable for any indirect, incidental, special, consequential,
                        or punitive damages, or any loss of profits or revenues.
                    </p>
                </section>

                <section>
                    <h2>9. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided "as is" and "as available" without warranties of
                        any kind, either express or implied, including but not limited to implied
                        warranties of merchantability and fitness for a particular purpose.
                    </p>
                </section>

                <section>
                    <h2>10. Termination</h2>
                    <p>
                        We may terminate or suspend your account at any time for violation of
                        these Terms. You may cancel your account at any time through Settings.
                        Upon termination, your right to use the Service will immediately cease.
                    </p>
                </section>

                <section>
                    <h2>11. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will provide
                        notice of significant changes via email or through the Service. Continued
                        use of the Service after changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section>
                    <h2>12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws
                        of [Your Jurisdiction], without regard to its conflict of law provisions.
                    </p>
                </section>

                <section>
                    <h2>13. Contact Information</h2>
                    <p>
                        For questions about these Terms, please contact us at:
                    </p>
                    <p>
                        <strong>Email:</strong> legal@leadmanager.app<br />
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
