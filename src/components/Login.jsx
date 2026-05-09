import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Loader2, GraduationCap, ShieldCheck, Mail, Lock } from 'lucide-react';
import { sendErrorTelemetry } from '../utils/telemetry';

/**
 * Component for user authentication, handling both login and signup flows.
 *
 * @returns {JSX.Element} The rendered login component.
 */
export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { user } = await signUp(email, password);
        if (user && user.identities && user.identities.length === 0) {
            setError('This email is already registered. Please log in.');
        } else {
            setMessage('Account created! Please check your email for confirmation or proceed to log in.');
            setIsLogin(true);
        }
      }
    } catch (err) {
      // Security: Do not expose raw internal error messages. Use a generic message.
      console.error('Authentication error occurred');
      sendErrorTelemetry('Login.handleSubmit', err);
      if (isLogin && (err.message === 'Email not confirmed' || err.code === 'email_not_confirmed' || err.name === 'EmailNotConfirmed')) {
        setError('Please confirm your email address before logging in.');
      } else {
        setError(isLogin ? 'Invalid email or password.' : (err.message || 'Registration failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 selection:bg-[var(--accent-primary)] selection:text-white gradient-mesh">
      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 fade-in-up">
          <div className="w-16 h-16 rounded-[20px] bg-[var(--accent-primary)] border border-[var(--accent-primary)] flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300 shadow-lg shadow-[var(--accent-primary)]/25">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-medium text-[var(--text-primary)] tracking-widest uppercase">STD::MGR</h1>
          <p className="text-[var(--accent-primary)] font-mono mt-2 text-sm">ACCESS PORTAL ///</p>
        </div>

        <div 
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 sm:p-8 md:p-10 transition-all duration-300 glow-accent fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-8 border-b border-[var(--border-color)] pb-6">
            <h2 className="text-2xl font-medium text-[var(--text-primary)] uppercase tracking-tight">
              {isLogin ? 'Initialize Session' : 'Register Administrator'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 font-mono">
              {isLogin ? 'Enter credentials to proceed.' : 'Set up credentials to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 flex items-start gap-3 text-sm border border-rose-500/20 rounded-[12px] fade-in-up">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-bold tracking-wide uppercase">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-start gap-3 text-sm border border-[var(--accent-primary)]/20 rounded-[12px] fade-in-up">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <p className="font-bold tracking-wide uppercase">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="fade-in-up" style={{ animationDelay: '0.15s' }}>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--text-secondary)] mb-3">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-primary)]" />
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all outline-none text-sm font-medium"
                  placeholder="admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="password" className="block text-xs font-medium text-[var(--text-secondary)] mb-3">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-primary)]" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={isLogin ? undefined : 8}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-[10px] text-[var(--text-muted)] font-mono tracking-wide uppercase">Minimum 8 characters</p>
              )}
            </div>

            <div className="fade-in-up" style={{ animationDelay: '0.25s' }}>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full py-5 px-4 mt-2 bg-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] text-white font-medium rounded-[12px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden active:scale-[0.98] shadow-md shadow-[var(--accent-primary)]/20 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span aria-live="polite">{isLogin ? 'Logging in…' : 'Registering…'}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer-sweep 1.5s ease-in-out infinite' }} />
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform stroke-[3px]" /> : <UserPlus size={20} className="group-hover:scale-110 transition-transform stroke-[3px]" />}
                    {isLogin ? 'Log In' : 'Register'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            {isLogin && (
              <Link to="/forgot-password" className="text-sm border-b border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] font-bold uppercase tracking-wide transition-all">
                  Forgot password?
              </Link>
            )}

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all uppercase tracking-wide"
            >
              {isLogin ? (
                <span>New? <span className="text-[var(--accent-primary)] hover:text-[var(--text-primary)] border-b border-[var(--accent-primary)]/30">Create Account</span></span>
              ) : (
                <span>Registered? <span className="text-[var(--accent-primary)] hover:text-[var(--text-primary)] border-b border-[var(--accent-primary)]/30">Log In</span></span>
              )}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}
