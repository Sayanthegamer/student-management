import React, { useState } from 'react';
import { Edit2, Trash2, Search, Plus, IndianRupee } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';

const StudentList = ({ students, onEdit, onDelete, onAdd, onPayFee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState(''); // 'Paid', 'Pending', or ''
    const [sortBy, setSortBy] = useState('name'); // name, rollNo
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);

    const getFeeStatusForMonth = (student, month) => {
        if (!student.feeHistory) return 'Pending';
        const payment = student.feeHistory.find(p => p.month === month);
        return payment ? 'Paid' : 'Pending';
    };

    // Get unique classes and sections for filters
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students
        .filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo.includes(searchTerm) ||
                student.class.includes(searchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

            // Default: Hide 'Transferred' students unless we add a specific filter for them later
            // For now, let's just show Active students
            const isNotTransferred = student.status !== 'Transferred';

            let matchesFeeStatus = true;
            if (filterFeeStatus) {
                const status = getFeeStatusForMonth(student, filterMonth);
                matchesFeeStatus = status === filterFeeStatus;
            }

            return matchesSearch && matchesClass && matchesSection && matchesFeeStatus && isNotTransferred;
        })
        .sort((a, b) => {
            let valA = a[sortBy]?.toString().toLowerCase() || '';
            let valB = b[sortBy]?.toString().toLowerCase() || '';
            // Special handling for Roll No to sort numerically if possible
            if (sortBy === 'rollNo') {
                const numA = parseInt(valA);
                const numB = parseInt(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    valA = numA;
                    valB = numB;
                }
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handlePayFeeClick = (student) => {
        setSelectedStudentForFee(student);
        setShowPaymentModal(true);
    };

    const handlePaymentSave = (studentId, paymentDetails) => {
        onPayFee(studentId, paymentDetails);
        setShowPaymentModal(false);
        setSelectedStudentForFee(null);
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Student Records</h2>
                <button onClick={onAdd} className="btn btn-primary">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input"
                        style={{ paddingLeft: '40px' }}
                    />
                </div>

                {/* Filters */}
                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="glass-input"
                    style={{ width: 'auto', minWidth: '100px' }}
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>

                <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="glass-input"
                    style={{ width: 'auto', minWidth: '100px' }}
                >
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                <select
                    value={filterFeeStatus}
                    onChange={(e) => setFilterFeeStatus(e.target.value)}
                    className="glass-input"
                    style={{ width: 'auto', minWidth: '120px' }}
                >
                    <option value="">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>

                {/* Sorting */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input"
                    style={{ width: 'auto' }}
                >
                    <option value="name">Sort: Name</option>
                    <option value="rollNo">Sort: Roll No</option>
                    <option value="class">Sort: Class</option>
                </select>

                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="btn"
                    style={{ background: 'rgba(255,255,255,0.5)', padding: '10px' }}
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                </button>

                <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)', margin: '0 8px' }}></div>

                <div>
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="glass-input"
                        style={{ width: 'auto' }}
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="desktop-view">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Class/Sec</th>
                            <th style={{ padding: '12px' }}>Roll No</th>
                            <th style={{ padding: '12px' }}>Fees ({filterMonth})</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const status = getFeeStatusForMonth(student, filterMonth);
                            return (
                                <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{student.name}</td>
                                    <td style={{ padding: '12px' }}>{student.class} - {student.section}</td>
                                    <td style={{ padding: '12px' }}>{student.rollNo}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: status === 'Paid' ? '#d1fae5' : '#fef3c7',
                                            color: status === 'Paid' ? '#065f46' : '#92400e'
                                        }}>
                                            {status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handlePayFeeClick(student)}
                                                className="btn"
                                                title="Pay Fees"
                                                style={{ padding: '6px', background: '#d1fae5', color: '#065f46' }}
                                            >
                                                <IndianRupee size={16} />
                                            </button>
                                            <button onClick={() => onEdit(student)} className="btn" style={{ padding: '6px', background: '#e0e7ff', color: '#4338ca' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => onDelete(student.id)} className="btn" style={{ padding: '6px', background: '#fee2e2', color: '#991b1b' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
                {filteredStudents.map(student => {
                    const status = getFeeStatusForMonth(student, filterMonth);
                    return (
                        <div key={student.id} style={{ background: 'rgba(255,255,255,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>{student.name}</h3>
                                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>Class: {student.class}-{student.section} | Roll: {student.rollNo}</p>
                                </div>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: status === 'Paid' ? '#d1fae5' : '#fef3c7',
                                    color: status === 'Paid' ? '#065f46' : '#92400e'
                                }}>
                                    {status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handlePayFeeClick(student)}
                                        className="btn"
                                        style={{ padding: '8px', background: '#d1fae5', color: '#065f46' }}
                                    >
                                        <IndianRupee size={18} />
                                    </button>
                                    <button onClick={() => onEdit(student)} className="btn" style={{ padding: '8px', background: '#e0e7ff', color: '#4338ca' }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => onDelete(student.id)} className="btn" style={{ padding: '8px', background: '#fee2e2', color: '#991b1b' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredStudents.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                        No students found.
                    </div>
                )}
            </div>

            <style>{`
        @media (max-width: 768px) {
          .desktop-view { display: none; }
          .mobile-view { display: flex !important; }
        }
      `}</style>

            {showPaymentModal && selectedStudentForFee && (
                <FeePaymentModal
                    student={selectedStudentForFee}
                    onClose={() => setShowPaymentModal(false)}
                    onSave={handlePaymentSave}
                />
            )}
        </div>
    );
};

export default StudentList;
