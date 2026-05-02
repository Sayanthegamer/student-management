import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans flex flex-col relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-6 md:px-10 z-20 relative border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
            <GraduationCap size={18} className="text-[var(--accent-primary)]" />
          </div>
          <span className="font-bold text-[var(--text-primary)] text-lg tracking-tight">
            Student Manager Pro
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full z-10">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wider mb-8 border border-[var(--accent-primary)]/20">
            <span>Simple. Affordable. Fast.</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6 max-w-3xl">
            Run your school, not a server room.
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed">
            Everything you need to manage admissions, track fees, and issue
            certificates. No IT degree required. Built for administrators who
            value their time and budget.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate("/login")}
              className="group btn btn-primary text-white px-8 py-3.5 text-base"
            >
              Start Managing Free
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                Focus on education, we'll handle the paperwork.
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl mx-auto">
                A streamlined dashboard designed specifically for clerks and
                administrators. Get tasks done in seconds instead of hours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-sm">
                  <DollarSign className="text-[var(--accent-primary)] w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  Fee Management
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Track payments, generate receipts instantly, and see
                  outstanding balances at a glance. No more complex
                  spreadsheets.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-sm">
                  <Users className="text-[var(--accent-primary)] w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  Instant Admissions
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Add new students quickly. Maintain complete digital records
                  that are securely backed up and accessible from anywhere.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-sm">
                  <BookOpen className="text-[var(--accent-primary)] w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  One-Click Certificates
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Generate Transfer Certificates and manage promotions with a
                  single click. Save hours of manual typing and formatting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Affordability / Trust Section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Premium software doesn't have to be expensive.
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[var(--accent-primary)] w-5 h-5" />
              <span className="font-medium text-sm">No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[var(--accent-primary)] w-5 h-5" />
              <span className="font-medium text-sm">
                Zero Maintenance Required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[var(--accent-primary)] w-5 h-5" />
              <span className="font-medium text-sm">Secure Cloud Backup</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] mt-auto z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-[var(--accent-primary)]" />
            <span className="font-semibold text-[var(--text-primary)] text-sm">
              Student Manager Pro
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-xs">
            &copy; {new Date().getFullYear()} Student Manager Pro. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
