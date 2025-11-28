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
        <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-5 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                <h2 className="m-0 text-gray-800 text-xl font-bold">Student Records</h2>
                <button onClick={onAdd} className="btn btn-primary">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            <div className="flex gap-2 mb-5 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 pl-10"
                    />
                </div>

                {/* Filters */}
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
                    value={filterFeeStatus}
                    onChange={(e) => setFilterFeeStatus(e.target.value)}
                    className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[120px]"
                >
                    <option value="">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>

                {/* Sorting */}
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

                <div className="w-px h-8 bg-black/10 mx-2"></div>

                <div>
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-200 text-left">
                            <th className="p-3 font-semibold text-gray-700">Name</th>
                            <th className="p-3 font-semibold text-gray-700">Class/Sec</th>
                            <th className="p-3 font-semibold text-gray-700">Roll No</th>
                            <th className="p-3 font-semibold text-gray-700">Fees ({filterMonth})</th>
                            <th className="p-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const status = getFeeStatusForMonth(student, filterMonth);
                            return (
                                <tr key={student.id} className="border-b border-gray-100 hover:bg-white/30 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{student.name}</td>
                                    <td className="p-3 text-gray-600">{student.class} - {student.section}</td>
                                    <td className="p-3 text-gray-600">{student.rollNo}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-xl text-xs font-semibold ${status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePayFeeClick(student)}
                                                className="btn p-1.5 bg-green-100 text-green-800 hover:bg-green-200"
                                                title="Pay Fees"
                                            >
                                                <IndianRupee size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(student)}
                                                className="btn p-1.5 bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(student.id)}
                                                className="btn p-1.5 bg-red-100 text-red-800 hover:bg-red-200"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="flex md:hidden flex-col gap-4">
                {filteredStudents.map(student => {
                    const status = getFeeStatusForMonth(student, filterMonth);
                    return (
                        <div key={student.id} className="bg-white/60 p-4 rounded-xl border border-white/40 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="m-0 text-lg font-semibold text-gray-800">{student.name}</h3>
                                    <p className="m-0 mt-1 text-sm text-gray-500">Class: {student.class}-{student.section} | Roll: {student.rollNo}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-xl text-xs font-semibold ${status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}
                                >
                                    {status}
                                </span>
                            </div>

                            <div className="flex justify-end items-center mt-3 pt-3 border-t border-black/5">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePayFeeClick(student)}
                                        className="btn p-2 bg-green-100 text-green-800 hover:bg-green-200"
                                    >
                                        <IndianRupee size={18} />
                                    </button>
                                    <button
                                        onClick={() => onEdit(student)}
                                        className="btn p-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(student.id)}
                                        className="btn p-2 bg-red-100 text-red-800 hover:bg-red-200"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredStudents.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        No students found.
                    </div>
                )}
            </div>

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
