import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Database, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--bg-main)] font-sans selection:bg-[var(--accent-light)] selection:text-[var(--accent-primary)] relative overflow-hidden flex flex-col">
      {/* Background gradients for a premium SaaS look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-6 md:px-12 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold">
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
            className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm cursor-pointer transition-all duration-200 border border-transparent rounded-[12px] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] shadow-md shadow-[var(--accent-primary)]/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center text-center px-6 pt-20 md:pt-32 pb-16 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-sm font-semibold mb-8 border border-[var(--accent-primary)]/10 scale-in">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
          System Online
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight max-w-4xl mb-6 slide-up">
          Manage your students with <span className="text-[var(--accent-primary)]">unmatched clarity.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 slide-up" style={{ animationDelay: '0.1s' }}>
          The complete platform for modern school administration. Streamline records, fee collection, admissions, and certificates in one elegant interface.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto slide-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-200 border border-transparent rounded-[12px] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 shadow-lg shadow-[var(--accent-primary)]/25 w-full sm:w-auto"
          >
            Initialize Dashboard
            <ArrowRight size={18} />
          </button>
          <button 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base cursor-pointer transition-all duration-200 border border-[var(--border-highlight)] rounded-[12px] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 shadow-sm w-full sm:w-auto"
          >
            Learn More
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-24 z-10 slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] p-8 rounded-[16px] border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-[var(--border-highlight)] transition-all">
              <div className="w-12 h-12 rounded-[12px] bg-[var(--accent-light)] flex items-center justify-center mb-6">
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
      <footer className="w-full py-8 border-t border-[var(--border-color)] text-center text-[var(--text-muted)] text-sm z-10 bg-[var(--bg-main)]">
        &copy; {new Date().getFullYear()} Student Manager Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
