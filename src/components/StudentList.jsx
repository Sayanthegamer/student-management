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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="m-0 text-slate-800 text-2xl font-bold tracking-tight">Student Records</h2>
                <button onClick={onAdd} className="btn btn-primary shadow-indigo-200">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name, Roll No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10"
                    />
                </div>

                {/* Filters */}
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
                    value={filterFeeStatus}
                    onChange={(e) => setFilterFeeStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[130px]"
                >
                    <option value="">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>

                {/* Sorting */}
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

                <div className="w-px h-8 bg-slate-200 mx-1"></div>

                <div>
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto cursor-pointer"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Name</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Class/Sec</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Roll No</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Fees ({filterMonth})</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map(student => {
                            const status = getFeeStatusForMonth(student, filterMonth);
                            return (
                                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-medium text-slate-700">{student.name}</td>
                                    <td className="p-4 text-slate-500">{student.class} - {student.section}</td>
                                    <td className="p-4 text-slate-500">{student.rollNo}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handlePayFeeClick(student)}
                                                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
                                                title="Pay Fees"
                                            >
                                                <IndianRupee size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(student)}
                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(student.id)}
                                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
                                                title="Delete"
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
                                <td colSpan="5" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-20" />
                                        <p>No students found matching your criteria.</p>
                                    </div>
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
                        <div key={student.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="m-0 text-lg font-bold text-slate-800">{student.name}</h3>
                                    <p className="m-0 mt-1 text-sm text-slate-500 font-medium">Class: {student.class}-{student.section} <span className="mx-1 text-slate-300">|</span> Roll: {student.rollNo}</p>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${status === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}
                                >
                                    {status}
                                </span>
                            </div>

                            <div className="flex justify-end items-center mt-4 pt-4 border-t border-slate-100">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePayFeeClick(student)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100 flex items-center gap-2"
                                    >
                                        <IndianRupee size={16} /> Pay
                                    </button>
                                    <button
                                        onClick={() => onEdit(student)}
                                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(student.id)}
                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
