import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';


/**
 * ForgotPassword Component
 * 
 * @returns {JSX.Element} The rendered component.
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setMessage('');

        try {
            // The user will be redirected to this URL after clicking the email link
            // We append /reset-password so the router knows where to go
            const redirectTo = `${window.location.origin}/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) throw error;

            setStatus('success');
            setMessage('Check your email for the password reset link.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 selection:bg-[var(--accent-primary)] selection:text-white">
            <div className="max-w-md w-full bg-[var(--bg-card)] p-8 md:p-10 border border-[var(--border-color)]">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:text-[var(--text-primary)] font-bold uppercase tracking-wider mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="text-center mb-8 border-b border-[var(--border-color)] pb-6">
                    <div className="w-12 h-12 border border-[var(--accent-primary)] bg-[var(--accent-primary)] flex items-center justify-center mx-auto mb-6">
                        <Mail className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-medium text-[var(--text-primary)] uppercase tracking-tight mb-2">
                        Reset Password
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm font-mono">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 flex items-start gap-3 border ${status === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]/20'}`}>
                        {status === 'error' ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle size={20} className="shrink-0 mt-0.5" />}
                        <span className="text-sm font-bold tracking-wide uppercase">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-primary)] mb-3">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] transition-colors outline-none text-sm font-medium"
                            placeholder="ADMIN@INSTITUTION.EDU"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 px-4 bg-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] text-white font-medium  transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
