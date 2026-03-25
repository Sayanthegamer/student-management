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
            <div className="bg-[#0a0a0a] border-2 border-white/40 p-8 md:p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-[#CCFF00] border-2 border-[#CCFF00] text-black flex items-center justify-center mx-auto mb-6">
                    <UserPlus size={40} className="stroke-[2px]" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No students yet</h2>
                <p className="text-white/60 font-mono mb-8 text-lg">Start building your database by adding your first student record.</p>
                <button onClick={onAdd} className="px-8 py-4 bg-[#CCFF00] border-2 border-[#CCFF00] hover:bg-white hover:border-white text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                    <Plus size={20} className="stroke-[3px]" />
                    Initialize Student
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 lg:p-8">
            <div className="bg-[#0a0a0a] border-2 border-white/40 overflow-hidden page-enter flex flex-col">
                <div className="p-3 md:p-6 border-b border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">Student Directory</h2>
                        <p className="text-white/50 text-xs font-mono tracking-wide mt-1 uppercase">Manage and track student records and fees</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:min-w-[220px] md:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 stroke-[2.5px]" />
                            <input
                                type="text"
                                placeholder="SEARCH STUDENTS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#050505] border-2 border-white/40 focus:border-[#CCFF00] text-white outline-none transition-all text-sm font-black tracking-widest uppercase placeholder:text-white/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 border transition-all ${showFilters ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-[#050505] border-white/40 text-white hover:bg-white/10'}`}
                            >
                                <Filter size={20} className="stroke-[2.5px]" />
                            </button>
                            <button onClick={onAdd} className="px-5 py-2.5 bg-[#CCFF00] border-2 border-[#CCFF00] hover:bg-white hover:border-white text-black font-black uppercase tracking-widest transition-colors hidden md:flex items-center gap-2">
                                <Plus size={18} className="stroke-[3px]" />
                                Add <span className="hidden lg:inline">Student</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="p-3 md:p-5 bg-[#050505] border-b border-white/40 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 slide-down">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Class</label>
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="w-full bg-[#0a0a0a] border-2 border-white/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00] font-black tracking-widest uppercase"
                            >
                                <option value="">ALL CLASSES</option>
                                {classes.map(c => <option key={c} value={c}>CLASS {c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Section</label>
                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                className="w-full bg-[#0a0a0a] border-2 border-white/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00] font-black tracking-widest uppercase"
                            >
                                <option value="">ALL SECTIONS</option>
                                {sections.map(s => <option key={s} value={s}>SEC {s}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Fee Status</label>
                            <select
                                value={filterFeeStatus}
                                onChange={(e) => setFilterFeeStatus(e.target.value)}
                                className="w-full bg-[#0a0a0a] border-2 border-white/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00] font-black tracking-widest uppercase"
                            >
                                <option value="">ALL STATUS</option>
                                <option value="Paid">PAID</option>
                                <option value="Pending">PENDING</option>
                                <option value="Overdue">OVERDUE</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Fee Month</label>
                            <CustomMonthPicker
                                value={filterMonth}
                                onChange={setFilterMonth}
                                compact={true}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border-2 border-white/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00] font-black tracking-widest uppercase"
                                >
                                    <option value="name">NAME</option>
                                    <option value="rollNo">ROLL NO</option>
                                    <option value="class">CLASS</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2.5 bg-[#0a0a0a] border-2 border-white/40 text-white hover:bg-white/10 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center outline-none focus:border-[#CCFF00]"
                                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                {sortOrder === 'asc' ? <ChevronDown size={18} className="stroke-[3px]" /> : <ChevronUp size={18} className="stroke-[3px]" />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="md:hidden p-3 space-y-3">
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
                        <div className="py-16 text-center border-2 border-white/40 bg-[#050505]">
                            <div className="bg-[#0a0a0a] border-2 border-white/40 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-white/30" />
                            </div>
                            <p className="text-white font-black text-base uppercase tracking-widest">No results found</p>
                            <p className="text-white/50 font-mono text-xs mt-2 uppercase">Try adjusting your filters or search term</p>
                            <button
                                onClick={handleClearFilters}
                                className="text-[#CCFF00] text-sm font-black hover:underline mt-6 uppercase tracking-widest px-4"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                <div className="hidden md:block flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse border-t border-b border-white/40">
                        <thead>
                            <tr className="bg-[#050505] border-b border-white/40">
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Student Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Class Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Fee Status ({filterMonth})</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 bg-[#0a0a0a]">
                            {currentStudents.map(student => {
                                const status = getFeeStatusForMonth(student, filterMonth);
                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 border-2 border-[#CCFF00] bg-[#CCFF00] text-black flex items-center justify-center font-black text-base shrink-0 uppercase">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-white text-sm uppercase tracking-widest truncate">{student.name}</p>
                                                    <p className="text-white/40 font-mono text-xs mt-1 uppercase truncate">ID: {student.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-l border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white font-black uppercase tracking-widest">CLASS {student.class} - {student.section}</span>
                                                <span className="text-xs text-white/50 font-mono mt-1 uppercase">ROLL NO: {student.rollNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-l border-white/10">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 text-[10px] font-black border uppercase tracking-widest ${status === 'Paid'
                                                    ? 'bg-emerald-400 border-emerald-400 text-black'
                                                    : status === 'Overdue'
                                                        ? 'bg-rose-500 border-rose-500 text-black'
                                                        : 'bg-amber-400 border-amber-400 text-black'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right border-l border-white/10">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handlePayFeeClick(student)}
                                                    className="p-2 border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-colors"
                                                    title="Collect Fee"
                                                >
                                                    <IndianRupee size={16} className="stroke-[3px]" />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-2 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 size={16} className="stroke-[3px]" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(student.id)}
                                                    className="p-2 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} className="stroke-[3px]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {currentStudents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 border-2 border-white/40 bg-[#050505]">
                                                <Search size={32} className="text-white/30" />
                                            </div>
                                            <div>
                                                <p className="text-white font-black uppercase tracking-widest">No results found</p>
                                                <p className="text-white/50 font-mono text-sm mt-1 uppercase">Try adjusting your filters or search term</p>
                                            </div>
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-[#CCFF00] text-sm font-black hover:underline uppercase tracking-widest mt-2"
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

                <div className="px-4 py-3 bg-[#050505] border-t border-white/40">
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
