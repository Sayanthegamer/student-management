/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus, FileText, Activity, Clock } from 'lucide-react';
import { getActivities } from '../utils/storage';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
    <div className="bg-white rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
                <p className="m-0 text-slate-500 text-xs md:text-sm font-medium tracking-wide uppercase">{title}</p>
                <h3 className="mt-1 text-2xl md:text-3xl text-slate-800 font-bold tracking-tight">{value}</h3>
            </div>
            <div className={`p-2 md:p-3 rounded-xl ${colorClass} bg-opacity-10 shrink-0 ml-2`}>
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

const Overview = ({ students }) => {
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

    const currentYear = new Date().getFullYear().toString();
    const newAdmissions = students.filter(student =>
        student.admissionDate?.startsWith(currentYear)
    ).length;

    const [activities, setActivities] = useState(() => getActivities());

    useEffect(() => {
        // Optional: Poll for updates every few seconds if real-time feel is needed
        const interval = setInterval(() => {
            setActivities(getActivities());
        }, 5000);

        return () => clearInterval(interval);
    }, [students]); // Re-fetch when students change (likely triggers activity)

    return (
        <div className="p-3 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-white mb-4 md:mb-6 text-xl md:text-2xl font-bold">Dashboard Overview</h2>

            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="bg-indigo-100 text-indigo-600"
                    subtext="Active students in database"
                />
                <StatCard
                    title="Total Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    colorClass="bg-emerald-100 text-emerald-600"
                    subtext={`For ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    colorClass="bg-amber-100 text-amber-600"
                    subtext="Students yet to pay this month"
                />
                <StatCard
                    title="New Admissions"
                    value={newAdmissions}
                    icon={UserPlus}
                    colorClass="bg-pink-100 text-pink-600"
                    subtext={`Joined in ${currentYear}`}
                />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100" id="recent-activities">
                <h3 className="m-0 mb-4 md:mb-6 text-slate-800 text-lg md:text-xl font-bold flex items-center gap-2">
                    Recent Activities
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <Activity size={12} /> Live Updates
                    </span>
                </h3>

                <div className="flex flex-col gap-3 md:gap-4">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className={`p-2 rounded-lg shrink-0 ${activity.type === 'fee' ? 'bg-emerald-100 text-emerald-600' :
                                    activity.type === 'student' ? 'bg-indigo-100 text-indigo-600' :
                                        activity.type === 'tc' ? 'bg-rose-100 text-rose-600' :
                                            activity.type === 'admission' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-600'
                                    }`}>
                                    {activity.type === 'fee' && <IndianRupee size={16} className="md:hidden" />}
                                    {activity.type === 'fee' && <IndianRupee size={18} className="hidden md:block" />}
                                    {activity.type === 'student' && <UserPlus size={16} className="md:hidden" />}
                                    {activity.type === 'student' && <UserPlus size={18} className="hidden md:block" />}
                                    {activity.type === 'tc' && <FileText size={16} className="md:hidden" />}
                                    {activity.type === 'tc' && <FileText size={18} className="hidden md:block" />}
                                    {activity.type === 'admission' && <Users size={16} className="md:hidden" />}
                                    {activity.type === 'admission' && <Users size={18} className="hidden md:block" />}
                                    {activity.type === 'system' && <Activity size={16} className="md:hidden" />}
                                    {activity.type === 'system' && <Activity size={18} className="hidden md:block" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-800 font-medium text-xs md:text-sm m-0">{activity.description}</p>
                                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                        <Clock size={10} />
                                        <span className="hidden sm:inline">{new Date(activity.timestamp).toLocaleString()}</span>
                                        <span className="sm:hidden">{new Date(activity.timestamp).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 md:py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium text-sm md:text-base">No recent activities found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
