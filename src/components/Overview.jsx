/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock } from 'lucide-react';
import { getActivities } from '../utils/storage';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
                <p className="m-0 text-slate-500 text-[11px] md:text-sm font-semibold tracking-wide uppercase">{title}</p>
                <h3 className="mt-1 text-2xl md:text-3xl text-slate-800 font-bold tracking-tight">{value}</h3>
            </div>
            <div className={`p-2.5 md:p-3 rounded-xl ${colorClass} bg-opacity-10 shrink-0 ml-2`}>
                <Icon size={20} className="md:hidden opacity-90" />
                <Icon size={24} className="hidden md:block opacity-90" />
            </div>
        </div>
        {subtext && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <p className="m-0 text-[10px] md:text-xs text-slate-400 font-medium">{subtext}</p>
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
                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-xl border border-slate-100 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Users size={40} />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Welcome to Student Manager</h2>
                        <p className="text-slate-500 text-lg">Get started by adding your first student to the database.</p>
                    </div>
                    <button 
                        onClick={onAddStudent}
                        className="btn btn-primary text-lg px-8 py-4"
                    >
                        <UserPlus size={20} />
                        Add Your First Student
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 max-w-7xl mx-auto page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <h2 className="text-white text-xl md:text-2xl font-bold tracking-tight">Dashboard Overview</h2>
                <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm font-medium">
                    <Clock size={16} />
                    {new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="bg-indigo-100 text-indigo-600"
                    subtext="Active students enrolled"
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="bg-emerald-100 text-emerald-600"
                    subtext={`${new Date().toLocaleString('default', { month: 'long' })} collection`}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    colorClass="bg-amber-100 text-amber-600"
                    subtext="Awaiting payment"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="recent-activities">
                <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="m-0 text-slate-800 text-base md:text-lg font-bold flex items-center gap-2">
                        Recent Activity
                    </h3>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Live
                    </span>
                </div>

                <div className="divide-y divide-slate-50">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 md:gap-4 p-3 md:p-5 hover:bg-slate-50/50 transition-colors group">
                                <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${activity.type === 'fee' ? 'bg-emerald-50 text-emerald-600' :
                                    activity.type === 'student' ? 'bg-indigo-50 text-indigo-600' :
                                        activity.type === 'tc' ? 'bg-rose-50 text-rose-600' :
                                            activity.type === 'admission' ? 'bg-amber-50 text-amber-600' :
                                                'bg-slate-50 text-slate-600'
                                    }`}>
                                    {activity.type === 'fee' && <IndianRupee size={18} />}
                                    {activity.type === 'student' && <UserPlus size={18} />}
                                    {activity.type === 'tc' && <FileText size={18} />}
                                    {activity.type === 'admission' && <Users size={18} />}
                                    {activity.type === 'system' && <Activity size={18} />}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <p className="text-slate-700 font-semibold text-sm m-0 leading-snug">{activity.description}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-slate-400 text-[11px] md:text-xs flex items-center gap-1 font-medium">
                                            <Clock size={12} className="opacity-70" />
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
                        <div className="text-center py-12 md:py-20">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity size={32} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-medium">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
