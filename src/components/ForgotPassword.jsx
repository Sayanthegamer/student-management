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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-200">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-4 md:mb-6 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="text-center mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-indigo-600" size={20} className="md:hidden" />
                        <Mail className="text-indigo-600" size={24} className="hidden md:block" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {status === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 md:py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 min-h-[48px] touch-manipulation"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
