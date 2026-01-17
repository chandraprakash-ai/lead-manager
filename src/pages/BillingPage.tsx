import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/common/Toast';
import { PricingSection } from '../components/pricing/PricingSection';
import { CreditCard, Calendar, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './BillingPage.css';

interface Subscription {
    status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'free';
    plan: 'free' | 'pro' | 'team';
    current_period_end: string | null;
    stripe_customer_id: string | null;
}

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const { error: showError, info } = useToast();

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Try to fetch from subscriptions table
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine for new users
                console.error('Error fetching subscription:', error);
            }

            setSubscription(data || {
                status: 'free',
                plan: 'free',
                current_period_end: null,
                stripe_customer_id: null,
            });
        } catch (err) {
            console.error('Subscription fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan: 'free' | 'pro' | 'team') => {
        if (plan === 'free') {
            info('Downgrade', 'To downgrade to Free, please cancel your current subscription.');
            return;
        }

        if (plan === 'team') {
            // Redirect to contact form for Team plan
            window.open('mailto:sales@leadmanager.app?subject=Team Plan Inquiry', '_blank');
            return;
        }

        // For Pro plan, create Stripe checkout session
        setCheckoutLoading(true);

        try {
            // TODO: Call your Supabase Edge Function to create checkout session
            // const { data, error } = await supabase.functions.invoke('create-checkout', {
            //     body: { plan }
            // });

            // For now, show a placeholder message
            info('Coming Soon', 'Stripe integration is being set up. You\'ll be able to upgrade shortly!');
        } catch (err: any) {
            showError('Checkout Error', err.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleManageBilling = async () => {
        if (!subscription?.stripe_customer_id) {
            showError('No Subscription', 'You don\'t have an active subscription to manage.');
            return;
        }

        try {
            // TODO: Call Edge Function to create portal session
            // const { data, error } = await supabase.functions.invoke('create-portal-session');
            info('Coming Soon', 'Billing portal will be available after Stripe integration.');
        } catch (err: any) {
            showError('Error', err.message);
        }
    };

    if (loading) {
        return (
            <div className="billing-page">
                <div className="billing-loading">
                    <Loader2 size={32} className="animate-spin" />
                    <p>Loading billing information...</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { class: string; label: string }> = {
            active: { class: 'badge--success', label: 'Active' },
            trialing: { class: 'badge--info', label: 'Trial' },
            canceled: { class: 'badge--warning', label: 'Canceled' },
            past_due: { class: 'badge--danger', label: 'Past Due' },
            free: { class: 'badge--neutral', label: 'Free' },
        };
        const badge = badges[status] || badges.free;
        return <span className={`badge ${badge.class}`}>{badge.label}</span>;
    };

    const getPlanName = (plan: string) => {
        const names: Record<string, string> = {
            free: 'Starter (Free)',
            pro: 'Pro',
            team: 'Team',
        };
        return names[plan] || plan;
    };

    return (
        <div className="billing-page">
            <div className="billing-header">
                <h1>Billing</h1>
                <p>Manage your subscription and billing details</p>
            </div>

            {/* Current Plan Card */}
            <div className="billing-current">
                <div className="billing-current__header">
                    <div className="billing-current__icon">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2>Current Plan</h2>
                        {getStatusBadge(subscription?.status || 'free')}
                    </div>
                </div>

                <div className="billing-current__details">
                    <div className="billing-detail">
                        <span className="billing-detail__label">Plan</span>
                        <span className="billing-detail__value">{getPlanName(subscription?.plan || 'free')}</span>
                    </div>

                    {subscription?.status !== 'free' && subscription?.current_period_end && (
                        <div className="billing-detail">
                            <span className="billing-detail__label">
                                <Calendar size={14} />
                                {subscription.status === 'trialing' ? 'Trial ends' : 'Next billing date'}
                            </span>
                            <span className="billing-detail__value">
                                {formatDate(subscription.current_period_end)}
                            </span>
                        </div>
                    )}
                </div>

                {subscription?.stripe_customer_id && (
                    <button className="btn billing-manage-btn" onClick={handleManageBilling}>
                        <ExternalLink size={16} />
                        Manage Billing
                    </button>
                )}

                {subscription?.status === 'past_due' && (
                    <div className="billing-alert billing-alert--danger">
                        <AlertCircle size={18} />
                        <div>
                            <strong>Payment Failed</strong>
                            <p>Please update your payment method to continue using Pro features.</p>
                        </div>
                    </div>
                )}

                {subscription?.status === 'trialing' && (
                    <div className="billing-alert billing-alert--info">
                        <CheckCircle size={18} />
                        <div>
                            <strong>You're on a free trial!</strong>
                            <p>Enjoy all Pro features until {formatDate(subscription.current_period_end)}.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Section */}
            <PricingSection
                onSelectPlan={handleSelectPlan}
                currentPlan={subscription?.plan || 'free'}
            />

            {checkoutLoading && (
                <div className="checkout-overlay">
                    <div className="checkout-loading">
                        <Loader2 size={40} className="animate-spin" />
                        <p>Preparing checkout...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
