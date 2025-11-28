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

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-white mb-6 text-2xl flex items-center gap-3 font-bold">
                <FileText size={28} />
                Transfer Certificate (TC)
            </h2>

            <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-5">
                {/* View Toggle */}
                <div className="flex gap-2 mb-6 border-b border-black/10 pb-4">
                    <button
                        onClick={() => setView('active')}
                        className={`btn rounded-full px-5 py-2 border transition-all ${view === 'active'
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-black/5'
                            }`}
                    >
                        Issue TC (Active)
                    </button>
                    <button
                        onClick={() => setView('transferred')}
                        className={`btn rounded-full px-5 py-2 border transition-all ${view === 'transferred'
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-black/5'
                            }`}
                    >
                        History (Transferred)
                    </button>
                </div>

                {/* Filters & Controls */}
                <div className="flex gap-2 mb-5 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search Student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 pl-10"
                        />
                    </div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[100px]"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[100px]"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto"
                    >
                        <option value="name">Sort: Name</option>
                        <option value="rollNo">Sort: Roll No</option>
                        <option value="class">Sort: Class</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="btn bg-white/50 p-2.5"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {sortOrder === 'asc' ? '↓' : '↑'}
                    </button>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-left">
                                <th className="p-3 font-semibold text-gray-700">Name</th>
                                <th className="p-3 font-semibold text-gray-700">Class/Sec</th>
                                <th className="p-3 font-semibold text-gray-700">Roll No</th>
                                <th className="p-3 font-semibold text-gray-700">{view === 'active' ? 'Admission Date' : 'Date of Leaving'}</th>
                                <th className="p-3 font-semibold text-gray-700">{view === 'active' ? 'Action' : 'Reason'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-100 hover:bg-white/30 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{student.name}</td>
                                    <td className="p-3 text-gray-600">{student.class} - {student.section}</td>
                                    <td className="p-3 text-gray-600">{student.rollNo}</td>
                                    <td className="p-3 text-gray-600">
                                        {view === 'active' ? student.admissionDate : student.tcDetails?.dateOfLeaving}
                                    </td>
                                    <td className="p-3">
                                        {view === 'active' ? (
                                            <button
                                                onClick={() => handleIssueClick(student)}
                                                className="btn px-3 py-1.5 bg-red-100 text-red-800 text-sm hover:bg-red-200"
                                            >
                                                Issue TC
                                            </button>
                                        ) : (
                                            <span className="text-gray-500 text-sm">
                                                {student.tcDetails?.reason || 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-500">
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
                    <p className="text-center text-xs text-gray-400 mt-4 italic">
                        * History only shows students transferred in the last 3 months.
                    </p>
                )}
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

const IssueTCModal = ({ student, tcDetails, setTcDetails, onConfirm, onCancel }) => createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mt-0 text-gray-800 border-b border-gray-200 pb-4 text-xl font-bold">
                Issue Transfer Certificate
            </h3>

            <div className="mb-5">
                <p className="m-0 mb-2 font-bold text-lg text-gray-800">{student.name}</p>
                <p className="m-0 text-gray-500">Class: {student.class} - {student.section} | Roll: {student.rollNo}</p>
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <label className="block mb-2 text-gray-600 text-sm font-medium">Date of Leaving</label>
                    <input
                        type="date"
                        value={tcDetails.dateOfLeaving}
                        onChange={e => setTcDetails({ ...tcDetails, dateOfLeaving: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
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
                    onClick={onConfirm}
                    className="btn flex-1 bg-red-100 text-red-800 justify-center hover:bg-red-200"
                >
                    <AlertTriangle size={18} />
                    Confirm Issue TC
                </button>
                <button
                    onClick={onCancel}
                    className="btn flex-1 bg-gray-100 text-gray-700 justify-center hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>,
    document.body
);

export default TransferCertificate;
