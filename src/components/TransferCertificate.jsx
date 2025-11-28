import React, { useState } from 'react';
import { Search, FileText, AlertTriangle, Filter } from 'lucide-react';
import { createPortal } from 'react-dom';

const TransferCertificate = ({ students, onUpdateStudent }) => {
    const [view, setView] = useState('active'); // 'active' or 'transferred'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, rollNo
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [tcDetails, setTcDetails] = useState({
        reason: 'Completed Course',
        conduct: 'Good',
        dateOfLeaving: new Date().toISOString().slice(0, 10),
        remarks: ''
    });

    // Get unique classes and sections for filters
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students
        .filter(student => {
            // Filter based on View Mode
            if (view === 'active') {
                if (student.status === 'Transferred') return false;
            }

            if (view === 'transferred') {
                if (student.status !== 'Transferred') return false;

                // 3 Months Retention Policy: Only show students who left in the last 3 months
                if (student.tcDetails?.dateOfLeaving) {
                    const leavingDate = new Date(student.tcDetails.dateOfLeaving);
                    const retentionLimit = new Date();
                    retentionLimit.setMonth(retentionLimit.getMonth() - 3);

                    // Reset time part for accurate date comparison
                    leavingDate.setHours(0, 0, 0, 0);
                    retentionLimit.setHours(0, 0, 0, 0);

                    if (leavingDate < retentionLimit) return false;
                }
            }

            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo.includes(searchTerm) ||
                student.class.includes(searchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

            return matchesSearch && matchesClass && matchesSection;
        })
        .sort((a, b) => {
            let valA = a[sortBy]?.toString().toLowerCase() || '';
            let valB = b[sortBy]?.toString().toLowerCase() || '';

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

    const handleIssueClick = (student) => {
        setSelectedStudent(student);
        setTcDetails({
            reason: 'Completed Course',
            conduct: 'Good',
            dateOfLeaving: new Date().toISOString().slice(0, 10),
            remarks: ''
        });
        setShowIssueModal(true);
    };

    const handleConfirmIssue = () => {
        if (!selectedStudent) return;

        const updatedStudent = {
            ...selectedStudent,
            status: 'Transferred',
            tcDetails: {
                ...tcDetails,
                issueDate: new Date().toISOString().slice(0, 10)
            }
        };

        onUpdateStudent(updatedStudent);
        setShowIssueModal(false);
        setSelectedStudent(null);
        alert('Transfer Certificate Issued Successfully!');
    };

    const IssueTCModal = () => createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel" style={{ background: 'white', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                    Issue Transfer Certificate
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '18px' }}>{selectedStudent.name}</p>
                    <p style={{ margin: 0, color: '#6b7280' }}>Class: {selectedStudent.class} - {selectedStudent.section} | Roll: {selectedStudent.rollNo}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '14px' }}>Date of Leaving</label>
                        <input
                            type="date"
                            value={tcDetails.dateOfLeaving}
                            onChange={e => setTcDetails({ ...tcDetails, dateOfLeaving: e.target.value })}
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '14px' }}>Reason for Leaving</label>
                        <select
                            value={tcDetails.reason}
                            onChange={e => setTcDetails({ ...tcDetails, reason: e.target.value })}
                            className="glass-input"
                            style={{ width: '100%' }}
                        >
                            <option>Completed Course</option>
                            <option>Parent's Transfer</option>
                            <option>Health Issues</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '14px' }}>Conduct</label>
                        <input
                            type="text"
                            value={tcDetails.conduct}
                            onChange={e => setTcDetails({ ...tcDetails, conduct: e.target.value })}
                            className="glass-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '14px' }}>Remarks</label>
                        <input
                            type="text"
                            value={tcDetails.remarks}
                            onChange={e => setTcDetails({ ...tcDetails, remarks: e.target.value })}
                            className="glass-input"
                            placeholder="Optional..."
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button
                        onClick={handleConfirmIssue}
                        className="btn"
                        style={{ flex: 1, background: '#fee2e2', color: '#991b1b', justifyContent: 'center' }}
                    >
                        <AlertTriangle size={18} />
                        Confirm Issue TC
                    </button>
                    <button
                        onClick={() => setShowIssueModal(false)}
                        className="btn"
                        style={{ flex: 1, background: '#f3f4f6', color: '#374151', justifyContent: 'center' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={28} />
                Transfer Certificate (TC)
            </h2>

            <div className="glass-panel" style={{ padding: '20px' }}>
                {/* View Toggle */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '16px' }}>
                    <button
                        onClick={() => setView('active')}
                        className="btn"
                        style={{
                            background: view === 'active' ? '#4f46e5' : 'transparent',
                            color: view === 'active' ? 'white' : '#6b7280',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            border: view === 'active' ? 'none' : '1px solid transparent'
                        }}
                    >
                        Issue TC (Active)
                    </button>
                    <button
                        onClick={() => setView('transferred')}
                        className="btn"
                        style={{
                            background: view === 'transferred' ? '#4f46e5' : 'transparent',
                            color: view === 'transferred' ? 'white' : '#6b7280',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            border: view === 'transferred' ? 'none' : '1px solid transparent'
                        }}
                    >
                        History (Transferred)
                    </button>
                </div>

                {/* Filters & Controls */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Search Student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="glass-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>

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
                </div>

                {/* Table View */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Class/Sec</th>
                                <th style={{ padding: '12px' }}>Roll No</th>
                                <th style={{ padding: '12px' }}>{view === 'active' ? 'Admission Date' : 'Date of Leaving'}</th>
                                <th style={{ padding: '12px' }}>{view === 'active' ? 'Action' : 'Reason'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{student.name}</td>
                                    <td style={{ padding: '12px' }}>{student.class} - {student.section}</td>
                                    <td style={{ padding: '12px' }}>{student.rollNo}</td>
                                    <td style={{ padding: '12px' }}>
                                        {view === 'active' ? student.admissionDate : student.tcDetails?.dateOfLeaving}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {view === 'active' ? (
                                            <button
                                                onClick={() => handleIssueClick(student)}
                                                className="btn"
                                                style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', fontSize: '13px' }}
                                            >
                                                Issue TC
                                            </button>
                                        ) : (
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                                {student.tcDetails?.reason || 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        {view === 'active'
                                            ? 'No active students found matching your filters.'
                                            : 'No transferred students found in the last 3 months.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {view === 'transferred' && (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', fontStyle: 'italic' }}>
                        * History only shows students transferred in the last 3 months.
                    </p>
                )}
            </div>

            {showIssueModal && selectedStudent && <IssueTCModal />}
        </div>
    );
};

export default TransferCertificate;
