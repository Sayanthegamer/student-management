import React, { useState, useMemo, useCallback } from 'react';
import { Edit2, Trash2, Search, Plus, IndianRupee } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';
import CustomMonthPicker from './CustomMonthPicker';
import Pagination from './Pagination';

const getFeeStatusForMonth = (student, month) => {
    const isPaid = student.feeHistory?.some(p => p.month === month);
    if (isPaid) return 'Paid';

    const currentMonth = new Date().toISOString().slice(0, 7);
    return month < currentMonth ? 'Overdue' : 'Pending';
};

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
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Get unique classes and sections for filters
    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => students
        .filter(student => {
            const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo?.includes(searchTerm) ||
                student.class?.includes(searchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

            // Default: Hide 'Transferred' students unless we add a specific filter for them later
            // For now, let's just show Active students
            const isNotTransferred = student.admissionStatus !== 'Transferred';

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
        }), [students, searchTerm, filterClass, filterSection, filterFeeStatus, filterMonth, sortBy, sortOrder]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterClass, filterSection, filterFeeStatus, filterMonth]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const currentStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePayFeeClick = useCallback((student) => {
        setSelectedStudentForFee(student);
        setShowPaymentModal(true);
    }, []);

    const handlePaymentSave = useCallback((studentId, paymentDetails) => {
        onPayFee(studentId, paymentDetails);
        setShowPaymentModal(false);
        setSelectedStudentForFee(null);
    }, [onPayFee]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-3">
                <h2 className="m-0 text-slate-800 text-xl md:text-2xl font-bold tracking-tight">Student Records</h2>
                <button onClick={onAdd} className="btn btn-primary shadow-indigo-200 text-sm md:text-base px-4 md:px-6 py-2 md:py-3 min-h-[44px]">
                    <Plus size={20} />
                    <span className="md:inline">Add Student</span>
                    <span className="hidden md:inline"></span>
                </button>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 transition-all active:bg-slate-100 min-h-[44px]"
                >
                    <Search size={18} />
                    Filters & Search
                    <svg className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Filters - Collapsible on Mobile */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-4 md:mb-6 space-y-3 md:space-y-0`}>
                <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
                    <div className="relative col-span-2 md:col-span-1 md:flex-1 md:min-w-[240px]">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name, Roll No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10 text-base"
                        />
                    </div>

                    {/* Filters */}
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full md:w-auto md:min-w-[120px] text-base"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full md:w-auto md:min-w-[120px] text-base"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>

                    <select
                        value={filterFeeStatus}
                        onChange={(e) => setFilterFeeStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full md:w-auto md:min-w-[130px] text-base"
                    >
                        <option value="">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>

                    {/* Sorting */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full md:w-auto text-base"
                    >
                        <option value="name">Sort: Name</option>
                        <option value="rollNo">Sort: Roll No</option>
                        <option value="class">Sort: Class</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="btn bg-slate-50 border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 w-full md:w-auto flex justify-center min-h-[44px]"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {sortOrder === 'asc' ? '↓' : '↑'}
                    </button>

                    <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>

                    <div className="col-span-2 md:col-span-1">
                        <CustomMonthPicker
                            value={filterMonth}
                            onChange={setFilterMonth}
                        />
                    </div>
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
                        {currentStudents.map(student => {
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
                                                : status === 'Overdue'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
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
                                                aria-label={`Pay fees for ${student.name}`}
                                            >
                                                <IndianRupee size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(student)}
                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                title="Edit"
                                                aria-label={`Edit ${student.name}`}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(student.id)}
                                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
                                                title="Delete"
                                                aria-label={`Delete ${student.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {currentStudents.length === 0 && (
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
            <div className="flex md:hidden flex-col gap-3">
                {currentStudents.map(student => {
                    const status = getFeeStatusForMonth(student, filterMonth);
                    return (
                        <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="m-0 text-base font-bold text-slate-800">{student.name}</h3>
                                    <p className="m-0 mt-1 text-xs md:text-sm text-slate-500 font-medium truncate">Class: {student.class}-{student.section} <span className="mx-1 text-slate-300">|</span> Roll: {student.rollNo}</p>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded-md text-xs font-bold border shrink-0 ml-2 ${status === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : status === 'Overdue'
                                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}
                                >
                                    {status}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handlePayFeeClick(student)}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100 flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
                                    aria-label={`Pay fees for ${student.name}`}
                                >
                                    <IndianRupee size={16} /> Pay
                                </button>
                                <button
                                    onClick={() => onEdit(student)}
                                    className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 min-w-[44px] min-h-[44px] touch-manipulation"
                                    aria-label={`Edit ${student.name}`}
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(student.id)}
                                    className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 min-w-[44px] min-h-[44px] touch-manipulation"
                                    aria-label={`Delete ${student.name}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {currentStudents.length === 0 && (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Search size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No students found.</p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage}
            />

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
