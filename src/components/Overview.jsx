import React from 'react';
import { Users, IndianRupee, AlertCircle, UserPlus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>{title}</p>
                <h3 style={{ margin: '8px 0 0', fontSize: '28px', color: '#1f2937' }}>{value}</h3>
            </div>
            <div style={{
                background: color + '20',
                padding: '12px',
                borderRadius: '12px',
                color: color
            }}>
                <Icon size={24} />
            </div>
        </div>
        {subtext && <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{subtext}</p>}
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
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '24px', fontSize: '24px' }}>Dashboard Overview</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
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

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Recent Activities</h3>
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Activity log coming soon...
                </div>
            </div>
        </div>
    );
};

export default Overview;
