import React from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="m-0 text-slate-500 text-sm font-medium tracking-wide uppercase">{title}</p>
                <h3 className="mt-1 text-3xl text-slate-800 font-bold tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                <Icon size={24} className="opacity-90" />
            </div>
        </div>
        {subtext && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <p className="m-0 text-xs text-slate-400 font-medium">{subtext}</p>
            </div>
        )}
    </div>
);

const Overview = ({ students }) => {
    // Calculate stats
    const activeStudents = students.filter(s => s.status !== 'Transferred');
    const totalStudents = activeStudents.length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const feesCollected = students.reduce((total, student) => {
        // Calculate based on PAYMENT DATE (Cash Flow), not the fee month
        const paidThisMonth = student.feeHistory?.filter(p => p.date && p.date.startsWith(currentMonth));
        const totalForStudent = paidThisMonth ? paidThisMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0;
        return total + totalForStudent;
    }, 0);

    const pendingFeesCount = activeStudents.filter(student => {
        const paidThisMonth = student.feeHistory?.find(p => p.month === currentMonth);
        return !paidThisMonth;
    }).length;

    const currentYear = new Date().getFullYear().toString();
    const newAdmissions = students.filter(student =>
        student.admissionDate && student.admissionDate.startsWith(currentYear)
    ).length;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-white mb-6 text-2xl font-bold">Dashboard Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={Users}
                    colorClass="bg-indigo-100 text-indigo-600"
                    subtext="Active students in database"
                />
                <StatCard
                    title="Fees Collected"
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

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="m-0 mb-6 text-slate-800 text-xl font-bold flex items-center gap-2">
                    Recent Activities
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Coming Soon</span>
                </h3>
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Activity log is under development</p>
                </div>
            </div>
        </div>
    );
};

export default Overview;
