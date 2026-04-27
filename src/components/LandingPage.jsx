import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Database, ArrowRight, CloudOff, Layers, Activity, Lock, TrendingUp, Cpu } from 'lucide-react';

/**
 * The redesigned initial landing page component for unauthenticated users.
 * Focuses on high-velocity performance, zero latency, and an enterprise aesthetic.
 *
 * @returns {JSX.Element} The rendered landing page component.
 */
const LandingPage = () => {
  const navigate = useNavigate();

  const handleLearnMoreScroll = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';
    document.getElementById('features')?.scrollIntoView({ behavior });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] selection:bg-[var(--accent-light)] selection:text-[var(--accent-primary)] relative overflow-hidden flex flex-col gradient-mesh dot-grid">

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-6 md:px-12 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold shadow-md shadow-[var(--accent-primary)]/25">
            <span className="text-sm">🎓</span>
          </div>
          <span className="font-bold text-[var(--text-primary)] text-xl tracking-tight">Student Manager Pro</span>
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
          System Status: Optimal
        </div>
        
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight max-w-4xl mb-6 fade-in-up"
          style={{ animationDelay: '0.08s' }}
        >
          Lightning Fast <br className="hidden md:block"/>
          <span className="text-[var(--accent-primary)] relative">
            School Administration.
            <span className="absolute -inset-1 bg-[var(--accent-primary)]/5 rounded-lg blur-lg -z-10" aria-hidden="true" />
          </span>
        </h1>
        
        <p 
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 fade-in-up" 
          style={{ animationDelay: '0.16s' }}
        >
          Engineered for high-velocity data processing. Experience zero-lag student management with full offline capabilities and dual-layer reliability.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto fade-in-up" style={{ animationDelay: '0.24s' }}>
          <button 
            onClick={() => navigate('/login')}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-transparent rounded-[12px] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-1 shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/35 w-full sm:w-auto active:scale-[0.97]"
          >
            Launch Vault
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={handleLearnMoreScroll}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-300 border border-[var(--border-highlight)] rounded-[12px] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-1 shadow-sm hover:shadow-md w-full sm:w-auto active:scale-[0.97] glass-panel"
          >
            View Technical Specs
          </button>
        </div>
      </main>

      {/* Bento Box Grid Section */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-12 md:py-24 z-10 relative">
        <h2 className="font-extrabold text-2xl md:text-3xl tracking-tight text-[var(--text-primary)] mb-8 fade-in-up">
          Engineered Performance
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 min-h-[500px]">

          {/* Card 1: Zero Latency (Large, Wide on Desktop) */}
          <div className="md:col-span-2 md:row-span-2 bg-[var(--bg-card)] rounded-[24px] p-8 md:p-10 relative overflow-hidden flex flex-col justify-end border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-colors group glow-accent">
            <div className="absolute top-0 right-0 p-8 md:p-12 transition-transform duration-500 group-hover:scale-110">
              <Zap className="text-[var(--accent-primary)] w-32 h-32 opacity-10" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[12px] bg-[var(--accent-light)] flex items-center justify-center mb-6 border border-[var(--accent-primary)]/20">
                <Zap className="text-[var(--accent-primary)] w-6 h-6" />
              </div>
              <h3 className="font-bold text-2xl md:text-3xl text-[var(--text-primary)] mb-2">Zero Latency Access</h3>
              <p className="text-base text-[var(--text-secondary)] max-w-md">Our proprietary optimistic UI and sessionStorage caching layer ensures instant student record access, without waiting for server round-trips.</p>
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[var(--accent-primary)] opacity-5 blur-[80px] rounded-full pointer-events-none" />
          </div>

          {/* Card 2: Offline Ready (Tall on Desktop) */}
          <div className="md:col-span-1 md:row-span-1 bg-[var(--bg-card)] rounded-[24px] p-6 md:p-8 flex flex-col justify-between border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-colors group">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-sidebar)] flex items-center justify-center mb-4">
               <CloudOff className="text-[var(--text-primary)] w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] mb-1">Offline Ready</h3>
              <p className="text-sm text-[var(--text-secondary)]">Local-first sync engine. Keep working even when the internet drops; we'll sync it later.</p>
            </div>
          </div>

          {/* Card 3: Dual-Layer */}
          <div className="md:col-span-1 md:row-span-1 grid grid-cols-2 gap-4">
             <div className="col-span-1 bg-[var(--bg-card)] rounded-[20px] p-5 flex flex-col items-center justify-center text-center border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-colors">
                <Database className="text-[var(--accent-primary)] w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Dual-Layer Storage</h3>
             </div>
             <div className="col-span-1 bg-[var(--bg-card)] rounded-[20px] p-5 flex flex-col items-center justify-center text-center border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-colors">
                <Activity className="text-[var(--text-primary)] w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Smart Syncing</h3>
             </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24 z-10 relative">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">

          {/* Visual Side */}
          <div className="w-full md:w-1/2 rounded-[32px] overflow-hidden aspect-square md:aspect-[4/3] relative border border-[var(--border-highlight)] shadow-2xl shadow-[var(--accent-primary)]/10">
            <img
              alt="High-tech server room visualization"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent opacity-80"></div>
            <div className="absolute inset-0 bg-[var(--accent-primary)]/10 mix-blend-overlay"></div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-extrabold text-3xl md:text-4xl tracking-tight text-[var(--text-primary)] leading-tight">
              Why the Industry Leads with Us
            </h2>

            <div className="space-y-6">

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-highlight)] flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="text-[var(--accent-primary)] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1">Enterprise-Grade Security</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Supabase Row Level Security (RLS) policies and encrypted authentication ensure your student data is completely locked down.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-highlight)] flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="text-[var(--text-primary)] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1">Elastic Scalability</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Built on robust PostgreSQL. Seamlessly manage hundreds or thousands of students without performance degradation.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-highlight)] flex items-center justify-center shrink-0 shadow-sm">
                  <Cpu className="text-[var(--text-primary)] w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--text-primary)] mb-1">Zero-Config Deployment</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Works perfectly out of the box. No complex servers to maintain, just log in and start managing your school.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 py-16 z-10 relative">
         <div className="bg-[var(--bg-card)] rounded-[32px] p-10 md:p-16 text-center border border-[var(--border-highlight)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-primary)] opacity-10 blur-[100px] rounded-full"></div>

            <h2 className="font-extrabold text-3xl md:text-4xl text-[var(--text-primary)] mb-6 relative z-10">
              Ready to upgrade your infrastructure?
            </h2>
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 bg-[var(--accent-primary)] text-white px-10 py-4 rounded-[12px] font-bold text-lg hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-lg shadow-[var(--accent-primary)]/30 hover:shadow-xl hover:shadow-[var(--accent-primary)]/40 hover:-translate-y-1 active:scale-[0.98]"
            >
              Start Managing Now
            </button>
            <p className="text-sm text-[var(--text-muted)] mt-6 relative z-10">
              Join modern schools leveraging lightning-fast tech.
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 md:py-12 border-t border-[var(--border-color)] bg-[var(--bg-main)] z-10 relative mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <div className="font-bold text-[var(--text-primary)] text-lg mb-1 flex items-center gap-2">
                 <span className="text-sm">🎓</span> Student Manager Pro
              </div>
              <p className="text-[var(--text-muted)] text-sm">
                 &copy; {new Date().getFullYear()} Student Manager Pro. Powered by Kinetic Vault Architecture.
              </p>
           </div>
           <div className="flex gap-6 text-sm">
              <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Security</span>
              <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Infrastructure</span>
              <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Docs</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
