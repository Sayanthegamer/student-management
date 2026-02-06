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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <GraduationCap size={32} color="white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Manager</h1>
          <p className="text-slate-500 font-medium mt-1">Enterprise School Administration</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100 transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">
              {isLogin ? 'Welcome Back' : 'Create Administrator Account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isLogin ? 'Enter your credentials to access the dashboard.' : 'Set up your credentials to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-start gap-3 text-sm border border-rose-100 animate-fadeIn">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-start gap-3 text-sm border border-emerald-100 animate-fadeIn">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  placeholder="admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <p className="mt-2 text-[10px] text-slate-400 font-medium px-1 italic">Minimum 6 characters required</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={20} className="group-hover:scale-110 transition-transform" />}
                  {isLogin ? 'Sign In to Portal' : 'Register Institution'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            {isLogin && (
              <Link to="/forgot-password" size="sm" className="text-sm text-slate-400 hover:text-indigo-600 font-medium transition-colors">
                  Forgot your password?
              </Link>
            )}

            <div className="w-full h-px bg-slate-100 my-2"></div>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all"
            >
              {isLogin ? (
                <span>New here? <span className="text-indigo-600 underline-offset-4 hover:underline">Create an account</span></span>
              ) : (
                <span>Already registered? <span className="text-indigo-600 underline-offset-4 hover:underline">Sign in instead</span></span>
              )}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          Secure Academic Information System
        </p>
      </div>
    </div>
  );
}
