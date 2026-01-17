import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

interface Subscription {
    status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'free';
    plan: 'free' | 'pro' | 'team';
    current_period_end: string | null;
    stripe_customer_id: string | null;
}

interface SubscriptionLimits {
    maxLeads: number;
    maxCustomFields: number;
    canExport: boolean;
    canUseApi: boolean;
    hasAdvancedAnalytics: boolean;
}

const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
    free: {
        maxLeads: 100,
        maxCustomFields: 3,
        canExport: true,
        canUseApi: false,
        hasAdvancedAnalytics: false,
    },
    pro: {
        maxLeads: Infinity,
        maxCustomFields: Infinity,
        canExport: true,
        canUseApi: true,
        hasAdvancedAnalytics: true,
    },
    team: {
        maxLeads: Infinity,
        maxCustomFields: Infinity,
        canExport: true,
        canUseApi: true,
        hasAdvancedAnalytics: true,
    },
};

export function useSubscription() {
    const { data: subscription, isLoading, error } = useQuery({
        queryKey: ['subscription'],
        queryFn: async (): Promise<Subscription> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return {
                    status: 'free',
                    plan: 'free',
                    current_period_end: null,
                    stripe_customer_id: null,
                };
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching subscription:', error);
            }

            return data || {
                status: 'free',
                plan: 'free',
                current_period_end: null,
                stripe_customer_id: null,
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const plan = subscription?.plan || 'free';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const isPro = plan === 'pro' || plan === 'team';
    const isTrialing = subscription?.status === 'trialing';
    const isActive = subscription?.status === 'active' || isTrialing;

    const checkLimit = (current: number, limitType: 'maxLeads' | 'maxCustomFields') => {
        const max = limits[limitType];
        return {
            current,
            max,
            isAtLimit: current >= max,
            remaining: Math.max(0, max - current),
            percentage: max === Infinity ? 0 : (current / max) * 100,
        };
    };

    return {
        subscription,
        isLoading,
        error,
        plan,
        limits,
        isPro,
        isTrialing,
        isActive,
        checkLimit,
    };
}

export function usePlanFeature(feature: keyof SubscriptionLimits) {
    const { limits } = useSubscription();
    return limits[feature];
}
