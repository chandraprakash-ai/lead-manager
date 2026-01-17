import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Outlet } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

export default function AuthLayout() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // Check if we are handling a redirect from email
        // Supports both Implicit flow (hash) and PKCE flow (search query param 'code')
        const isAuthRedirect =
            (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error_description'))) ||
            (window.location.search && window.location.search.includes('code='));

        if (isAuthRedirect) {
            setLoading(true);
        }

        // Safety fallback: If auth hangs (e.g. invalid code), stop loading after 4s
        const timer = setTimeout(() => {
            if (isAuthRedirect) {
                setAuthError("Verification timed out. Link might be expired or invalid.");
            }
            setLoading(false);
        }, 4000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            // If we have a session, great.
            // If we don't, and we ARE waiting for a redirect, keep loading.
            if (!isAuthRedirect) {
                setLoading(false);
                clearTimeout(timer);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session) {
                setSession(session);
                setLoading(false);
                clearTimeout(timer);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#09090b', color: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-400">Verifying...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#09090b', color: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '400px', padding: '2rem' }}>
                    <h2 className="text-xl font-bold text-red-500 mb-2">Login Failed</h2>
                    <p className="text-gray-400 mb-4">{authError}</p>
                    <button
                        onClick={() => { setAuthError(null); window.location.hash = ''; window.location.search = ''; }}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }



    if (!session) {
        return <LandingPage />;
    }

    return <Outlet />;
}
