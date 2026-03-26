/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock } from 'lucide-react';
import { getActivities } from '../utils/storage';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext, index = 0 }) => (
    <div 
        className="bg-[#0a0a0a] p-4 md:p-6 flex flex-col gap-2 md:gap-4 border-2 border-white/40 transition-all duration-300 slide-up group hover:border-[#CCFF00]"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
                <p className="m-0 text-white/50 text-[10px] md:text-xs font-black tracking-widest uppercase">{title}</p>
                <h3 className="mt-1.5 text-2xl md:text-4xl lg:text-5xl text-white font-black tracking-tight leading-none uppercase">{value}</h3>
            </div>
            <div className={`p-2.5 md:p-3 shrink-0 border ${colorClass}`}>
                <Icon size={22} className="md:hidden stroke-[3px]" />
                <Icon size={24} className="hidden md:block stroke-[3px]" />
            </div>
        </div>
        {subtext && (
            <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2">
                <p className="m-0 text-[10px] md:text-xs text-white/40 font-mono tracking-wide uppercase">{subtext}</p>
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
            <div className="p-6 md:p-12 max-w-7xl mx-auto text-center">
                <div className="bg-[#0a0a0a] p-6 md:p-16 border-2 border-white/40 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#CCFF00] border-2 border-[#CCFF00] text-black flex items-center justify-center">
                        <Users size={32} className="md:size-[40px] stroke-[2px]" />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">Welcome to STD::MGR</h2>
                        <p className="text-white/60 text-base md:text-lg font-mono">Get started by adding your first student to the database.</p>
                    </div>
                    <button 
                        onClick={onAddStudent}
                        className="btn btn-primary text-base md:text-lg px-6 md:px-8 py-3.5 md:py-4 font-black tracking-widest uppercase mt-4 flex items-center gap-2 min-h-[48px]"
                    >
                        <UserPlus size={20} className="stroke-[3px]" />
                        <span className="hidden md:inline">Initialize Student</span>
                        <span className="md:hidden">Add Student</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 max-w-7xl mx-auto page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 md:mb-8">
                <h2 className="text-white text-xl md:text-2xl font-black tracking-widest uppercase">Dashboard Overview</h2>
                <div className="flex items-center gap-2 text-[#CCFF00] bg-[#CCFF00]/10 border-2 border-[#CCFF00]/20 px-3 py-1.5 text-xs md:text-sm font-bold uppercase tracking-wide">
                    <Clock size={15} className="md:hidden stroke-[3px]" />
                    <Clock size={16} className="hidden md:block stroke-[3px]" />
                    {new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8 lg:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="bg-[#CCFF00] border-[#CCFF00] text-black"
                    subtext="Active enrollment"
                    index={0}
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="bg-emerald-400 border-emerald-400 text-black"
                    subtext={`${new Date().toLocaleString('default', { month: 'long' })} collection`}
                    index={1}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    colorClass="bg-amber-400 border-amber-400 text-black"
                    subtext="Awaiting payment"
                    index={2}
                />
            </div>

            <div className="bg-[#0a0a0a] border-2 border-white/40 overflow-hidden" id="recent-activities">
                <div className="p-4 md:p-6 border-b border-white/40 flex justify-between items-center">
                    <h3 className="m-0 text-white text-base md:text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        Activity Stream
                    </h3>
                    <span className="text-[10px] md:text-xs font-black text-black bg-[#CCFF00] px-3 py-1 flex items-center gap-2 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
                        Live
                    </span>
                </div>

                <div className="divide-y divide-white/10">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 md:gap-4 p-4 md:p-5 hover:bg-white/5 transition-colors group">
                                <div className={`p-2.5 shrink-0 transition-transform group-hover:scale-110 border ${activity.type === 'fee' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    activity.type === 'student' ? 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/30' :
                                        activity.type === 'tc' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                            activity.type === 'admission' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                'bg-white/10 text-white/60 border-white/40'
                                    }`}>
                                    {activity.type === 'fee' && <IndianRupee size={18} className="stroke-[2.5px]" />}
                                    {activity.type === 'student' && <UserPlus size={18} className="stroke-[2.5px]" />}
                                    {activity.type === 'tc' && <FileText size={18} className="stroke-[2.5px]" />}
                                    {activity.type === 'admission' && <Users size={18} className="stroke-[2.5px]" />}
                                    {activity.type === 'system' && <Activity size={18} className="stroke-[2.5px]" />}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <p className="text-white font-medium text-sm md:text-base m-0 leading-snug">{activity.description}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-[#CCFF00] text-[10px] md:text-xs flex items-center gap-1.5 font-bold tracking-widest uppercase">
                                            <Clock size={11} className="opacity-70 stroke-[3px]" />
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
                        <div className="text-center py-16 md:py-20">
                            <div className="bg-white/5 border-2 border-white/10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                                <Activity size={32} className="text-white/30" />
                            </div>
                            <p className="text-white/50 font-mono text-sm tracking-wide uppercase">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
