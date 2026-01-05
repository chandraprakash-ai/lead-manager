import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Outlet } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

export default function AuthLayout() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
                Loading...
            </div>
        );
    }


    if (!session) {
        return <LandingPage />;
    }

    return <Outlet />;
}
