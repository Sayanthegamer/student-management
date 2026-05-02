
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock, ArrowRight, HelpCircle, Zap, TrendingUp } from 'lucide-react';
import { getActivities } from '../utils/storage';

// Activity type metadata map for consistent styling and icons
const activityMeta = {
  fee: {
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Icon: IndianRupee,
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  student: {
    className: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Icon: UserPlus,
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  tc: {
    className: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Icon: FileText,
    glow: 'rgba(244, 63, 94, 0.3)',
  },
  admission: {
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Icon: Users,
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  promotion: {
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Icon: ArrowRight,
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  system: {
    className: 'text-[var(--text-secondary)] bg-[var(--bg-main)] border-[var(--border-subtle)]',
    Icon: Activity,
    glow: 'transparent',
  },
};
const defaultActivityMeta = {
  className: 'text-[var(--text-secondary)] bg-[var(--bg-main)] border-[var(--border-subtle)]',
  Icon: HelpCircle,
  glow: 'transparent',
};

/**
 * Kinetic Stat Card - Choreographed entrance with spotlight effect
 */
const StatCard = ({ title, value, icon: Icon, colorClass, subtext, index = 0 }) => (
  <div
    className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 group"
    style={{ animation: `kinetic-enter 0.3s var(--kinetic-curve) both`, animationDelay: `${index * 80}ms` }}
  >
    {/* Subtle tinted top border accent */}
    <div className={`absolute top-0 left-0 right-0 h-[2px] ${
      colorClass.includes('emerald') ? 'bg-emerald-500' :
      colorClass.includes('amber') ? 'bg-amber-500' :
      colorClass.includes('blue') ? 'bg-[var(--accent-primary)]' : 'bg-[var(--accent-primary)]'
    } opacity-60`} />

    <div className="flex items-start justify-between mb-3">
      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{title}</p>
      <div className={`p-1.5 rounded-lg ${colorClass}`}>
        <Icon size={14} className="stroke-[2px]" />
      </div>
    </div>

    <h3 className="text-3xl font-bold text-[var(--text-primary)] tracking-tighter tabular-nums mb-2">{value}</h3>

    {subtext && (
      <p className="text-[11px] text-[var(--text-muted)] font-medium">{subtext}</p>
    )}
  </div>
);

/**
 * Activity item with kinetic entrance and magnetic hover
 */
const ActivityItem = ({ activity, index }) => {
  const meta = activityMeta[activity.type] || defaultActivityMeta;
  const ts = new Date(activity.timestamp);
  const timeString = isNaN(ts.getTime()) ? '—' : ts.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
  
  return (
    <div 
        className="flex items-start gap-4 p-4 hover:bg-[var(--bg-card-hover)] group relative cursor-default transition-colors"
        style={{ animation: `kinetic-enter 0.35s var(--kinetic-curve) both`, animationDelay: `${250 + index * 60}ms` }}
    >
        {/* Icon with subtle glow */}
        <div className={`relative p-2 rounded-lg border transition-all duration-200 group-hover:scale-105 group-hover:border-[var(--accent-primary)]/30 ${meta.className}`}>
            {meta.glow !== 'transparent' && (
                <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ 
                        boxShadow: `0 0 12px 2px ${meta.glow}`,
                        filter: 'blur(4px)'
                    }}
                />
            )}
            <meta.Icon size={16} className="relative z-10" />
        </div>
        
        <div className="flex-1 min-w-0 py-0.5">
            <p className="text-[var(--text-primary)] font-medium text-sm m-0 leading-snug">{activity.description}</p>
            <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[var(--text-muted)] text-[10px] flex items-center gap-1.5 font-mono">
                    <Clock size={10} />
                    {timeString}
                </p>
            </div>
        </div>
        
        {/* Subtle arrow indicator on hover */}
        <div className="opacity-0 group-hover:opacity-50 transition-opacity">
            <ArrowRight size={14} className="text-[var(--text-muted)]" />
        </div>
    </div>
  );
};

/**
 * Overview Dashboard - Kinetic Ledger Design
 * Choreographed stat cards and live activity stream
 */
const Overview = ({ students, onAddStudent }) => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { totalStudents, feesCollected, pendingFeesCount } = React.useMemo(() => {
        const activeStudents = students.filter(s => s.admissionStatus !== 'Transferred');
        const total = activeStudents.length;

        const collected = students.reduce((acc, student) => {
            const paidThisMonth = student.feeHistory?.filter(p => p.date && p.date.startsWith(currentMonth));
            const totalForStudent = paidThisMonth ? paidThisMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0) + (parseFloat(p.fine) || 0), 0) : 0;
            return acc + totalForStudent;
        }, 0);

        const pending = activeStudents.filter(student => {
            const paidThisMonth = student.feeHistory?.find(p => p.month === currentMonth);
            return !paidThisMonth;
        }).length;

        return { totalStudents: total, feesCollected: collected, pendingFeesCount: pending };
    }, [students, currentMonth]);

    const [activities, setActivities] = useState(() => getActivities());

    useEffect(() => {
        const interval = setInterval(() => {
            setActivities(getActivities());
        }, 5000);

        return () => clearInterval(interval);
    }, [students]);

    if (students.length === 0) {
        return (
            <div className="p-6 md:p-12 max-w-5xl mx-auto text-center">
                <div className="card-base p-12 md:p-20 flex flex-col items-center gap-6 spotlight-card kinetic-enter">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center shadow-xl relative">
                        <div className="absolute inset-0 rounded-2xl bg-[var(--accent-primary)] blur-lg opacity-20" />
                        <Users size={32} className="text-[var(--text-primary)] relative" />
                    </div>
                    <div className="stagger-choreograph">
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">Welcome to Kinetic Ledger</h2>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-sm">Lightning-fast record management for modern institutions.</p>
                    </div>
                    <button 
                        onClick={onAddStudent}
                        className="btn btn-primary cta-primary mt-4"
                    >
                        <UserPlus size={18} />
                        <span>Add First Record</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:px-8 md:py-5 max-w-6xl mx-auto kinetic-enter">
            {/* Section header - compact */}
            <div className="flex items-center justify-between mb-5 mt-1">
                <div className="flex items-center gap-4">
                    <div className="h-6 w-px bg-gradient-to-b from-[var(--accent-primary)]/60 via-[var(--border-color)] to-transparent hidden sm:block" />
                    <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-tight">Dashboard</h2>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
                    <Clock size={11} />
                    <span>{new Date().toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            {/* Stats Grid - Choreographed entrance */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 stagger-choreograph">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="text-blue-400 bg-blue-500/10 border border-blue-500/20"
                    subtext="Active enrollment"
                    index={0}
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    subtext={`${new Date().toLocaleString('default', { month: 'short' })} collection`}
                    index={1}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    colorClass="text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    subtext="Awaiting payment"
                    index={2}
                />
            </div>

            {/* Activity Section */}
            <div className="flex items-center gap-4 mb-4">
                <div className="h-5 w-px bg-gradient-to-b from-[var(--accent-primary)]/50 via-[var(--border-color)] to-transparent" />
                <h2 className="text-[var(--text-primary)] text-base font-bold tracking-tight">Recent Updates</h2>
            </div>
            
            <div className="card-base spotlight-card overflow-hidden" id="recent-activities">
                {/* Header with live indicator */}
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-card)]">
                    <h3 className="m-0 text-[var(--text-primary)] text-sm font-semibold tracking-tight flex items-center gap-2">
                        Activity Stream
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative">
                            <span 
                                className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"
                                style={{ animationDuration: '2s' }}
                            />
                        </span>
                    </h3>
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] px-2.5 py-1 rounded-lg flex items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-main)]">
                        Live
                    </span>
                </div>

                {/* Activity list with kinetic entrance */}
                <div className="bg-[var(--bg-card)]" role="log" aria-live="polite" aria-relevant="additions">
                    {activities.length > 0 ? (
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {activities.map((activity, idx) => (
                                <ActivityItem key={activity.id} activity={activity} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 kinetic-enter">
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
                                <Activity size={24} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">No activity recorded yet.</p>
                            <p className="text-[var(--text-muted)] text-xs mt-1">Start by adding a student</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;