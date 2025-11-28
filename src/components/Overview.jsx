import React from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div>
                <p className="m-0 text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="mt-2 text-3xl text-gray-800 font-semibold">{value}</h3>
            </div>
            <div
                className="p-3 rounded-xl"
                style={{
                    background: color + '20',
                    color: color
                }}
            >
                <Icon size={24} />
            </div>
        </div>
        {subtext && <p className="m-0 text-xs text-gray-500">{subtext}</p>}
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
                    color="#4f46e5"
                    subtext="Active students in database"
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${feesCollected.toLocaleString()}`}
                    icon={IndianRupee}
                    color="#10b981"
                    subtext={`For ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                />
                <StatCard
                    title="Pending Fees"
                    value={pendingFeesCount}
                    icon={AlertCircle}
                    color="#f59e0b"
                    subtext="Students yet to pay this month"
                />
                <StatCard
                    title="New Admissions"
                    value={newAdmissions}
                    icon={UserPlus}
                    color="#ec4899"
                    subtext={`Joined in ${currentYear}`}
                />
            </div>

            <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6">
                <h3 className="m-0 mb-4 text-gray-800 text-lg font-semibold">Recent Activities</h3>
                <div className="text-gray-500 italic">
                    Activity log coming soon...
                </div>
            </div>
        </div>
    );
};

export default Overview;
