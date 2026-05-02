import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Edit2, Trash2, Search, Plus, IndianRupee, Filter, ChevronDown, ChevronUp, UserPlus, X, Zap } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';
import CustomMonthPicker from './CustomMonthPicker';
import Pagination from './Pagination';
import StudentCard from './StudentCard';
import useDebounce from '../hooks/useDebounce';

/**
 * Calculates the fee status for a student for a specific month.
 */
// ⚡ Bolt Performance Optimization: Accept hoisted currentMonth to avoid O(N) Date object creations in loops
const getFeeStatusForMonth = (student, month, hoistedCurrentMonth) => {
    const isPaid = student.feeHistory?.some(p => p.month === month);
    if (isPaid) return 'Paid';

    const currentMonth = hoistedCurrentMonth || new Date().toISOString().slice(0, 7);
    return month < currentMonth ? 'Overdue' : 'Pending';
};

/**
 * Lightning-Fast Student Directory - Kinetic Ledger Design
 * High-density data table with instant feedback and keyboard-friendly interactions
 */
const StudentList = ({ students, onEdit, onDelete, onAdd, onPayFee }) => {
    // ⚡ Bolt Performance Optimization: Hoist invariant Date calculation out of loops
    const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 200);
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const searchRef = useRef(null);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't operate shortcuts when payment modal is open
            if (showPaymentModal) return;

            // Handle Escape key first - should work even in editable elements
            if (e.key === 'Escape' && showFilters) {
                e.preventDefault();
                setShowFilters(false);
                return;
            }

            // Ignore events from editable elements for remaining shortcuts
            const target = e.target;
            const isEditableTarget =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                if (isEditableTarget) return;
                e.preventDefault();
                searchRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showFilters, showPaymentModal]);

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
                const status = getFeeStatusForMonth(student, filterMonth, currentMonth);
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
    const itemsPerPage = 12;

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

    const handlePaymentSave = useCallback(async (studentId, paymentDetails) => {
        await onPayFee(studentId, paymentDetails);
        setShowPaymentModal(false);
        setSelectedStudentForFee(null);
    }, [onPayFee]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterClass('');
        setFilterSection('');
        setFilterFeeStatus('');
    }, []);

    const hasActiveFilters = filterClass || filterSection || filterFeeStatus;

    if (students.length === 0) {
        return (
            <div className="card-base p-8 md:p-16 text-center max-w-2xl mx-auto mt-8 spotlight-card kinetic-enter">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--accent-primary)]/10">
                    <UserPlus size={32} className="text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">No records yet</h2>
                <p className="text-[var(--text-secondary)] text-sm md:text-base mb-8 leading-relaxed">Start building your database by adding your first student.</p>
                <button onClick={onAdd} className="btn btn-primary cta-primary mx-auto">
                    <Plus size={18} />
                    <span>Add Student</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:px-8 md:py-5">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-5 mt-1">
                <div className="h-6 w-px bg-gradient-to-b from-[var(--accent-primary)]/60 to-transparent hidden sm:block" />
                <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-tight">Student Directory</h2>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                    {filteredStudents.length} / {students.length}
                </span>
            </div>

            {/* Main card - high density */}
            <div className="card-base spotlight-card overflow-hidden kinetic-enter flex flex-col mb-8">
                {/* Toolbar - optimized for speed */}
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-card)]">
                    {/* Search with keyboard hint */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-9 pr-16 py-2 w-full text-sm"
                            />
                            {/* Keyboard shortcut hint */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded border border-[var(--border-color)] hidden sm:inline">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded border border-[var(--border-color)] hidden sm:inline">K</kbd>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-all flex items-center justify-center touch-target relative ${
                                    showFilters || hasActiveFilters
                                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]' 
                                        : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)]'
                                }`}
                                aria-label="Toggle filters"
                                aria-expanded={showFilters}
                                aria-controls="filter-panel"
                            >
                                <Filter size={14} />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent-primary)] rounded-full" />
                                )}
                            </button>
                            <button onClick={onAdd} className="btn btn-primary cta-primary text-sm py-2 hidden md:flex">
                                <Plus size={14} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slide-out filter panel */}
                {showFilters && (
                    <div id="filter-panel" className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] kinetic-slide">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            <div className="col-span-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Class</label>
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="input-premium w-full text-sm py-2"
                                >
                                    <option value="">All</option>
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Section</label>
                                <select
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                    className="input-premium w-full text-sm py-2"
                                >
                                    <option value="">All</option>
                                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Fee Status</label>
                                <select
                                    value={filterFeeStatus}
                                    onChange={(e) => setFilterFeeStatus(e.target.value)}
                                    className="input-premium w-full text-sm py-2"
                                >
                                    <option value="">All</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Month</label>
                                <CustomMonthPicker
                                    value={filterMonth}
                                    onChange={setFilterMonth}
                                    compact={true}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Sort</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-premium w-full text-sm py-2"
                                >
                                    <option value="name">Name</option>
                                    <option value="rollNo">Roll No</option>
                                    <option value="class">Class</option>
                                </select>
                            </div>
                            <div className="col-span-1 flex items-end gap-2">
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)] transition-all touch-target"
                                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                                >
                                    {sortOrder === 'asc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="p-2 text-[var(--text-muted)] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all touch-target"
                                        title="Clear filters"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-2 stagger-choreograph">
                    {currentStudents.length > 0 ? (
                        currentStudents.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                status={getFeeStatusForMonth(student, filterMonth, currentMonth)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPayFee={handlePayFeeClick}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center border border-[var(--border-subtle)] bg-[var(--bg-main)] rounded-xl">
                            <Search size={20} className="text-[var(--text-muted)] mx-auto mb-3" />
                            <p className="text-[var(--text-primary)] font-semibold text-sm">No results</p>
                            <p className="text-[var(--text-muted)] text-xs mt-1">Adjust filters or search</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View - High Density */}
                <div className="hidden md:block flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)]">
                                <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Details</th>
                                <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider text-center">Status</th>
                                <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                            {currentStudents.map((student, idx) => {
                                const status = getFeeStatusForMonth(student, filterMonth, currentMonth);
                                return (
                                    <tr 
                                        key={student.id} 
                                        className="hover:bg-[var(--bg-card-hover)] group transition-colors"
                                        style={{ animation: `kinetic-enter 0.3s var(--kinetic-curve) both`, animationDelay: `${idx * 25}ms` }}
                                    >
                                        {/* Student Info */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center font-medium text-xs shrink-0"
                                                >
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-[var(--text-primary)] text-sm truncate tracking-tight">{student.name}</p>
                                                    <p className="text-[var(--text-muted)] text-[10px] font-mono mt-0.5 opacity-50">#{student.id.slice(0, 6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Class & Roll */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[var(--text-primary)] font-medium tracking-tight">{student.class}-{student.section}</span>
                                                <span className="text-xs text-[var(--text-muted)] font-mono">#{student.rollNo}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-[5px] ${
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
                                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono">
                                                    -{Number(student.concessionAmount)}
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* Quick Actions */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-1.5 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handlePayFeeClick(student)}
                                                    className="p-1.5 border border-transparent bg-transparent text-[var(--text-muted)] rounded-md hover:bg-[var(--hover-overlay)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-all touch-target"
                                                    title="Collect Fee"
                                                    aria-label={`Collect fee for ${student.name}`}
                                                >
                                                    <IndianRupee size={13} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-1.5 border border-transparent bg-transparent text-[var(--text-muted)] rounded-md hover:bg-[var(--hover-overlay)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-all touch-target"
                                                    title="Edit"
                                                    aria-label={`Edit record for ${student.name}`}
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(student.id)}
                                                    className="p-1.5 border border-transparent bg-transparent text-[var(--text-muted)] rounded-md hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all touch-target"
                                                    title="Delete"
                                                    aria-label={`Delete record for ${student.name}`}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {currentStudents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center bg-[var(--bg-main)]">
                                        <div className="flex flex-col items-center gap-3">
                                            <Zap size={24} className="text-[var(--text-muted)]" />
                                            <p className="text-[var(--text-primary)] font-medium text-sm">No results found</p>
                                            <p className="text-[var(--text-secondary)] text-xs">Try adjusting your filters</p>
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-[var(--accent-primary)] text-xs font-medium hover:underline mt-1"
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

                {/* Compact Pagination */}
                <div className="px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
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