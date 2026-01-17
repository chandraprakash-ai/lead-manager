import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/common/Toast';
import { User, Mail, Lock, Download, Trash2, Save, Loader2, Shield } from 'lucide-react';
import './SettingsPage.css';

interface UserProfile {
    email: string;
    full_name: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({ email: '', full_name: '' });
    const [_currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || '',
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: profile.full_name }
            });

            if (error) throw error;
            success('Profile Updated', 'Your profile has been saved successfully.');
        } catch (err: any) {
            showError('Update Failed', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showError('Password Mismatch', 'New passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            showError('Weak Password', 'Password must be at least 8 characters.');
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            success('Password Changed', 'Your password has been updated.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showError('Password Change Failed', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const { data: leads, error } = await supabase
                .from('leads')
                .select('*');

            if (error) throw error;

            const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leadmanager-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            success('Export Complete', 'Your data has been downloaded.');
        } catch (err: any) {
            showError('Export Failed', err.message);
        }
    };

    const handleDeleteAccount = async () => {
        // Note: Full account deletion requires a server-side function for security
        showError('Contact Support', 'Please email support@leadmanager.app to delete your account.');
        setShowDeleteConfirm(false);
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-loading">
                    <Loader2 size={32} className="animate-spin" />
                    <p>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and security</p>
            </div>

            <div className="settings-grid">
                {/* Profile Section */}
                <section className="settings-section">
                    <div className="settings-section__header">
                        <User size={20} />
                        <div>
                            <h2>Profile</h2>
                            <p>Your personal information</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                className="input"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-readonly">
                                <Mail size={16} />
                                <span>{profile.email}</span>
                            </div>
                            <p className="form-hint">Email cannot be changed. Contact support if needed.</p>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </form>
                </section>

                {/* Security Section */}
                <section className="settings-section">
                    <div className="settings-section__header">
                        <Shield size={20} />
                        <div>
                            <h2>Security</h2>
                            <p>Password and authentication</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                className="input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                minLength={8}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving || !newPassword}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                            Change Password
                        </button>
                    </form>
                </section>

                {/* Data & Privacy Section */}
                <section className="settings-section">
                    <div className="settings-section__header">
                        <Download size={20} />
                        <div>
                            <h2>Data & Privacy</h2>
                            <p>Export your data or delete your account</p>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <div className="settings-action">
                            <div className="settings-action__info">
                                <h3>Export Your Data</h3>
                                <p>Download all your leads and settings as a JSON file.</p>
                            </div>
                            <button className="btn" onClick={handleExportData}>
                                <Download size={16} />
                                Export
                            </button>
                        </div>

                        <div className="settings-action settings-action--danger">
                            <div className="settings-action__info">
                                <h3>Delete Account</h3>
                                <p>Permanently delete your account and all data. This cannot be undone.</p>
                            </div>
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon modal-icon--danger">
                            <Trash2 size={24} />
                        </div>
                        <h2>Delete Account?</h2>
                        <p>
                            This will permanently delete your account, all your leads, and custom fields.
                            This action cannot be reversed.
                        </p>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteAccount}>
                                Yes, Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
