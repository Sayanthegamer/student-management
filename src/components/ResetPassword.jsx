import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

            alert('Password updated successfully! You can now log in.');
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-200">
                <div className="text-center mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-indigo-600" size={20} className="md:hidden" />
                        <Lock className="text-indigo-600" size={24} className="hidden md:block" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                        Set New Password
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        Please verify your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-3 border border-rose-100">
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 md:py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 min-h-[48px] touch-manipulation"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
