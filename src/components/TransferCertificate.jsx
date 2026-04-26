import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, AlertTriangle, X } from 'lucide-react';
import Pagination from './Pagination';
import CustomDatePicker from './CustomDatePicker';
import CertificateCard from './CertificateCard';
import { useToast } from '../context/ToastContext';
import { logActivity } from '../utils/storage';

const TransferCertificate = ({ students, onUpdateStudent, user }) => {
    const { showToast } = useToast();
    const [view, setView] = useState('active'); // 'active' or 'transferred'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, rollNo
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [tcDetails, setTcDetails] = useState({
        reason: 'Completed Course',
        conduct: 'Good',
        dateOfLeaving: new Date().toISOString().slice(0, 10),
        remarks: ''
    });

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterClass, filterSection, view]);

    // Get unique classes and sections for filters
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students
        .filter(student => {
            // Filter based on View Mode
            if (view === 'active') {
                if (student.admissionStatus === 'Transferred') return false;
            }

            if (view === 'transferred') {
                if (student.admissionStatus !== 'Transferred') return false;

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

            const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo?.includes(searchTerm) ||
                student.class?.includes(searchTerm);
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

    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const currentStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

        const currentDate = new Date().toISOString().slice(0, 10);

        const updatedStudent = {
            ...selectedStudent,
            admissionStatus: 'Transferred',
            tcDetails: {
                ...tcDetails,
                issueDate: currentDate
            },
            // Add status change metadata (Issue 4 fix)
            lastStatusChangeDate: currentDate,
            lastStatusChangedBy: user?.email || user?.id || 'system'
        };

        logActivity('tc', `Issued TC for ${selectedStudent.name} (Class ${selectedStudent.class})`);
        onUpdateStudent(updatedStudent);
        setShowIssueModal(false);
        setSelectedStudent(null);
        showToast('Transfer Certificate Issued Successfully!', 'success');
    };

    const handleGenerateTC = (studentId, action) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        if (action === 'generate') {
            // Show the issue modal for generating a new TC
            setSelectedStudent(student);
            setTcDetails({
                reason: 'Completed Course',
                conduct: 'Good',
                dateOfLeaving: new Date().toISOString().slice(0, 10),
                remarks: ''
            });
            setShowIssueModal(true);
        } else if (action === 'download') {
            // In a real implementation, this would generate and download the PDF
            showToast('Downloading Transfer Certificate...', 'info');
        } else if (action === 'regenerate') {
            // Regenerate existing TC
            showToast('Regenerating Transfer Certificate...', 'info');
        }
    };

    return (
        <div className="bg-[var(--bg-card)] rounded-[16px] shadow-sm border border-[var(--border-color)] p-4 md:p-8 max-w-6xl mx-auto">
            <h2 className="text-[var(--text-primary)] mb-8 text-2xl md:text-3xl flex items-center gap-3 font-bold tracking-tight flex-wrap">
                <FileText size={32} className="text-[var(--accent-primary)] stroke-[2.5px]" />
                Transfer Certificate
            </h2>

            {/* View Toggle */}
            <div className="flex flex-row gap-3 md:gap-4 mb-6 md:mb-8 border-b border-[var(--border-color)] pb-4 md:pb-6">
                <button
                    onClick={() => setView('active')}
                    className={`flex-1 px-4 py-3 text-xs sm:text-sm transition-colors font-bold whitespace-nowrap text-center rounded-[12px] border ${view === 'active'
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)]'
                        }`}
                >
                    Issue TC (Active)
                </button>
                <button
                    onClick={() => setView('transferred')}
                    className={`flex-1 px-4 py-3 text-xs sm:text-sm transition-colors font-bold whitespace-nowrap text-center rounded-[12px] border ${view === 'transferred'
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)]'
                        }`}
                >
                    History
                </button>
            </div>

            {/* Filters & Controls */}
            <div className="flex gap-2.5 md:gap-4 mb-6 md:mb-8 flex-wrap items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-2.5 md:py-3 rounded-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium placeholder:text-[var(--text-muted)] pl-12"
                    />
                </div>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 md:px-4 py-2.5 md:py-3 rounded-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium appearance-none w-auto min-w-[120px] md:min-w-[140px] cursor-pointer"
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>

                <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 md:px-4 py-2.5 md:py-3 rounded-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium appearance-none w-auto min-w-[120px] md:min-w-[140px] cursor-pointer"
                >
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 md:px-4 py-2.5 md:py-3 rounded-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium appearance-none w-auto cursor-pointer"
                >
                    <option value="name">Sort: Name</option>
                    <option value="rollNo">Sort: Roll No</option>
                    <option value="class">Sort: Class</option>
                </select>

                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="bg-[var(--bg-main)] border border-[var(--border-color)] p-3 text-[var(--text-secondary)] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] rounded-[12px] transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                </button>
            </div>

            {/* Table View (Desktop) */}
            <div className="hidden md:block overflow-hidden rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-main)]">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                        <tr>
                            <th className="p-4 font-bold tracking-wider uppercase text-[var(--text-secondary)] text-[10px]">Name</th>
                            <th className="p-4 font-bold tracking-wider uppercase text-[var(--text-secondary)] text-[10px]">Class/Sec</th>
                            <th className="p-4 font-bold tracking-wider uppercase text-[var(--text-secondary)] text-[10px]">Roll No</th>
                            <th className="p-4 font-bold tracking-wider uppercase text-[var(--text-secondary)] text-[10px]">{view === 'active' ? 'Admission Date' : 'Date of Leaving'}</th>
                            <th className="p-4 font-bold tracking-wider uppercase text-[var(--text-secondary)] text-[10px] text-right">{view === 'active' ? 'Action' : 'Reason'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {currentStudents.map(student => (
                            <tr key={student.id} className="hover:bg-[var(--bg-card-hover)] transition-colors bg-[var(--bg-card)]">
                                <td className="p-4 text-[var(--text-primary)] font-bold text-sm">{student.name}</td>
                                <td className="p-4 text-[var(--text-primary)] font-medium text-sm">{student.class} - {student.section}</td>
                                <td className="p-4 text-[var(--text-primary)] font-mono font-medium text-sm">{student.rollNo}</td>
                                <td className="p-4 text-[var(--text-primary)] font-medium text-sm">
                                    {view === 'active' ? student.admissionDate : student.tcDetails?.dateOfLeaving}
                                </td>
                                <td className="p-4 text-right">
                                    {view === 'active' ? (
                                        <button
                                            onClick={() => handleIssueClick(student)}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white font-bold text-xs rounded-[8px] transition-colors"
                                        >
                                            Issue TC
                                        </button>
                                    ) : (
                                        <span className="text-[var(--text-secondary)] text-xs font-mono font-semibold tracking-wide uppercase">
                                            {student.tcDetails?.reason || 'N/A'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {currentStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-16 text-center text-[var(--text-secondary)] bg-[var(--bg-card)]">
                                    <div className="flex flex-col items-center gap-4">
                                        <Search size={48} className="text-[var(--text-muted)]" />
                                        <p className="font-medium text-sm text-[var(--text-primary)]">{view === 'active'
                                            ? 'No active students found matching your filters.'
                                            : 'No transferred students found in the last 3 months.'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden pt-4 pb-4 space-y-4">
                {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                        <CertificateCard
                            key={student.id}
                            student={student}
                            onGenerateTC={handleGenerateTC}
                        />
                    ))
                ) : (
                    <div className="py-16 text-center border border-[var(--border-color)] rounded-[16px] bg-[var(--bg-card)] shadow-sm">
                        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-[var(--bg-main)] rounded-[16px] border border-[var(--border-color)]">
                            <Search size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-primary)] font-bold text-lg">No results found</p>
                        <p className="text-[var(--text-secondary)] font-medium text-sm mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>
            {view === 'transferred' && (
                <p className="text-center text-[10px] text-[var(--text-secondary)] mt-6 font-mono tracking-wide uppercase">
                    * History only shows students transferred in the last 3 months.
                </p>
            )}

            <div className="mt-8 border-t border-[var(--border-color)] pt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredStudents.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {showIssueModal && selectedStudent && (
                <IssueTCModal
                    student={selectedStudent}
                    tcDetails={tcDetails}
                    setTcDetails={setTcDetails}
                    onConfirm={handleConfirmIssue}
                    onCancel={() => setShowIssueModal(false)}
                />
            )}
        </div>
    );
};

const IssueTCModal = ({ student, tcDetails, setTcDetails, onConfirm, onCancel }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleExit = (callback) => {
        setIsClosing(true);
        setTimeout(() => {
            callback();
            setIsClosing(false);
        }, 200);
    };

    return createPortal(
        <div 
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 modal-backdrop ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleExit(onCancel);
            }}
        >
            <div className={`bg-[var(--bg-card)] rounded-[24px] shadow-xl border border-[var(--border-color)] w-[90%] max-w-lg max-h-[90vh] overflow-y-auto ${isClosing ? 'scale-out' : 'scale-in'}`}>
            <div className="relative">
                <h3 className="mt-0 text-rose-400 bg-rose-500/10 px-6 py-5 md:py-8 text-xl font-bold border-b border-rose-500/20 flex items-center gap-3">
                    <AlertTriangle size={24} className="text-rose-400 stroke-[2.5px]" />
                    Issue Transfer Certificate
                </h3>
                <button
                    onClick={() => handleExit(onCancel)}
                    className="absolute top-3 right-3 md:top-6 md:right-6 text-rose-400 hover:bg-rose-500/20 p-3 min-h-[44px] min-w-[44px] rounded-[12px] transition-colors z-20 flex items-center justify-center"
                    aria-label="Close"
                >
                    <X size={20} className="stroke-[2.5px]" />
                </button>
            </div>

                <div className="p-5 md:p-10">
                    <div className="mb-8 border-b border-[var(--border-color)] pb-6">
                        <p className="m-0 mb-2 font-bold text-2xl text-[var(--text-primary)]">{student.name}</p>
                        <p className="m-0 text-[var(--text-secondary)] font-mono tracking-wide text-sm">Class: {student.class} - {student.section} | Roll: {student.rollNo}</p>
                    </div>

                    <div className="flex flex-col gap-6">
                    <div>
                        <CustomDatePicker
                            label="Date of Leaving"
                            value={tcDetails.dateOfLeaving}
                            onChange={val => setTcDetails({ ...tcDetails, dateOfLeaving: val })}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Reason for Leaving</label>
                        <select
                            value={tcDetails.reason}
                            onChange={e => setTcDetails({ ...tcDetails, reason: e.target.value })}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 md:py-4 rounded-[12px] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium text-sm outline-none appearance-none transition-colors cursor-pointer"
                        >
                            <option>Completed Course</option>
                            <option>Parent's Transfer</option>
                            <option>Health Issues</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Conduct</label>
                        <input
                            type="text"
                            value={tcDetails.conduct}
                            onChange={e => setTcDetails({ ...tcDetails, conduct: e.target.value })}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 md:py-4 rounded-[12px] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium text-sm outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Remarks</label>
                        <input
                            type="text"
                            value={tcDetails.remarks}
                            onChange={e => setTcDetails({ ...tcDetails, remarks: e.target.value })}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 md:py-4 rounded-[12px] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-medium text-sm outline-none transition-colors placeholder:text-[var(--text-muted)]"
                            placeholder="Optional..."
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <button
                        onClick={() => handleExit(onConfirm)}
                        className="flex-1 bg-rose-600 text-white hover:bg-rose-700 font-bold rounded-[12px] p-3.5 md:p-4 transition-colors justify-center flex items-center gap-3 min-h-[48px]"
                    >
                        <AlertTriangle size={20} className="stroke-[2.5px]" />
                        Confirm TC
                    </button>
                    <button
                        onClick={() => handleExit(onCancel)}
                        className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] font-bold rounded-[12px] p-3.5 md:p-4 transition-colors justify-center flex items-center min-h-[48px]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>,
        document.body
    );
};

export default TransferCertificate;
