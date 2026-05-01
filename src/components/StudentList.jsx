import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus, IndianRupee, Filter, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';
import CustomMonthPicker from './CustomMonthPicker';
import Pagination from './Pagination';
import StudentCard from './StudentCard';
import useDebounce from '../hooks/useDebounce';

/**
 * Calculates the fee status for a student for a specific month.
 */
const getFeeStatusForMonth = (student, month) => {
    const isPaid = student.feeHistory?.some(p => p.month === month);
    if (isPaid) return 'Paid';

    const currentMonth = new Date().toISOString().slice(0, 7);
    return month < currentMonth ? 'Overdue' : 'Pending';
};

/**
 * Component that renders a searchable, filterable, and paginated list of students.
 * Premium redesign with refined styling and staggered animations.
 */
const StudentList = ({ students, onEdit, onDelete, onAdd, onPayFee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => {
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        return students
        .filter(student => {
            const matchesSearch = student.name?.toLowerCase().includes(lowerSearchTerm) ||
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
        });
    }, [students, debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, filterMonth, sortBy, sortOrder]);

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
            <div className="card-base p-8 md:p-16 text-center max-w-2xl mx-auto mt-8 spotlight-card">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--accent-primary)]/10">
                    <UserPlus size={32} className="text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">No students yet</h2>
                <p className="text-[var(--text-secondary)] text-sm md:text-base mb-8 leading-relaxed">Start building your database by adding your first student record.</p>
                <button onClick={onAdd} className="btn btn-primary cta-primary mx-auto">
                    <Plus size={18} />
                    <span>Add Student</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:px-8 md:py-6">
            {/* Section header with asymmetrical design */}
            <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="h-6 w-px bg-gradient-to-b from-[var(--accent-primary)]/50 to-transparent hidden sm:block" />
                <h2 className="text-[var(--text-primary)] text-xl font-bold tracking-tight">Student Directory</h2>
            </div>

            <div className="card-base spotlight-card overflow-hidden page-enter flex flex-col mb-10">
                {/* Toolbar with refined styling */}
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <div className="relative flex-1 sm:max-w-md">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-9 pr-4 py-2 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 border rounded-xl transition-all flex items-center justify-center ${
                                    showFilters 
                                        ? 'bg-[var(--accent-light)] border-[var(--accent-primary)]/20 text-[var(--accent-primary)]' 
                                        : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)]'
                                }`}
                                aria-label="Toggle filters"
                                aria-expanded={showFilters}
                                aria-controls="filter-panel"
                            >
                                <Filter size={14} />
                            </button>
                            <button onClick={onAdd} className="btn btn-primary cta-primary hidden md:flex text-sm">
                                <Plus size={14} />
                                <span>Add Student</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div id="filter-panel" className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] grid grid-cols-2 md:grid-cols-5 gap-4 slide-down">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Class</label>
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Section</label>
                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Fee Status</label>
                            <select
                                value={filterFeeStatus}
                                onChange={(e) => setFilterFeeStatus(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option value="">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                             <div className="flex-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Fee Month</label>
                                <div className="h-[38px]">
                                    <CustomMonthPicker
                                        value={filterMonth}
                                        onChange={setFilterMonth}
                                        compact={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-premium w-full"
                                >
                                    <option value="name">Name</option>
                                    <option value="rollNo">Roll No</option>
                                    <option value="class">Class</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)] transition-all h-[38px] w-[38px] flex items-center justify-center"
                                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                {sortOrder === 'asc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3 stagger-children">
                    {currentStudents.length > 0 ? (
                        currentStudents.map((student) => (
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
                        <div className="py-16 text-center border border-[var(--border-subtle)] bg-[var(--bg-main)] rounded-xl">
                            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-14 h-14 flex items-center justify-center mx-auto mb-4 rounded-xl">
                                <Search size={20} className="text-white/30" />
                            </div>
                            <p className="text-[var(--text-primary)] font-semibold text-sm">No results found</p>
                            <p className="text-[var(--text-muted)] text-xs font-mono mt-2 uppercase">Adjust filters or search term</p>
                            <button
                                onClick={handleClearFilters}
                                className="text-[var(--accent-primary)] text-sm font-medium hover:underline mt-4 px-4"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)]">
                                <th className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Student</th>
                                <th className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Class</th>
                                <th className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                            {currentStudents.map((student, idx) => {
                                const status = getFeeStatusForMonth(student, filterMonth);
                                return (
                                    <tr 
                                        key={student.id} 
                                        className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                                        style={{ animation: `fade-in-up-anim 0.3s var(--spring-bounce) both`, animationDelay: `${idx * 30}ms` }}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-[var(--text-primary)] text-sm truncate tracking-tight">{student.name}</p>
                                                    <p className="text-[var(--text-muted)] text-[10px] font-mono mt-0.5 opacity-60">ID: {student.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-[var(--text-primary)] font-medium tracking-tight">Class {student.class} - {student.section}</span>
                                                <span className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">Roll: {student.rollNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                                                        status === 'Paid'
                                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                                            status === 'Overdue'
                                                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                                                                'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                                {Number(student.concessionAmount) > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wider font-mono">
                                                        -{Number(student.concessionAmount)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex gap-2 justify-end opacity-100 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handlePayFeeClick(student)}
                                                    className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all active:scale-95"
                                                    title="Collect Fee" aria-label={`Collect fee for ${student.name}`}
                                                >
                                                    <IndianRupee size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-xl hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all active:scale-95"
                                                    title="Edit Record" aria-label={`Edit record for ${student.name}`}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(student.id)}
                                                    className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all active:scale-95"
                                                    title="Delete Record" aria-label={`Delete record for ${student.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {currentStudents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center bg-[var(--bg-main)]">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                                                <Search size={20} className="text-[var(--text-muted)]" />
                                            </div>
                                            <div>
                                                <p className="text-[var(--text-primary)] font-medium text-sm">No results found</p>
                                                <p className="text-[var(--text-secondary)] text-xs mt-1">Try adjusting your filters or search term</p>
                                            </div>
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-[var(--accent-primary)] text-xs font-medium hover:underline mt-2"
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

                {/* Pagination */}
                <div className="px-5 py-4 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
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