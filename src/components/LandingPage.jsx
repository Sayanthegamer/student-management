import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Database, ArrowRight, CloudOff, Layers, Activity, Lock, TrendingUp, Cpu } from 'lucide-react';

/**
 * The redesigned initial landing page component for unauthenticated users.
 * Premium aesthetic with refined typography and sophisticated interactions.
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleLearnMoreScroll = () => {
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';
    document.getElementById('features')?.scrollIntoView({ behavior });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] selection:bg-[var(--accent-light)] selection:text-[var(--accent-primary)] relative overflow-hidden flex flex-col gradient-mesh dot-grid">

      {/* Header - Asymmetrical and editorial */}
      <header className="w-full flex justify-between items-center px-6 py-5 md:px-12 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-indigo-600 flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/25 -rotate-3">
            <span className="text-base">🎓</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight leading-tight">Student Manager Pro</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--accent-primary)] transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex btn btn-primary cta-primary shadow-lg"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-14 z-10 relative">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-semibold mb-8 border border-[var(--accent-primary)]/10 fade-in-up"
          style={prefersReducedMotion ? {} : {
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'fade-in-up-anim 0.4s var(--spring-bounce) both, shimmer-sweep 3s ease-in-out infinite 1s',
          }}
        >
          <span 
            className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" 
            style={prefersReducedMotion ? {} : { animation: 'gentle-pulse 2s ease-in-out infinite' }}
          />
          Kinetic Vault Architecture
        </div>
        
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] tracking-tighter leading-[0.92] max-w-4xl mb-6 premium-enter"
        >
          Lightning Fast <br className="hidden md:block"/>
          <span className="text-[var(--accent-primary)] relative">
            School Administration.
            <span className="absolute -inset-1 bg-[var(--accent-primary)]/5 rounded-lg blur-xl -z-10" aria-hidden="true" />
          </span>
        </h1>
        
        <p 
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 fade-in-up leading-relaxed" 
          style={prefersReducedMotion ? {} : { animationDelay: '0.1s' }}
        >
          Engineered for high-velocity data processing. Experience zero-lag student management with full offline capabilities and dual-layer reliability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto fade-in-up" style={prefersReducedMotion ? {} : { animationDelay: '0.2s' }}>
          <button 
            onClick={() => navigate('/login')}
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-transparent rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/35 w-full sm:w-auto active:scale-[0.98] cta-primary"
          >
            Launch Vault
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={handleLearnMoreScroll}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-[var(--border-color)] rounded-xl bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-[var(--border-highlight)] w-full sm:w-auto active:scale-[0.98]"
          >
            View Technical Specs
          </button>
        </div>
      </main>

      {/* Bento Box Grid Section */}
      <section id="features" className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 z-10 relative">
        <h2 className="font-bold text-2xl md:text-3xl tracking-tight text-[var(--text-primary)] mb-8 fade-in-up">
          Engineered Performance
        </h2>

        {/* Bento Grid - Asymmetrical */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-5 min-h-[450px]">

          {/* Card 1: Zero Latency (Large, Wide on Desktop) */}
          <div className="md:col-span-2 md:row-span-2 bg-[var(--bg-card)] rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-end border border-[var(--border-subtle)] hover:border-[var(--border-color)] transition-all duration-300 group spotlight-card">
            <div className="absolute top-0 right-0 p-8 md:p-12 transition-transform duration-500 group-hover:scale-110">
              <Zap className="text-[var(--accent-primary)] w-32 h-32 opacity-[0.07]" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center mb-5 border border-[var(--accent-primary)]/20 shadow-lg shadow-[var(--accent-primary)]/10">
                <Zap className="text-[var(--accent-primary)] w-5 h-5" />
              </div>
              <h3 className="font-bold text-2xl md:text-3xl text-[var(--text-primary)] mb-2 tracking-tight">Zero Latency Access</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">Our proprietary optimistic UI and sessionStorage caching layer ensures instant student record access, without waiting for server round-trips.</p>
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />
          </div>

          {/* Card 2: Offline Ready (Tall on Desktop) */}
          <div className="md:col-span-1 md:row-span-1 bg-[var(--bg-card)] rounded-2xl p-6 flex flex-col justify-between border border-[var(--border-subtle)] hover:border-[var(--border-color)] transition-all duration-300 group spotlight-card">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-sidebar)] flex items-center justify-center mb-4 shadow-sm">
               <CloudOff className="text-[var(--text-primary)] w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1 tracking-tight">Offline Ready</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Local-first sync engine. Keep working even when the internet drops; we'll sync it later.</p>
            </div>
          </div>

          {/* Card 3: Dual-Layer */}
          <div className="md:col-span-1 md:row-span-1 grid grid-cols-2 gap-4">
             <div className="col-span-1 bg-[var(--bg-card)] rounded-xl p-5 flex flex-col items-center justify-center text-center border border-[var(--border-subtle)] hover:border-[var(--border-color)] transition-all duration-300 spotlight-card">
                <Database className="text-[var(--accent-primary)] w-7 h-7 mb-3 opacity-80" />
                <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-tight">Dual-Layer Storage</h3>
             </div>
             <div className="col-span-1 bg-[var(--bg-card)] rounded-xl p-5 flex flex-col items-center justify-center text-center border border-[var(--border-subtle)] hover:border-[var(--border-color)] transition-all duration-300 spotlight-card">
                <Activity className="text-[var(--text-primary)] w-7 h-7 mb-3 opacity-80" />
                <h3 className="font-semibold text-xs text-[var(--text-primary)] tracking-tight">Smart Syncing</h3>
             </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-14 md:py-20 z-10 relative">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">

          {/* Visual Side */}
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative border border-[var(--border-color)] shadow-2xl shadow-[var(--accent-primary)]/10">
            <img loading="lazy" decoding="async"
              alt="High-tech server room visualization"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent opacity-70" />
            <div className="absolute inset-0 bg-[var(--accent-primary)]/5 mix-blend-overlay" />
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight text-[var(--text-primary)] leading-tight">
              Why the Industry Leads with Us
            </h2>

            <div className="space-y-6">

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-lg">
                  <ShieldCheck className="text-[var(--accent-primary)] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-[var(--text-primary)] mb-1 tracking-tight">Enterprise-Grade Security</h4>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Supabase Row Level Security (RLS) policies and encrypted authentication ensure your student data is completely locked down.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-lg">
                  <TrendingUp className="text-[var(--text-primary)] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-[var(--text-primary)] mb-1 tracking-tight">Elastic Scalability</h4>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Built on robust PostgreSQL. Seamlessly manage hundreds or thousands of students without performance degradation.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-lg">
                  <Cpu className="text-[var(--text-primary)] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-[var(--text-primary)] mb-1 tracking-tight">Zero-Config Deployment</h4>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Works perfectly out of the box. No complex servers to maintain, just log in and start managing your school.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 py-14 z-10 relative">
         <div className="bg-[var(--bg-card)] rounded-2xl p-10 md:p-14 text-center border border-[var(--border-color)] shadow-xl relative overflow-hidden spotlight-card">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.06] blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.06] blur-[100px] rounded-full" />

            <h2 className="font-bold text-3xl md:text-4xl text-[var(--text-primary)] mb-4 relative z-10 tracking-tight">
              Ready to upgrade your infrastructure?
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8 relative z-10 leading-relaxed">
              Join modern schools leveraging lightning-fast tech.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 btn btn-primary cta-primary text-base px-10 py-3"
            >
              Start Managing Now
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 md:py-10 border-t border-[var(--border-subtle)] bg-[var(--bg-main)] z-10 relative mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <div className="font-bold text-[var(--text-primary)] text-base mb-1 flex items-center gap-2">
                 <span className="text-sm">🎓</span> Student Manager Pro
              </div>
              <p className="text-[var(--text-muted)] text-xs">
                 &copy; {new Date().getFullYear()} Student Manager Pro. Powered by Kinetic Vault Architecture.
              </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;