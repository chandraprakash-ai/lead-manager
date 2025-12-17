import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Outlet } from 'react-router-dom';

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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
                <div style={{ maxWidth: '400px', width: '100%', padding: '32px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Welcome Back</h2>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Sign in to manage your leads</p>
                    </div>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#2563eb', // Blue
                                        brandAccent: '#1d4ed8',
                                    },
                                },
                            },
                        }}
                        providers={[]}
                        theme="light"
                    />
                </div>
            </div>
        );
    }

    return <Outlet />;
}
