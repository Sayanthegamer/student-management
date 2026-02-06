import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus, IndianRupee, Filter, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';
import CustomMonthPicker from './CustomMonthPicker';
import Pagination from './Pagination';
import StudentCard from './StudentCard';

const getFeeStatusForMonth = (student, month) => {
    const isPaid = student.feeHistory?.some(p => p.month === month);
    if (isPaid) return 'Paid';

    const currentMonth = new Date().toISOString().slice(0, 7);
    return month < currentMonth ? 'Overdue' : 'Pending';
};

const StudentList = ({ students, onEdit, onDelete, onAdd, onPayFee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState(''); // 'Paid', 'Pending', or ''
    const [sortBy, setSortBy] = useState('name'); // name, rollNo
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Get unique classes and sections for filters
    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => students
        .filter(student => {
            const matchesSearch = student.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                student.rollNo?.includes(debouncedSearchTerm) ||
                student.class?.includes(debouncedSearchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

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
        }), [students, debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, filterMonth, sortBy, sortOrder]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, filterMonth]);

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

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterClass('');
        setFilterSection('');
        setFilterFeeStatus('');
    }, []);

    if (students.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserPlus size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No students yet</h2>
                <p className="text-slate-500 mb-8 text-lg">Start building your database by adding your first student record.</p>
                <button onClick={onAdd} className="btn btn-primary px-8 py-4 text-lg">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden page-enter">
                <div className="p-3 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Student Directory</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage and track student records and fees</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:min-w-[220px] md:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-base md:text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Filter size={20} />
                            </button>
                            <button onClick={onAdd} className="btn btn-primary py-2 px-4 text-sm whitespace-nowrap hidden md:inline-flex">
                                <Plus size={18} />
                                Add <span className="hidden lg:inline">Student</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="p-3 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 slide-down">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Class</label>
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Section</label>
                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Fee Status</label>
                            <select
                                value={filterFeeStatus}
                                onChange={(e) => setFilterFeeStatus(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                            >
                                <option value="">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Fee Month</label>
                            <CustomMonthPicker
                                value={filterMonth}
                                onChange={setFilterMonth}
                                compact={true}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                                >
                                    <option value="name">Name</option>
                                    <option value="rollNo">Roll No</option>
                                    <option value="class">Class</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                {sortOrder === 'asc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="md:hidden px-4 pt-4 pb-4 space-y-3">
                    {currentStudents.length > 0 ? (
                        currentStudents.map((student, index) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                status={getFeeStatusForMonth(student, filterMonth)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPayFee={handlePayFeeClick}
                            />
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <div className="p-5 bg-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-600 font-bold text-base">No results found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search term</p>
                            <button
                                onClick={handleClearFilters}
                                className="text-indigo-600 text-sm font-bold hover:underline mt-4 touch-manipulation min-h-[44px] px-4"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Info</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Class Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Fee Status ({filterMonth})</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentStudents.map(student => {
                                const status = getFeeStatusForMonth(student, filterMonth);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">{student.name}</p>
                                                    <p className="text-slate-400 text-xs truncate">ID: {student.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 font-medium">Class {student.class} - {student.section}</span>
                                                <span className="text-xs text-slate-400">Roll No: {student.rollNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : status === 'Overdue'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handlePayFeeClick(student)}
                                                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all"
                                                    title="Collect Fee"
                                                >
                                                    <IndianRupee size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(student.id)}
                                                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                                                    title="Delete Record"
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
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <Search size={32} className="text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-medium">No results found</p>
                                                <p className="text-slate-400 text-sm">Try adjusting your filters or search term</p>
                                            </div>
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-indigo-600 text-sm font-semibold hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStudents.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
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
