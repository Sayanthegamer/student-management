import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';
import CustomDatePicker from './CustomDatePicker';
import CertificateCard from './CertificateCard';
import { logActivity } from '../utils/storage';

const TransferCertificate = ({ students, onUpdateStudent, user }) => {
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
        alert('Transfer Certificate Issued Successfully!');
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
            alert('Downloading Transfer Certificate...');
        } else if (action === 'regenerate') {
            // Regenerate existing TC
            alert('Regenerating Transfer Certificate...');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 md:p-6 max-w-6xl mx-auto">
            <h2 className="text-slate-800 mb-6 text-xl md:text-2xl flex items-center gap-3 font-bold tracking-tight">
                <FileText size={28} className="text-indigo-600" />
                Transfer Certificate (TC)
            </h2>

            {/* View Toggle */}
            <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
                <button
                    onClick={() => setView('active')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${view === 'active'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    Issue TC (Active)
                </button>
                <button
                    onClick={() => setView('transferred')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${view === 'transferred'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    History (Transferred)
                </button>
            </div>

            {/* Filters & Controls */}
            <div className="flex gap-3 mb-6 flex-wrap items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10"
                    />
                </div>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[120px]"
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>

                <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[120px]"
                >
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto"
                >
                    <option value="name">Sort: Name</option>
                    <option value="rollNo">Sort: Roll No</option>
                    <option value="class">Sort: Class</option>
                </select>

                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="btn bg-slate-50 border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                </button>
            </div>

            {/* Table View (Desktop) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Name</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Class/Sec</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Roll No</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">{view === 'active' ? 'Admission Date' : 'Date of Leaving'}</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">{view === 'active' ? 'Action' : 'Reason'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-medium text-slate-700">{student.name}</td>
                                <td className="p-4 text-slate-500">{student.class} - {student.section}</td>
                                <td className="p-4 text-slate-500">{student.rollNo}</td>
                                <td className="p-4 text-slate-500">
                                    {view === 'active' ? student.admissionDate : student.tcDetails?.dateOfLeaving}
                                </td>
                                <td className="p-4 text-right">
                                    {view === 'active' ? (
                                        <button
                                            onClick={() => handleIssueClick(student)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors border border-rose-100"
                                        >
                                            Issue TC
                                        </button>
                                    ) : (
                                        <span className="text-slate-500 text-sm italic">
                                            {student.tcDetails?.reason || 'N/A'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {currentStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-20" />
                                        <p>{view === 'active'
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
            <div className="md:hidden px-4 pt-4 pb-4 space-y-3">
                {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                        <CertificateCard
                            key={student.id}
                            student={student}
                            onGenerateTC={handleGenerateTC}
                        />
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <div className="p-5 bg-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-600 font-bold text-base">No results found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search term</p>
                    </div>
                )}
            </div>
            {view === 'transferred' && (
                <p className="text-center text-xs text-slate-400 mt-4 italic">
                    * History only shows students transferred in the last 3 months.
                </p>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage}
            />

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
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 modal-backdrop ${isClosing ? 'closing' : ''}`}>
            <div className={`bg-white rounded-2xl shadow-xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto ${isClosing ? 'scale-out' : 'scale-in'}`}>
                <h3 className="mt-0 text-white bg-slate-900 px-6 py-5 md:py-8 text-xl font-bold border-b border-slate-700">
                    Issue Transfer Certificate
                </h3>

                <div className="p-6 md:p-8">
                    <div className="mb-5">
                        <p className="m-0 mb-2 font-bold text-lg text-gray-800">{student.name}</p>
                        <p className="m-0 text-gray-500">Class: {student.class} - {student.section} | Roll: {student.rollNo}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                    <div>
                        <CustomDatePicker
                            label="Date of Leaving"
                            value={tcDetails.dateOfLeaving}
                            onChange={val => setTcDetails({ ...tcDetails, dateOfLeaving: val })}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-gray-600 text-sm font-medium">Reason for Leaving</label>
                        <select
                            value={tcDetails.reason}
                            onChange={e => setTcDetails({ ...tcDetails, reason: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>Completed Course</option>
                            <option>Parent's Transfer</option>
                            <option>Health Issues</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-gray-600 text-sm font-medium">Conduct</label>
                        <input
                            type="text"
                            value={tcDetails.conduct}
                            onChange={e => setTcDetails({ ...tcDetails, conduct: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-gray-600 text-sm font-medium">Remarks</label>
                        <input
                            type="text"
                            value={tcDetails.remarks}
                            onChange={e => setTcDetails({ ...tcDetails, remarks: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Optional..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => handleExit(onConfirm)}
                        className="btn flex-1 bg-red-100 text-red-800 justify-center hover:bg-red-200"
                    >
                        <AlertTriangle size={18} />
                        Confirm Issue TC
                    </button>
                    <button
                        onClick={() => handleExit(onCancel)}
                        className="btn flex-1 bg-gray-100 text-gray-700 justify-center hover:bg-gray-200"
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
