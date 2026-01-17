import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Outlet } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

export default function AuthLayout() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we are handling a redirect from email
        // Supports both Implicit flow (hash) and PKCE flow (search query param 'code')
        const isAuthRedirect =
            (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error_description'))) ||
            (window.location.search && window.location.search.includes('code='));

        if (isAuthRedirect) {
            setLoading(true);
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            // Only stop loading if we aren't waiting for a redirect hash to be processed
            // The onAuthStateChange below will handle the hash processing
            if (!isAuthRedirect) {
                setLoading(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false); // Auth state resolved (signed in or not)
        });

        return () => subscription.unsubscribe();
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


    if (!session) {
        return <LandingPage />;
    }

    return <Outlet />;
}
