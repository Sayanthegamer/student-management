import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#CCFF00] selection:text-black overflow-x-hidden relative">

      {/* Engineering Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" 
        style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '4rem 4rem' 
        }} 
      />

      {/* Top Bar - Stark & Minimal */}
      <header className="absolute top-0 w-full flex justify-between items-center p-6 md:p-8 border-b border-white/10 z-20">
        <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">STD::MGR_PRO</h1>
        </div>
        <div className="hidden md:flex text-xs font-bold uppercase tracking-widest text-white/40 items-center gap-3">
            <span>[ SYSTEM ONLINE ]</span>
            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full" />
        </div>
      </header>

      {/* Hero Content - Massive Typography */}
      <main className="min-h-screen w-full flex flex-col justify-end pb-12 pt-40 px-6 md:px-12 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-end">
          
          <div className="md:col-span-8 flex flex-col">
            {/* The Anti-Headline */}
            <h2 className="text-[14vw] md:text-[8.5vw] leading-[0.85] font-black uppercase tracking-tighter text-[#CCFF00] mb-6 drop-shadow-[0_0_30px_rgba(204,255,0,0.15)]">
              Zero <br/>Latency.
            </h2>
            
            <div className="w-full h-[1px] bg-white/10 mb-6 hidden md:block" />
            
            <p className="text-xl md:text-[2.5rem] font-medium text-white max-w-3xl leading-[1.2] tracking-tight">
              Most school software is built like a legacy bank. We built this like a high-frequency trading engine.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="px-4 py-2 border-2 border-white/40 text-white font-bold text-sm md:text-base uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-default">No Spinners</span>
              <span className="px-4 py-2 border-2 border-white/40 text-white font-bold text-sm md:text-base uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-default">Instant Interactions</span>
              <span className="px-4 py-2 border-2 border-white/40 text-white font-bold text-sm md:text-base uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-default">Offline Capable</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-start md:items-end justify-end space-y-6 pt-12 md:pt-0">
             <button 
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center w-full md:w-auto px-8 py-5 md:py-6 bg-[#CCFF00] text-black font-black uppercase tracking-widest text-lg md:text-xl hover:bg-white transition-all"
             >
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-black transition-colors pointer-events-none scale-105 opacity-0 group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-4">
                  Initialize System
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
             </button>
             <div className="border-2 border-white/40 bg-white/5 p-5 md:text-right max-w-sm w-full">
                <p className="text-sm font-black text-white uppercase leading-snug">
                    Note: We removed all artificial loading screens. The system reacts instantly to your inputs.
                </p>
             </div>
          </div>
        </div>
      </main>

      {/* Features - Brutalist Grid (Desktop) */}
      <section className="border-t border-white/10 w-full bg-[#CCFF00] text-black hidden md:block mt-12 md:mt-0 relative z-10">
        <div className="grid grid-cols-3 divide-x border-b border-black divide-black">
           {[
             { num: "01", title: "LOCAL-FIRST", desc: "Your data lives directly in browser memory. Mutations are synchronous. Network I/O happens in the background. Zero blocking." },
             { num: "02", title: "FEE ENGINE", desc: "Algorithmic late-fine calculations. Multi-month batched ledger transactions. Zero manual math required." },
             { num: "03", title: "TC GENERATOR", desc: "Instant transfer certificate issuance strictly linked to internal student admission lifecycle states." }
           ].map(f => (
             <div key={f.num} className="p-12 hover:bg-black hover:text-[#CCFF00] transition-colors duration-300 group">
                <div className="text-6xl font-black mb-12 opacity-10 group-hover:opacity-100 transition-opacity tracking-tighter">{f.num}</div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">{f.title}</h3>
                <p className="font-mono text-sm leading-relaxed font-bold opacity-80">{f.desc}</p>
             </div>
           ))}
        </div>
        
        {/* Footer info inside the green block */}
        <div className="p-6 flex justify-between items-center font-mono text-xs uppercase font-bold px-12">
            <span>// System Designed for Advanced Administration</span>
            <span>END OF BUFFER</span>
        </div>
      </section>

      {/* Features - Mobile Fallback */}
      <section className="md:hidden border-t border-white/10 w-full bg-[#050505] text-[#CCFF00] divide-y divide-white/10 relative z-10">
         {[
             { num: "01", title: "LOCAL-FIRST", desc: "Data lives in session storage. Mutations are synchronous. Zero blocking." },
             { num: "02", title: "FEE ENGINE", desc: "Algorithmic fine calculations. Multi-month batched transactions." },
             { num: "03", title: "TC GENERATOR", desc: "Instant transfer certificate issuance linked to lifecycle states." }
           ].map(f => (
             <div key={f.num} className="p-6 relative overflow-hidden group">
                <div className="absolute right-[-10%] top-[-10%] text-[8rem] font-black opacity-[0.03] text-white leading-none pointer-events-none">{f.num}</div>
                <div className="text-3xl font-black mb-6 text-white">{f.num}</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-[#CCFF00]">{f.title}</h3>
                <p className="font-mono text-sm leading-relaxed text-white/50">{f.desc}</p>
             </div>
           ))}
           <div className="p-6 bg-white/5 font-mono text-[10px] uppercase text-white/40 text-center">
               END OF BUFFER // SYSTEM DESIGNED FOR ADVANCED ADMINISTRATION
           </div>
      </section>
    </div>
  );
};

export default LandingPage;
