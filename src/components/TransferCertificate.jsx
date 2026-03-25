import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, AlertTriangle, X } from 'lucide-react';
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
        <div className="bg-[#0a0a0a] rounded-none shadow-none border border-white/20 p-4 md:p-8 max-w-6xl mx-auto">
            <h2 className="text-white mb-8 text-2xl md:text-3xl flex items-center gap-4 font-black uppercase tracking-widest">
                <FileText size={32} className="text-[#CCFF00] stroke-[3px]" />
                Transfer Certificate
            </h2>

            {/* View Toggle */}
            <div className="flex gap-4 mb-8 border-b border-white/20 pb-6">
                <button
                    onClick={() => setView('active')}
                    className={`px-6 py-3 text-sm transition-colors uppercase tracking-widest font-black ${view === 'active'
                        ? 'bg-[#CCFF00] text-black border border-[#CCFF00]'
                        : 'bg-transparent text-white/50 border border-transparent hover:border-white/50 hover:text-white'
                        }`}
                >
                    Issue TC (Active)
                </button>
                <button
                    onClick={() => setView('transferred')}
                    className={`px-6 py-3 text-sm transition-colors uppercase tracking-widest font-black ${view === 'transferred'
                        ? 'bg-[#CCFF00] text-black border border-[#CCFF00]'
                        : 'bg-transparent text-white/50 border border-transparent hover:border-white/50 hover:text-white'
                        }`}
                >
                    History
                </button>
            </div>

            {/* Filters & Controls */}
            <div className="flex gap-4 mb-8 flex-wrap items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 stroke-[3px]" />
                    <input
                        type="text"
                        placeholder="SEARCH STUDENT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] font-black uppercase tracking-widest placeholder:text-white/20 pl-12"
                    />
                </div>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] font-black uppercase tracking-widest appearance-none w-auto min-w-[140px]"
                >
                    <option value="">ALL CLASSES</option>
                    {classes.map(c => <option key={c} value={c}>CLASS {c}</option>)}
                </select>

                <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] font-black uppercase tracking-widest appearance-none w-auto min-w-[140px]"
                >
                    <option value="">ALL SECTIONS</option>
                    {sections.map(s => <option key={s} value={s}>SEC {s}</option>)}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] font-black uppercase tracking-widest appearance-none w-auto"
                >
                    <option value="name">SORT: NAME</option>
                    <option value="rollNo">SORT: ROLL NO</option>
                    <option value="class">SORT: CLASS</option>
                </select>

                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="btn bg-[#050505] border border-white/20 p-3 text-white font-black hover:border-white rounded-none transition-colors"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                </button>
            </div>

            {/* Table View (Desktop) */}
            <div className="hidden md:block overflow-hidden rounded-none border border-white/20 bg-[#0a0a0a]">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-[#050505] border-b border-white/20">
                        <tr>
                            <th className="p-4 font-black text-white/50 text-[10px] uppercase tracking-widest">Name</th>
                            <th className="p-4 font-black text-white/50 text-[10px] uppercase tracking-widest">Class/Sec</th>
                            <th className="p-4 font-black text-white/50 text-[10px] uppercase tracking-widest">Roll No</th>
                            <th className="p-4 font-black text-white/50 text-[10px] uppercase tracking-widest">{view === 'active' ? 'Admission Date' : 'Date of Leaving'}</th>
                            <th className="p-4 font-black text-white/50 text-[10px] uppercase tracking-widest text-right">{view === 'active' ? 'Action' : 'Reason'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {currentStudents.map(student => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-white font-black uppercase tracking-widest text-sm">{student.name}</td>
                                <td className="p-4 text-white font-black uppercase tracking-widest text-sm">{student.class} - {student.section}</td>
                                <td className="p-4 text-white font-black uppercase tracking-widest text-sm">{student.rollNo}</td>
                                <td className="p-4 text-white font-black uppercase tracking-widest text-sm">
                                    {view === 'active' ? student.admissionDate : student.tcDetails?.dateOfLeaving}
                                </td>
                                <td className="p-4 text-right">
                                    {view === 'active' ? (
                                        <button
                                            onClick={() => handleIssueClick(student)}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black uppercase tracking-widest font-black text-[10px] rounded-none bg-transparent transition-colors"
                                        >
                                            Issue TC
                                        </button>
                                    ) : (
                                        <span className="text-white/50 text-xs font-mono tracking-wide uppercase">
                                            {student.tcDetails?.reason || 'N/A'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {currentStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-16 text-center text-white/50">
                                    <div className="flex flex-col items-center gap-4">
                                        <Search size={48} className="opacity-20 stroke-[1px]" />
                                        <p className="uppercase tracking-widest font-black text-sm">{view === 'active'
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
                    <div className="py-16 text-center border border-white/20 bg-[#050505]">
                        <div className="p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                            <Search size={48} className="text-white/30 stroke-[1px]" />
                        </div>
                        <p className="text-white font-black uppercase tracking-widest text-lg">No results found</p>
                        <p className="text-white/50 uppercase tracking-widest font-mono text-xs mt-2">Try adjusting your filters</p>
                    </div>
                )}
            </div>
            {view === 'transferred' && (
                <p className="text-center text-[10px] text-white/50 mt-6 font-mono tracking-wide uppercase">
                    * History only shows students transferred in the last 3 months.
                </p>
            )}

            <div className="mt-8 border-t border-white/20 pt-6">
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
            className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 modal-backdrop ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleExit(onCancel);
            }}
        >
            <div className={`bg-[#0a0a0a] rounded-none shadow-none border border-rose-500 w-[90%] max-w-lg max-h-[90vh] overflow-y-auto ${isClosing ? 'scale-out' : 'scale-in'}`}>
            <div className="relative">
                <h3 className="mt-0 text-black bg-rose-500 px-6 py-6 md:py-8 text-xl font-black uppercase tracking-widest border-b border-rose-500">
                    Issue Transfer Certificate
                </h3>
                <button
                    onClick={() => handleExit(onCancel)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-black border border-black hover:bg-black hover:text-rose-500 p-3 min-h-[48px] min-w-[48px] rounded-none transition-colors z-20 flex items-center justify-center"
                >
                    <X size={20} className="stroke-[3px]" />
                </button>
            </div>

                <div className="p-6 md:p-10">
                    <div className="mb-8 border-b border-white/10 pb-6">
                        <p className="m-0 mb-2 font-black text-2xl text-white uppercase tracking-widest">{student.name}</p>
                        <p className="m-0 text-white/50 font-mono tracking-wide uppercase text-sm">Class: {student.class} - {student.section} | Roll: {student.rollNo}</p>
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
                        <label className="block mb-2 text-[10px] text-white/50 uppercase tracking-widest font-black">Reason for Leaving</label>
                        <select
                            value={tcDetails.reason}
                            onChange={e => setTcDetails({ ...tcDetails, reason: e.target.value })}
                            className="w-full bg-[#050505] border border-white/20 px-4 py-4 rounded-none text-white focus:border-rose-500 uppercase tracking-widest font-black text-sm outline-none appearance-none transition-colors"
                        >
                            <option>Completed Course</option>
                            <option>Parent's Transfer</option>
                            <option>Health Issues</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] text-white/50 uppercase tracking-widest font-black">Conduct</label>
                        <input
                            type="text"
                            value={tcDetails.conduct}
                            onChange={e => setTcDetails({ ...tcDetails, conduct: e.target.value })}
                            className="w-full bg-[#050505] border border-white/20 px-4 py-4 rounded-none text-white focus:border-rose-500 uppercase tracking-widest font-black text-sm outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-[10px] text-white/50 uppercase tracking-widest font-black">Remarks</label>
                        <input
                            type="text"
                            value={tcDetails.remarks}
                            onChange={e => setTcDetails({ ...tcDetails, remarks: e.target.value })}
                            className="w-full bg-[#050505] border border-white/20 px-4 py-4 rounded-none text-white focus:border-rose-500 uppercase tracking-widest font-black text-sm outline-none transition-colors placeholder:text-white/20"
                            placeholder="OPTIONAL..."
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <button
                        onClick={() => handleExit(onConfirm)}
                        className="btn flex-1 bg-rose-500 border border-rose-500 text-black hover:bg-white hover:border-white font-black uppercase tracking-widest rounded-none p-4 transition-colors justify-center flex items-center gap-3"
                    >
                        <AlertTriangle size={20} className="stroke-[3px]" />
                        Confirm TC
                    </button>
                    <button
                        onClick={() => handleExit(onCancel)}
                        className="btn flex-1 bg-transparent border border-white/20 text-white hover:border-white font-black uppercase tracking-widest rounded-none p-4 transition-colors justify-center flex items-center"
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
