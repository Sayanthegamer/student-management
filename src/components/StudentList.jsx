import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Plus, Filter, UserPlus, X, Zap } from 'lucide-react';
import FeePaymentModal from './FeePaymentModal';
import Pagination from './Pagination';
import ConfirmationModal from './ConfirmationModal';
import StudentCard from './StudentCard';
import useDebounce from '../hooks/useDebounce';

// Sub-components
import FilterPanel from './StudentList/FilterPanel';
import BulkActionsBar from './StudentList/BulkActionsBar';
import StudentTable from './StudentList/StudentTable';

/**
 * Calculates the fee status for a student for a specific month.
 */
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
const StudentList = ({ students, onEdit, onDelete, onAdd, onPayFee, onBulkUpdateStudents }) => {
    // ⚡ Bolt Performance Optimization: Hoist invariant Date calculation out of loops
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [confirmAction, setConfirmAction] = useState(null);
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
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [bulkPending, setBulkPending] = useState(false);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showPaymentModal) return;

            if (e.key === 'Escape' && showFilters) {
                e.preventDefault();
                setShowFilters(false);
                return;
            }

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


    // Bulk Action Handlers
    const toggleStudentSelection = (id) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = (isAllSelected) => {
        const newSelected = new Set(selectedStudents);
        if (isAllSelected) {
            currentStudents.forEach(s => newSelected.delete(s.id));
        } else {
            currentStudents.forEach(s => newSelected.add(s.id));
        }
        setSelectedStudents(newSelected);
    };

    const handleBulkExit = async () => {
        if (!selectedStudents.size) return;
        setConfirmAction('exit');
    };

    const executeBulkExit = async () => {
        setBulkPending(true);
        try {
            if (onBulkUpdateStudents) {
                const updates = Array.from(selectedStudents).map(id => {
                    const student = students.find(s => s.id === id);
                    if (!student) return null;
                    return { ...student, admissionStatus: 'Exited' };
                }).filter(Boolean);

                await onBulkUpdateStudents(updates);
                setSelectedStudents(new Set());
            }
        } catch (error) {
            console.error('Error applying bulk exit:', error);
            alert('Failed to apply bulk exit. Please try again.');
        } finally {
            setBulkPending(false);
            setConfirmAction(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedStudents.size) return;
        setConfirmAction('delete');
    };

    const executeBulkDelete = async () => {
        setBulkPending(true);
        try {
            if (onBulkUpdateStudents) {
                await onBulkUpdateStudents(Array.from(selectedStudents));
            }
            setSelectedStudents(new Set());
        } catch (error) {
            console.error('Error applying bulk delete:', error);
            alert('Failed to apply bulk delete. Please try again.');
        } finally {
            setBulkPending(false);
            setConfirmAction(null);
        }
    };

    // Prune stale selections
    useEffect(() => {
        setSelectedStudents(prevSelected => {
            const currentIds = new Set(students.map(s => s.id));
            const newSelected = new Set();
            for (const id of prevSelected) {
                if (currentIds.has(id)) {
                    newSelected.add(id);
                }
            }
            return newSelected.size === prevSelected.size ? prevSelected : newSelected;
        });
    }, [students]);

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

            const isNotExited = student.admissionStatus !== 'Exited';

            let matchesFeeStatus = true;
            if (filterFeeStatus) {
                const status = getFeeStatusForMonth(student, filterMonth, currentMonth);
                matchesFeeStatus = status === filterFeeStatus;
            }

            return matchesSearch && matchesClass && matchesSection && matchesFeeStatus && isNotExited;
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
    }, [students, debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, filterMonth, sortBy, sortOrder, currentMonth]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, filterMonth]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    const currentStudents = filteredStudents.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
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
        <div className="max-w-6xl mx-auto p-4 md:px-8 md:py-5 min-h-full flex flex-col">
            <div className="flex items-center gap-4 mb-5 mt-1">
                <div className="h-6 w-px bg-gradient-to-b from-[var(--accent-primary)]/60 to-transparent hidden sm:block" />
                <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-tight">Student Directory</h2>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                    {filteredStudents.length} / {students.length}
                </span>
            </div>

            <div className="card-base spotlight-card overflow-clip kinetic-enter flex flex-col mb-8">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-card)]">
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
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded border border-[var(--border-color)] hidden sm:inline">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded border border-[var(--border-color)] hidden sm:inline">K</kbd>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-all flex items-center justify-center touch-target relative ${
                                    showFilters || hasActiveFilters
                                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]' 
                                        : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)]'
                                }`}
                                aria-label="Toggle filters"
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

                {showFilters && (
                    <FilterPanel 
                        filterClass={filterClass} setFilterClass={setFilterClass}
                        filterSection={filterSection} setFilterSection={setFilterSection}
                        filterFeeStatus={filterFeeStatus} setFilterFeeStatus={setFilterFeeStatus}
                        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                        sortBy={sortBy} setSortBy={setSortBy}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        classes={classes} sections={sections}
                        hasActiveFilters={hasActiveFilters} handleClearFilters={handleClearFilters}
                    />
                )}

                {/* Mobile View */}
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
                                isSelected={selectedStudents.has(student.id)}
                                onSelect={() => toggleStudentSelection(student.id)}
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

                <BulkActionsBar 
                    selectedStudents={selectedStudents}
                    bulkPending={bulkPending}
                    handleBulkExit={handleBulkExit}
                    handleBulkDelete={handleBulkDelete}
                    setSelectedStudents={setSelectedStudents}
                />

                <StudentTable 
                    currentStudents={currentStudents}
                    selectedStudents={selectedStudents}
                    handleSelectAll={handleSelectAll}
                    toggleStudentSelection={toggleStudentSelection}
                    getFeeStatusForMonth={getFeeStatusForMonth}
                    filterMonth={filterMonth}
                    currentMonth={currentMonth}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPayFeeClick={handlePayFeeClick}
                />

                {/* Compact Pagination */}
                <div className="px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
                    <Pagination
                        currentPage={safeCurrentPage}
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

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction === 'exit' ? executeBulkExit : executeBulkDelete}
                title={confirmAction === 'exit' ? 'Mark as Exited?' : 'Delete Records?'}
                message={confirmAction === 'exit'
                    ? `Are you sure you want to mark ${selectedStudents.size} student(s) as Exited?`
                    : `WARNING: Are you sure you want to PERMANENTLY DELETE ${selectedStudents.size} student(s)? This action cannot be undone.`
                }
                confirmText={confirmAction === 'exit' ? 'Mark Exited' : 'Delete'}
                isDestructive={confirmAction === 'delete'}
            />
        </div>
    );
};

export default StudentList;
