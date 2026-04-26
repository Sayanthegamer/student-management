/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock } from 'lucide-react';
import { getActivities } from '../utils/storage';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext, index = 0 }) => (
    <div 
        className="card-base p-5 flex flex-col gap-3 transition-all duration-300 slide-up group hover:bg-[var(--bg-card-hover)]"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
                <p className="m-0 text-[var(--text-muted)] text-sm font-medium tracking-wide">{title}</p>
                <h3 className="mt-1 text-3xl md:text-4xl text-[var(--text-primary)] font-semibold tracking-tight">{value}</h3>
            </div>
            <div className={`p-2 shrink-0 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] ${colorClass}`}>
                <Icon size={20} className="stroke-[2px]" />
            </div>
        </div>
        {subtext && (
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] mt-1">
                <p className="m-0 text-xs text-[var(--text-secondary)] font-medium">{subtext}</p>
            </div>
        )}
    </div>
);

const Overview = ({ students, onAddStudent }) => {
    // Calculate stats
    const activeStudents = students.filter(s => s.admissionStatus !== 'Transferred');
    const totalStudents = activeStudents.length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const feesCollected = students.reduce((total, student) => {
        // Calculate based on PAYMENT DATE (Cash Flow), not the fee month
        const paidThisMonth = student.feeHistory?.filter(p => p.date && p.date.startsWith(currentMonth));
        const totalForStudent = paidThisMonth ? paidThisMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0) + (parseFloat(p.fine) || 0), 0) : 0;
        return total + totalForStudent;
    }, 0);

    const pendingFeesCount = activeStudents.filter(student => {
        const paidThisMonth = student.feeHistory?.find(p => p.month === currentMonth);
        return !paidThisMonth;
    }).length;

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
                <div className="card-base p-8 md:p-16 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
                        <Users size={32} className="text-[var(--text-primary)]" />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Welcome to Student Manager</h2>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base">Get started by adding your first student to the database.</p>
                    </div>
                    <button 
                        onClick={onAddStudent}
                        className="btn btn-primary mt-4"
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
            {/* The global header provides the context now, so Overview just jumps into content. */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-2">
                <h2 className="text-white text-xl font-medium">Environments & Stats</h2>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm font-medium">
                    <Clock size={14} />
                    {new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-10 lg:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="text-blue-400"
                    subtext="Active enrollment"
                    index={0}
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="text-emerald-400"
                    subtext={`${new Date().toLocaleString('default', { month: 'long' })} collection`}
                    index={1}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    colorClass="text-amber-400"
                    subtext="Awaiting payment"
                    index={2}
                />
            </div>

            <h2 className="text-white text-xl font-medium mb-4">Recent Updates</h2>
            <div className="card-base" id="recent-activities">
                <div className="px-5 py-3.5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
                    <h3 className="m-0 text-[var(--text-primary)] text-sm font-medium">
                        Activity Stream
                    </h3>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] px-2 py-0.5 rounded flex items-center gap-1.5 border border-[var(--border-color)]">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Live
                    </span>
                </div>

                <div className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-5 hover:bg-[var(--bg-card-hover)] transition-colors group">
                                <div className={`p-2.5 shrink-0 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] ${activity.type === 'fee' ? 'text-emerald-400' :
                                    activity.type === 'student' ? 'text-blue-400' :
                                        activity.type === 'tc' ? 'text-rose-400' :
                                            activity.type === 'admission' ? 'text-amber-400' :
                                                'text-[var(--text-secondary)]'
                                    }`}>
                                    {activity.type === 'fee' && <IndianRupee size={18} />}
                                    {activity.type === 'student' && <UserPlus size={18} />}
                                    {activity.type === 'tc' && <FileText size={18} />}
                                    {activity.type === 'admission' && <Users size={18} />}
                                    {activity.type === 'system' && <Activity size={18} />}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <p className="text-[var(--text-primary)] font-medium text-sm m-0 leading-snug">{activity.description}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-[var(--text-muted)] text-xs flex items-center gap-1.5 font-medium">
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
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-4">
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
