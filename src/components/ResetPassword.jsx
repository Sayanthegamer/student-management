import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Verification: Ensure user is actually authenticated (via the magic link)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, the magic link might be invalid or expired
                navigate('/login');
            }
        });
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            showToast('Password updated successfully! You can now log in.', 'success');
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 selection:bg-[var(--accent-primary)] selection:text-white">
            <div className="max-w-md w-full bg-[var(--bg-card)] p-8 md:p-10 border border-[var(--border-color)]">
                <div className="text-center mb-8 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 border border-[var(--accent-primary)] bg-[var(--accent-primary)] flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-medium text-white uppercase tracking-tight mb-2">
                        Set New Password
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm font-mono">
                        Please verify your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 flex items-start gap-3 border bg-rose-500/10 text-rose-500 border-rose-500">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span className="text-sm font-bold tracking-wide uppercase">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-white  mb-3">NEW PASSWORD</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] text-white focus:border-[var(--accent-primary)] transition-colors outline-none text-sm font-medium"
                            placeholder="MINIMUM 6 CHARACTERS"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 px-4 bg-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] text-white font-medium  transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
