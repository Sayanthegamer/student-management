import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Database, ArrowRight } from 'lucide-react';


/**
 * LandingPage Component
 * 
 * @returns {JSX.Element} The rendered component.
 */
const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="text-[var(--accent-primary)] w-6 h-6" />,
      title: 'Lightning Fast',
      desc: 'Optimized performance with synchronous local mutations and background syncing.'
    },
    {
      icon: <Database className="text-[var(--accent-primary)] w-6 h-6" />,
      title: 'Data Reliability',
      desc: 'Your records are stored securely with automatic offline capabilities and syncing.'
    },
    {
      icon: <ShieldCheck className="text-[var(--accent-primary)] w-6 h-6" />,
      title: 'Advanced Security',
      desc: 'Enterprise-grade security ensuring student data remains private and protected.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] selection:bg-[var(--accent-light)] selection:text-[var(--accent-primary)] relative overflow-hidden flex flex-col gradient-mesh dot-grid">

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-6 md:px-12 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold shadow-md shadow-[var(--accent-primary)]/25">
            <span className="text-sm">🎓</span>
          </div>
          <span className="font-bold text-[var(--text-primary)] text-xl tracking-tight">StdMgr Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-[var(--text-secondary)] font-medium hover:text-[var(--accent-primary)] transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex btn btn-primary shadow-lg shadow-[var(--accent-primary)]/25"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center text-center px-6 pt-20 md:pt-32 pb-16 z-10 relative">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-sm font-semibold mb-8 border border-[var(--accent-primary)]/10 fade-in-up"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'fade-in-up-anim 0.4s var(--spring-bounce) both, shimmer-sweep 3s ease-in-out infinite 1s',
          }}
        >
          <span 
            className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" 
            style={{ animation: 'gentle-pulse 2s ease-in-out infinite' }}
          />
          System Online
        </div>
        
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight max-w-4xl mb-6 fade-in-up"
          style={{ animationDelay: '0.08s' }}
        >
          Manage your students with <span className="text-[var(--accent-primary)] relative">
            unmatched clarity.
            <span className="absolute -inset-1 bg-[var(--accent-primary)]/5 rounded-lg blur-lg -z-10" aria-hidden="true" />
          </span>
        </h1>
        
        <p 
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 fade-in-up" 
          style={{ animationDelay: '0.16s' }}
        >
          The complete platform for modern school administration. Streamline records, fee collection, admissions, and certificates in one elegant interface.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto fade-in-up" style={{ animationDelay: '0.24s' }}>
          <button 
            onClick={() => navigate('/login')}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-transparent rounded-[12px] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-1 shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/35 w-full sm:w-auto active:scale-[0.97]"
          >
            Initialize Dashboard
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const behavior = prefersReducedMotion ? 'auto' : 'smooth';
              document.getElementById('features')?.scrollIntoView({ behavior });
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-[var(--border-highlight)] rounded-[12px] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-1 shadow-sm hover:shadow-md w-full sm:w-auto active:scale-[0.97]"
          >
            Learn More
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={feature.title} 
              className="bg-[var(--bg-card)] p-8 rounded-[16px] border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:border-[var(--border-highlight)] transition-all duration-300 hover:-translate-y-1 glow-accent fade-in-up group"
              style={{ animationDelay: `${0.35 + idx * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-[12px] bg-[var(--accent-light)] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-8 border-t border-[var(--border-color)] text-center text-[var(--text-muted)] text-sm z-10 bg-[var(--bg-main)] relative">
        &copy; {new Date().getFullYear()} Student Manager Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
