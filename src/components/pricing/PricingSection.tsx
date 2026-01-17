import { Check, Sparkles, Zap, Building2 } from 'lucide-react';
import './PricingSection.css';

interface PricingSectionProps {
    onSelectPlan?: (plan: 'free' | 'pro' | 'team') => void;
    currentPlan?: 'free' | 'pro' | 'team';
    isLandingPage?: boolean;
}

const PLANS = [
    {
        id: 'free' as const,
        name: 'Starter',
        icon: Zap,
        price: 0,
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            'Up to 100 leads',
            '3 custom fields',
            'CSV import/export',
            'Basic filtering & sorting',
            'Email support',
        ],
        cta: 'Get Started Free',
        popular: false,
    },
    {
        id: 'pro' as const,
        name: 'Pro',
        icon: Sparkles,
        price: 12,
        period: 'per month',
        description: 'For serious freelancers',
        features: [
            'Unlimited leads',
            'Unlimited custom fields',
            'Advanced analytics',
            'Priority support',
            'Bulk operations',
            'Data export (JSON/CSV/XLSX)',
            'API access',
        ],
        cta: 'Start 14-Day Trial',
        popular: true,
    },
    {
        id: 'team' as const,
        name: 'Team',
        icon: Building2,
        price: 29,
        period: 'per month',
        description: 'For growing teams',
        features: [
            'Everything in Pro',
            'Up to 5 team members',
            'Shared lead database',
            'Role-based permissions',
            'Activity audit log',
            'Dedicated support',
            'Custom integrations',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export function PricingSection({ onSelectPlan, currentPlan, isLandingPage = false }: PricingSectionProps) {
    return (
        <section className={`pricing-section ${isLandingPage ? 'pricing-section--landing' : ''}`}>
            <div className="pricing-header">
                <span className="pricing-badge">Pricing</span>
                <h2 className="pricing-title">Simple, transparent pricing</h2>
                <p className="pricing-subtitle">
                    Start free and scale as you grow. No hidden fees, cancel anytime.
                </p>
            </div>

            <div className="pricing-grid">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrentPlan = currentPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''} ${isCurrentPlan ? 'pricing-card--current' : ''}`}
                        >
                            {plan.popular && (
                                <div className="pricing-card__badge">Most Popular</div>
                            )}

                            <div className="pricing-card__header">
                                <div className="pricing-card__icon">
                                    <Icon size={24} />
                                </div>
                                <h3 className="pricing-card__name">{plan.name}</h3>
                                <p className="pricing-card__description">{plan.description}</p>
                            </div>

                            <div className="pricing-card__price">
                                <span className="pricing-card__amount">
                                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                </span>
                                {plan.price > 0 && (
                                    <span className="pricing-card__period">/{plan.period.replace('per ', '')}</span>
                                )}
                            </div>

                            <ul className="pricing-card__features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>
                                        <Check size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn pricing-card__cta ${plan.popular ? 'btn-primary' : ''}`}
                                onClick={() => onSelectPlan?.(plan.id)}
                                disabled={isCurrentPlan}
                            >
                                {isCurrentPlan ? 'Current Plan' : plan.cta}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="pricing-note">
                All plans include SSL encryption, automatic backups, and 99.9% uptime guarantee.
            </p>
        </section>
    );
}
