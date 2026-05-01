/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock, ArrowRight } from 'lucide-react';
import { getActivities } from '../utils/storage';

/**
 * A sub-component to display a statistics card with spotlight effect.
 */
const StatCard = ({ title, value, icon: Icon, colorClass, subtext, index = 0 }) => (
    <div 
        className="card-base spotlight-card p-5 flex flex-col gap-3 group hover:bg-[var(--bg-card-hover)] transition-all duration-400 glow-accent relative overflow-hidden"
        style={{ animation: `premium-enter 0.5s var(--spring-bounce) both`, animationDelay: `${index * 80}ms` }}
    >
        {/* Spotlight gradient on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-full blur-2xl" />
        </div>
        
        <div className="flex justify-between items-start gap-3 relative z-10">
            <div className="min-w-0 flex-1">
                <p className="m-0 text-[var(--text-muted)] text-xs font-medium tracking-wider uppercase">{title}</p>
                <h3 className="mt-2 text-3xl md:text-4xl text-[var(--text-primary)] font-bold tracking-tighter tabular-nums">{value}</h3>
            </div>
            <div className={`p-2.5 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
                <Icon size={20} className="stroke-[2px]" />
            </div>
        </div>
        {subtext && (
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] mt-1 relative z-10">
                <p className="m-0 text-xs text-[var(--text-secondary)] font-medium">{subtext}</p>
            </div>
        )}
    </div>
);

/**
 * Activity item component with staggered entrance.
 */
const ActivityItem = ({ activity, index }) => (
    <div 
        className="flex items-start gap-4 p-5 hover:bg-[var(--bg-card-hover)] transition-colors group relative"
        style={{ animation: `fade-in-up-anim 0.3s var(--spring-bounce) both`, animationDelay: `${300 + index * 50}ms` }}
    >
        <div className={`p-2.5 shrink-0 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${activity.type === 'fee' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
            activity.type === 'student' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                activity.type === 'tc' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                    activity.type === 'admission' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        activity.type === 'promotion' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-[var(--text-secondary)] bg-[var(--bg-main)] border-[var(--border-subtle)]'
            }`}>
            {activity.type === 'fee' && <IndianRupee size={18} />}
            {activity.type === 'student' && <UserPlus size={18} />}
            {activity.type === 'tc' && <FileText size={18} />}
            {activity.type === 'admission' && <Users size={18} />}
            {activity.type === 'promotion' && <ArrowRight size={18} />}
            {activity.type === 'system' && <Activity size={18} />}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
            <p className="text-[var(--text-primary)] font-medium text-sm m-0 leading-snug">{activity.description}</p>
            <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[var(--text-muted)] text-xs flex items-center gap-1.5 font-mono">
                    {new Date(activity.timestamp).toLocaleString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                    })}
                </p>
            </div>
        </div>
    </div>
);

/**
 * Component that displays an overview dashboard with key metrics and recent activities.
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
                <div className="card-base p-12 md:p-20 flex flex-col items-center gap-6 spotlight-card">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center shadow-xl">
                        <Users size={32} className="text-[var(--text-primary)]" />
                    </div>
                    <div className="max-w-md stagger-children">
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">Welcome to Student Manager</h2>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">Get started by adding your first student to the database.</p>
                    </div>
                    <button 
                        onClick={onAddStudent}
                        className="btn btn-primary cta-primary mt-4"
                    >
                        <UserPlus size={18} />
                        <span>Add First Student</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:px-8 md:py-6 max-w-6xl mx-auto page-enter">
            {/* Section header - asymmetrical layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-2">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent hidden sm:block" />
                    <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
                    <Clock size={12} />
                    <span>{new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>

            {/* Stats Grid with staggered entrance */}
            <div className="grid grid-cols-1 gap-4 md:gap-5 mb-10 lg:grid-cols-3 stagger-children">
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
                    subtext={`${new Date().toLocaleString('default', { month: 'long' })} collection`}
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
                <div className="h-6 w-px bg-gradient-to-b from-[var(--accent-primary)]/50 via-[var(--border-color)] to-transparent" />
                <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-tight">Recent Updates</h2>
            </div>
            
            <div className="card-base spotlight-card overflow-hidden" id="recent-activities">
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-card)]">
                    <h3 className="m-0 text-[var(--text-primary)] text-sm font-semibold tracking-tight">
                        Activity Stream
                    </h3>
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] px-2.5 py-1 rounded-lg flex items-center gap-2 border border-[var(--border-subtle)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'gentle-pulse 2s ease-in-out infinite' }} />
                        Live
                    </span>
                </div>

                <div className="bg-[var(--bg-card)]">
                    {activities.length > 0 ? (
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {activities.map((activity, idx) => (
                                <ActivityItem key={activity.id} activity={activity} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
                                <Activity size={24} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;