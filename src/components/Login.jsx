import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Loader2, GraduationCap, ShieldCheck, Mail, Lock } from 'lucide-react';

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#CCFF00] border border-[#CCFF00] flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <GraduationCap size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">STD::MGR</h1>
          <p className="text-[#CCFF00] font-mono mt-2 text-sm">ACCESS PORTAL ///</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/20 p-8 md:p-10 transition-all duration-300">
          <div className="mb-8 border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              {isLogin ? 'Initialize Session' : 'Register Administrator'}
            </h2>
            <p className="text-sm text-white/50 mt-2 font-mono">
              {isLogin ? 'Enter credentials to proceed.' : 'Set up credentials to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-500 flex items-start gap-3 text-sm border border-rose-500 animate-fadeIn">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-bold tracking-wide uppercase">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-[#CCFF00]/10 text-[#CCFF00] flex items-start gap-3 text-sm border border-[#CCFF00] animate-fadeIn">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <p className="font-bold tracking-wide uppercase">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-white uppercase tracking-widest mb-3">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#050505] border border-white/20 text-white focus:border-[#CCFF00] transition-all outline-none text-sm font-medium"
                  placeholder="admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-white uppercase tracking-widest mb-3">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-[#050505] border border-white/20 text-white focus:border-[#CCFF00] transition-all outline-none text-sm font-medium focus:ring-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-[10px] text-white/50 font-mono tracking-wide uppercase">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-4 mt-2 bg-[#CCFF00] border border-[#CCFF00] hover:bg-white hover:border-white text-black font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform stroke-[3px]" /> : <UserPlus size={20} className="group-hover:scale-110 transition-transform stroke-[3px]" />}
                  {isLogin ? 'Log In' : 'Register'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            {isLogin && (
              <Link to="/forgot-password" size="sm" className="text-sm border-b border-transparent text-white/50 hover:text-white hover:border-white font-bold uppercase tracking-wide transition-all">
                  Forgot password?
              </Link>
            )}

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-sm font-bold text-white/50 hover:text-white transition-all uppercase tracking-wide"
            >
              {isLogin ? (
                <span>New? <span className="text-[#CCFF00] hover:text-white border-b border-[#CCFF00]">Create Account</span></span>
              ) : (
                <span>Registered? <span className="text-[#CCFF00] hover:text-white border-b border-[#CCFF00]">Log In</span></span>
              )}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-white/30 text-xs font-mono uppercase tracking-widest">
          SYSTEM_VER: 2.0.4 <br /> CLASSIFICATION: CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}
