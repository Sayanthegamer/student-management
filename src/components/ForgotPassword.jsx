import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#CCFF00] selection:text-black">
            <div className="max-w-md w-full bg-[#0a0a0a] p-8 md:p-10 border-2 border-white/40">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#CCFF00] hover:text-white font-bold uppercase tracking-wider mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="text-center mb-8 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 border-2 border-[#CCFF00] bg-[#CCFF00] flex items-center justify-center mx-auto mb-6">
                        <Mail className="text-black" size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                        Reset Password
                    </h1>
                    <p className="text-white/50 text-sm font-mono">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 flex items-start gap-3 border ${status === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500' : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]'}`}>
                        {status === 'error' ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle size={20} className="shrink-0 mt-0.5" />}
                        <span className="text-sm font-bold tracking-wide uppercase">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-white uppercase tracking-widest mb-3">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-4 bg-[#050505] border-2 border-white/40 text-white focus:border-[#CCFF00] transition-colors outline-none text-sm font-medium"
                            placeholder="ADMIN@INSTITUTION.EDU"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 px-4 bg-[#CCFF00] border-2 border-[#CCFF00] hover:bg-white hover:border-white text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
